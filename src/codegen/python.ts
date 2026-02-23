import type { Node, Edge } from "reactflow";

type OutEdge = { target: string; sourceHandle?: string | null; label?: string };

function splitCSV(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

function normalizePythonExpr(expr: string): string {
  let s = expr.trim();

  // common math helpers
  // sqrt(x) -> math.sqrt(x)
  s = s.replace(/\bsqrt\s*\(/g, "math.sqrt(");

  // caret ^ is often used by humans, but Python uses **
  s = s.replace(/\^/g, "**");

  return s;
}

function normalizeCondPython(cond: string): string {
  let s = cond.trim();

  // unicode comparisons
  s = s.replaceAll("≤", "<=").replaceAll("≥", ">=").replaceAll("≠", "!=");

  // replace single "=" with "==", but not <= >= != ==
  s = s.replace(/(?<![<>=!])=(?![=])/g, "==");

  return normalizePythonExpr(s);
}

function indentLines(code: string, level: number): string {
  const pad = "    ".repeat(level);
  return code
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}

function buildMaps(nodes: Node[], edges: Edge[]) {
  const nodeById = new Map<string, Node>();
  for (const n of nodes) nodeById.set(n.id, n);

  const out = new Map<string, OutEdge[]>();
  for (const e of edges) {
    if (!e.source || !e.target) continue;
    const arr = out.get(e.source) ?? [];
    arr.push({ target: String(e.target), sourceHandle: (e as any).sourceHandle ?? null, label: (e as any).label });
    out.set(String(e.source), arr);
  }

  return { nodeById, out };
}

function getSingleNext(out: Map<string, OutEdge[]>, id: string): string | null {
  const arr = out.get(id) ?? [];
  if (arr.length === 0) return null;
  // prefer unlabeled/unhandled "next-like"
  const preferred =
    arr.find((e) => !e.sourceHandle) ??
    arr.find((e) => e.sourceHandle === "next") ??
    arr[0];
  return preferred ? preferred.target : null;
}

function getByHandle(out: Map<string, OutEdge[]>, id: string, handle: string): string | null {
  const arr = out.get(id) ?? [];
  const e = arr.find((x) => x.sourceHandle === handle);
  return e ? e.target : null;
}

function bfsDistances(out: Map<string, OutEdge[]>, start: string, stopSet: Set<string>): Map<string, number> {
  const dist = new Map<string, number>();
  const q: string[] = [];
  dist.set(start, 0);
  q.push(start);

  while (q.length) {
    const u = q.shift()!;
    if (stopSet.has(u)) continue;
    const du = dist.get(u)!;
    for (const e of out.get(u) ?? []) {
      const v = e.target;
      if (!dist.has(v)) {
        dist.set(v, du + 1);
        q.push(v);
      }
    }
  }
  return dist;
}

function findMerge(
  out: Map<string, OutEdge[]>,
  thenStart: string | null,
  elseStart: string | null,
  stopSet: Set<string>
): string | null {
  if (!thenStart || !elseStart) return null;
  const d1 = bfsDistances(out, thenStart, stopSet);
  const d2 = bfsDistances(out, elseStart, stopSet);

  let best: { id: string; score: number } | null = null;
  for (const [id, a] of d1.entries()) {
    const b = d2.get(id);
    if (b === undefined) continue;
    const score = a + b;
    if (!best || score < best.score) best = { id, score };
  }
  return best ? best.id : null;
}

type EmitResult = { code: string; nextId: string | null; needsMath: boolean };

function emitOne(
  nodeById: Map<string, Node>,
  out: Map<string, OutEdge[]>,
  id: string,
  indent: number,
  stopSet: Set<string>,
  visitGuard: Set<string>
): EmitResult {
  const node = nodeById.get(id);
  if (!node) {
    return { code: indentLines(`# [missing node ${id}]`, indent), nextId: null, needsMath: false };
  }

  // cycle guard (for accidental cycles)
  const key = `${id}@${indent}`;
  if (visitGuard.has(key)) {
    return { code: indentLines(`# [cycle detected at ${id}]`, indent), nextId: null, needsMath: false };
  }
  visitGuard.add(key);

  const t = String(node.type);
  const data: any = node.data ?? {};

  // helper: does this node text require math import?
  const hasSqrt = (s: string) => /\bsqrt\s*\(/.test(s);

  if (t === "start") {
    const nx = getSingleNext(out, id);
    return { code: "", nextId: nx, needsMath: false };
  }

  if (t === "end") {
    return { code: "", nextId: null, needsMath: false };
  }

  if (t === "return") {
    const v = String(data.value ?? "").trim();
    const line = v.length ? `return ${normalizePythonExpr(v)}` : "return";
    return { code: indentLines(line, indent), nextId: null, needsMath: hasSqrt(v) };
  }

  if (t === "note") {
    const txt = String(data.text ?? "").trim();
    const line = txt.length ? `# ${txt}` : "#";
    const nx = getSingleNext(out, id);
    return { code: indentLines(line, indent), nextId: nx, needsMath: false };
  }

  if (t === "process") {
    const stmt = String(data.stmt ?? "").trim() || "pass";
    const nx = getSingleNext(out, id);
    return { code: indentLines(normalizePythonExpr(stmt), indent), nextId: nx, needsMath: hasSqrt(stmt) };
  }

  if (t === "input") {
    const vars = splitCSV(String(data.vars ?? ""));
    const cast = String(data.cast ?? "float").trim(); // float|int|str|raw
    const lines: string[] = [];
    for (const v of vars) {
      if (cast === "raw") lines.push(`${v} = input("${v}: ")`);
      else lines.push(`${v} = ${cast}(input("${v}: "))`);
    }
    const nx = getSingleNext(out, id);
    return { code: indentLines(lines.join("\n") || "pass", indent), nextId: nx, needsMath: false };
  }

  if (t === "output") {
    const value = String(data.value ?? "").trim();
    const line = value.length ? `print(${normalizePythonExpr(value)})` : "print()";
    const nx = getSingleNext(out, id);
    return { code: indentLines(line, indent), nextId: nx, needsMath: hasSqrt(value) };
  }

  if (t === "call") {
    const name = String(data.name ?? "S").trim();
    const argsRaw = String(data.args ?? "").trim();
    const assignTo = String(data.assignTo ?? "").trim();

    const args = argsRaw.length ? argsRaw.split(",").map((x) => normalizePythonExpr(x.trim())).join(", ") : "";
    const expr = `${name}(${args})`;
    const line = assignTo.length ? `${assignTo} = ${expr}` : expr;

    const nx = getSingleNext(out, id);
    return { code: indentLines(line, indent), nextId: nx, needsMath: hasSqrt(argsRaw) };
  }

  if (t === "decision") {
    const condRaw = String(data.cond ?? "False");
    const cond = normalizeCondPython(condRaw);

    const thenStart = getByHandle(out, id, "t");
    const elseStart = getByHandle(out, id, "f");

    const merge = findMerge(out, thenStart, elseStart, stopSet);

    const stopThen = new Set(stopSet);
    if (merge) stopThen.add(merge);
    const stopElse = new Set(stopSet);
    if (merge) stopElse.add(merge);

    const thenRes = emitBlock(nodeById, out, thenStart, indent + 1, stopThen, visitGuard);
    const elseRes = emitBlock(nodeById, out, elseStart, indent + 1, stopElse, visitGuard);

    const thenCode = thenRes.code.trim().length ? thenRes.code : indentLines("pass", indent + 1);
    const elseCode = elseRes.code.trim().length ? elseRes.code : indentLines("pass", indent + 1);

    const ifLines = [
      indentLines(`if ${cond}:`, indent),
      thenCode,
      indentLines(`else:`, indent),
      elseCode,
    ].join("\n");

    return { code: ifLines, nextId: merge, needsMath: hasSqrt(condRaw) || thenRes.needsMath || elseRes.needsMath };
  }

  if (t === "loop") {
    const kind = String(data.kind ?? "for"); // for|while
    const bodyStart = getByHandle(out, id, "body");
    const afterLoop = getByHandle(out, id, "next");

    // Loop body must come back to the loop node (a back-edge to this loop node)
    const stopBody = new Set(stopSet);
    stopBody.add(id);

    let head = "while True:";
    let needsMath = false;

    if (kind === "while") {
      const condRaw = String(data.cond ?? "True");
      const cond = normalizeCondPython(condRaw);
      head = `while ${cond}:`;
      needsMath = /\bsqrt\s*\(/.test(condRaw);
    } else {
      // for
      const v = String(data.var ?? "i");
      const start = normalizePythonExpr(String(data.start ?? "0"));
      const end = normalizePythonExpr(String(data.end ?? "n"));
      const step = normalizePythonExpr(String(data.step ?? "1"));

      // inclusive end (matches typical flowchart "1..n")
      const endInc = `(${end}) + 1`;
      head = step === "1" ? `for ${v} in range(${start}, ${endInc}):` : `for ${v} in range(${start}, ${endInc}, ${step}):`;

      needsMath = /\bsqrt\s*\(/.test(String(data.start ?? "")) || /\bsqrt\s*\(/.test(String(data.end ?? "")) || /\bsqrt\s*\(/.test(String(data.step ?? ""));
    }

    const bodyRes = emitBlock(nodeById, out, bodyStart, indent + 1, stopBody, visitGuard);
    const bodyCode = bodyRes.code.trim().length ? bodyRes.code : indentLines("pass", indent + 1);

    const loopCode = [indentLines(head, indent), bodyCode].join("\n");

    // continue after loop
    return { code: loopCode, nextId: afterLoop, needsMath: needsMath || bodyRes.needsMath };
  }

  // fallback
  const nx = getSingleNext(out, id);
  return { code: indentLines(`# [unhandled node type: ${t}]`, indent), nextId: nx, needsMath: false };
}

function emitBlock(
  nodeById: Map<string, Node>,
  out: Map<string, OutEdge[]>,
  startId: string | null,
  indent: number,
  stopSet: Set<string>,
  visitGuard: Set<string>
): { code: string; endId: string | null; needsMath: boolean } {
  let cur = startId;
  const lines: string[] = [];
  let needsMath = false;

  let steps = 0;
  const MAX_STEPS = 2000;

  while (cur && !stopSet.has(cur) && steps < MAX_STEPS) {
    const r = emitOne(nodeById, out, cur, indent, stopSet, visitGuard);
    if (r.code.trim().length) lines.push(r.code);
    needsMath = needsMath || r.needsMath;
    cur = r.nextId;
    steps++;
  }

  if (steps >= MAX_STEPS) lines.push(indentLines("# [stopped: too many steps]", indent));

  return { code: lines.join("\n"), endId: cur, needsMath };
}

export function generatePython(nodes: Node[], edges: Edge[]): string {
  const { nodeById, out } = buildMaps(nodes, edges);

  const start = nodes.find((n) => String(n.type) === "start")?.id ?? null;
  if (!start) return "# No Start node found";

  const visitGuard = new Set<string>();
  const stopSet = new Set<string>(); // global stops (none for now)

  const body = emitBlock(nodeById, out, start, 1, stopSet, visitGuard);

  // detect if math needed
  const needsMath = body.needsMath || nodes.some((n) => {
    const d: any = n.data ?? {};
    const fields = [d.stmt, d.cond, d.value, d.args, d.start, d.end, d.step].filter(Boolean).join(" ");
    return /\bmath\./.test(fields) || /\bsqrt\s*\(/.test(fields);
  });

  const header: string[] = [];
  if (needsMath) header.push("import math");
  header.push("def program():");
  header.push(body.code.trim().length ? body.code : "    pass");
  header.push("");
  header.push('if __name__ == "__main__":');
  header.push("    program()");
  header.push("");

  return header.join("\n");
}
