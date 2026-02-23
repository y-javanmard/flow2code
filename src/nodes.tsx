import React from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";

import { useStore } from "./store";
import { useNodeRegistry } from "./registry";
import type { NodeRef } from "./registry";

type AnyData = Record<string, any>;

/* ─── Semantic Color Palette ─── */
export const palette = {
  terminator: { border: "#059669", bg: "rgba(16,185,129,0.12)", accent: "#059669", handle: "#059669", label: "Start / End" },
  process:    { border: "#2563eb", bg: "rgba(59,130,246,0.08)", accent: "#2563eb", handle: "#2563eb", label: "Process" },
  decision:   { border: "#d97706", bg: "rgba(245,158,11,0.10)", accent: "#d97706", handle: "#d97706", label: "Decision" },
  io:         { border: "#7c3aed", bg: "rgba(139,92,246,0.08)", accent: "#7c3aed", handle: "#7c3aed", label: "I/O" },
  loop:       { border: "#dc2626", bg: "rgba(239,68,68,0.07)", accent: "#dc2626", handle: "#dc2626", label: "Loop" },
  definition: { border: "#0891b2", bg: "rgba(6,182,212,0.07)", accent: "#0891b2", handle: "#0891b2", label: "Definition" },
  comment:    { border: "#ca8a04", bg: "rgba(253,224,71,0.25)", accent: "#ca8a04", handle: "#ca8a04", label: "Comment" },
  trycatch:   { border: "#be185d", bg: "rgba(236,72,153,0.07)", accent: "#be185d", handle: "#be185d", label: "Try / Catch" },
  domain:     { border: "#6366f1", bg: "rgba(99,102,241,0.07)", accent: "#6366f1", handle: "#6366f1", label: "Domain" },
} as const;

/* ─── Shared helpers ─── */
function useUpdate() {
  const updateNodeData = useStore((s: any) => s.updateNodeData);
  return updateNodeData as (id: string, patch: AnyData) => void;
}

function boxStyle(data: AnyData, fw: number, fh?: number): React.CSSProperties {
  const w = typeof data?.w === "number" ? data.w : fw;
  const h = typeof data?.h === "number" ? data.h : fh;
  return { width: w, height: h };
}

const mono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

function labelInputStyle(color?: string): React.CSSProperties {
  return { width: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontWeight: 800, fontSize: 13, color: color ?? "inherit", fontFamily: mono };
}

function smallInputStyle(): React.CSSProperties {
  return { width: "100%", border: "1px solid rgba(0,0,0,0.12)", outline: "none", borderRadius: 8, padding: "5px 8px", background: "rgba(255,255,255,0.92)", fontFamily: mono, fontSize: 12 };
}

function NodeFrame({ id, selected, minW = 140, minH = 60 }: { id: string; selected: boolean; minW?: number; minH?: number }) {
  const update = useUpdate();
  return <NodeResizer isVisible={selected} minWidth={minW} minHeight={minH} onResizeEnd={(_e, p) => update(id, { w: p.width, h: p.height, userSized: true })} handleStyle={{ width: 10, height: 10 }} />;
}

function hStyle(color: string): React.CSSProperties {
  return { width: 10, height: 10, background: color, border: `2px solid ${color}` };
}

function Badge({ text, color }: { text: string; color: string }) {
  return <div style={{ fontSize: 9, fontWeight: 900, color: "white", background: color, borderRadius: 6, padding: "2px 8px", textTransform: "uppercase", letterSpacing: 0.8, width: "fit-content", margin: "0 auto" }}>{text}</div>;
}

function MiniBtn({ onClick, children, color = "#888", dashed = false }: { onClick: () => void; children: React.ReactNode; color?: string; dashed?: boolean }) {
  return <button onClick={onClick} style={{ border: dashed ? `1px dashed ${color}` : "none", borderRadius: 6, background: dashed ? "none" : "transparent", cursor: "pointer", fontSize: 11, padding: "2px 6px", color, fontWeight: 700 }}>{children}</button>;
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontWeight: 900, fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>;
}

/* ─── RefSelect: dropdown that picks from other nodes ─── */
function RefSelect({ value, onChange, selfId, filterKinds, placeholder = "Pick…", color = "#666" }: {
  value: string; onChange: (v: string) => void; selfId: string; filterKinds?: string[]; placeholder?: string; color?: string;
}) {
  const registry = useNodeRegistry();
  const opts = registry.filter((r) => {
    if (r.id === selfId) return false;
    if (filterKinds && filterKinds.length) return filterKinds.includes(r.kind);
    return true;
  });

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...smallInputStyle(), fontSize: 11, color: value ? color : "#999", padding: "3px 6px" }}
    >
      <option value="">{placeholder}</option>
      {opts.map((o) => (
        <option key={o.id} value={o.name}>
          {o.kind}: {o.name}
        </option>
      ))}
    </select>
  );
}

/* ═══════════════════════════════════════════════
   TERMINATOR
   ═══════════════════════════════════════════════ */
export function TerminatorNode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();
  const p = palette.terminator;
  return (
    <div style={{ ...boxStyle(data, 200, 56), border: `2.5px solid ${p.border}`, borderRadius: 999, background: p.bg, display: "grid", placeItems: "center", padding: "6px 16px", position: "relative", boxShadow: selected ? `0 0 0 3px ${p.border}33` : "0 2px 8px rgba(0,0,0,0.06)" }}>
      <NodeFrame id={id} selected={!!selected} minW={140} minH={44} />
      <Handle type="target" position={Position.Top} style={hStyle(p.handle)} />
      <Handle type="source" position={Position.Bottom} style={hStyle(p.handle)} />
      <input style={labelInputStyle(p.accent)} value={String(data?.title ?? "start")} onChange={(e) => update(id, { title: e.target.value })} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROCESS
   ═══════════════════════════════════════════════ */
export function ProcessNode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();
  const p = palette.process;
  return (
    <div style={{ ...boxStyle(data, 240, 80), border: `2.5px solid ${p.border}`, borderRadius: 12, background: p.bg, padding: 10, position: "relative", boxShadow: selected ? `0 0 0 3px ${p.border}33` : "0 2px 8px rgba(0,0,0,0.06)" }}>
      <NodeFrame id={id} selected={!!selected} minW={160} minH={60} />
      <Handle type="target" position={Position.Top} style={hStyle(p.handle)} />
      <Handle type="source" position={Position.Bottom} style={hStyle(p.handle)} />
      <Badge text="Process" color={p.accent} />
      <textarea style={{ ...smallInputStyle(), height: "calc(100% - 22px)", resize: "none", marginTop: 6 }} placeholder="e.g. sum = sum + i" value={String(data?.stmt ?? "")} onChange={(e) => update(id, { stmt: e.target.value })} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DECISION
   ═══════════════════════════════════════════════ */
export function DecisionNode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();
  const p = palette.decision;
  return (
    <div style={{ ...boxStyle(data, 220, 140), position: "relative" }}>
      <NodeFrame id={id} selected={!!selected} minW={180} minH={120} />
      <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: "absolute", inset: 0 }}>
        <path d="M110 6 L214 70 L110 134 L6 70 Z" fill={p.bg} stroke={p.border} strokeWidth="2.5" />
      </svg>
      <Handle type="target" position={Position.Top} style={hStyle(p.handle)} />
      <Handle type="source" position={Position.Left} id="t" style={{ ...hStyle("#059669"), background: "#059669" }} />
      <Handle type="source" position={Position.Right} id="f" style={{ ...hStyle("#ef4444"), background: "#ef4444" }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: "0 30px" }}>
        <input style={{ ...labelInputStyle(p.accent), fontWeight: 900 }} placeholder="e.g. x > 0" value={String(data?.cond ?? "")} onChange={(e) => update(id, { cond: e.target.value })} />
      </div>
      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 900, color: "#059669", background: "rgba(255,255,255,0.85)", borderRadius: 4, padding: "1px 4px" }}>T</div>
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 900, color: "#ef4444", background: "rgba(255,255,255,0.85)", borderRadius: 4, padding: "1px 4px" }}>F</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   IO
   ═══════════════════════════════════════════════ */
export function IONode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();
  const p = palette.io;
  const kind = String(data?.kind ?? "Input");
  const text = kind === "Input" ? String(data?.vars ?? "") : String(data?.expr ?? "");
  return (
    <div style={{ ...boxStyle(data, 240, 80), position: "relative" }}>
      <NodeFrame id={id} selected={!!selected} minW={180} minH={60} />
      <svg width="100%" height="100%" viewBox="0 0 240 80" style={{ position: "absolute", inset: 0 }}>
        <path d="M20 4 H236 L220 76 H4 Z" fill={p.bg} stroke={p.border} strokeWidth="2.5" />
      </svg>
      <Handle type="target" position={Position.Top} style={hStyle(p.handle)} />
      <Handle type="source" position={Position.Bottom} style={hStyle(p.handle)} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: "8px 24px" }}>
        <Badge text={kind} color={p.accent} />
        <input style={{ ...labelInputStyle(p.accent), marginTop: 4 }} placeholder={kind === "Input" ? "A, B, C" : "x1, x2"} value={text} onChange={(e) => update(id, kind === "Input" ? { vars: e.target.value } : { expr: e.target.value })} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LOOP
   ═══════════════════════════════════════════════ */
export function LoopNode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();
  const p = palette.loop;
  return (
    <div style={{ ...boxStyle(data, 260, 110), position: "relative" }}>
      <NodeFrame id={id} selected={!!selected} minW={220} minH={90} />
      <svg width="100%" height="100%" viewBox="0 0 260 110" style={{ position: "absolute", inset: 0 }}>
        <path d="M20 55 L45 12 H215 L240 55 L215 98 H45 Z" fill={p.bg} stroke={p.border} strokeWidth="2.5" />
      </svg>
      <Handle type="target" position={Position.Top} id="enter" style={hStyle(p.handle)} />
      <Handle type="source" position={Position.Bottom} id="exit" style={hStyle(p.handle)} />
      <Handle type="source" position={Position.Right} id="body" style={{ ...hStyle("#059669"), background: "#059669", top: "62%" }} />
      <Handle type="target" position={Position.Right} id="back" style={{ ...hStyle("#2563eb"), background: "#2563eb", top: "35%" }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: "10px 40px" }}>
        <Badge text="Loop" color={p.accent} />
        <input style={labelInputStyle(p.accent)} value={String(data?.spec ?? "i=1..n")} onChange={(e) => update(id, { spec: e.target.value })} />
      </div>
      <div style={{ position: "absolute", right: 14, top: 8, fontSize: 9, fontWeight: 900, color: "#2563eb", background: "rgba(255,255,255,0.85)", borderRadius: 4, padding: "1px 4px" }}>REPEAT</div>
      <div style={{ position: "absolute", right: 14, bottom: 8, fontSize: 9, fontWeight: 900, color: "#059669", background: "rgba(255,255,255,0.85)", borderRadius: 4, padding: "1px 4px" }}>DO</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DEFINITION — unified (Function/Class/Struct/Enum/Interface)
   Uses RefSelect for "extends" field
   ═══════════════════════════════════════════════ */
const defKinds = ["function", "class", "struct", "enum", "interface"] as const;
type DefKind = (typeof defKinds)[number];

export const defKindColors: Record<DefKind, string> = {
  function: "#0891b2", class: "#7c3aed", struct: "#0d9488", enum: "#c026d3", interface: "#0369a1",
};

export function DefinitionNode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();

  const kind: DefKind = defKinds.includes(data?.defKind) ? data.defKind : "function";
  const kColor = defKindColors[kind];
  const name = String(data?.name ?? "myFunc");
  const parent = String(data?.parent ?? "");
  const returnType = String(data?.returnType ?? "");
  const body = String(data?.body ?? "");

  const params: { name: string; type: string; default: string }[] = Array.isArray(data?.params) ? data.params : [];
  const attrs: { name: string; type: string; default: string; visibility: string }[] = Array.isArray(data?.attrs) ? data.attrs : [];
  const methods: { name: string; params: string; returnType: string; visibility: string }[] = Array.isArray(data?.methods) ? data.methods : [];
  const values: { name: string; value: string }[] = Array.isArray(data?.values) ? data.values : [];

  const showAttrs = kind === "class" || kind === "struct" || kind === "interface";
  const showMethods = kind === "class" || kind === "interface";
  const showParams = kind === "function";
  const showEnum = kind === "enum";
  const showBody = kind === "function";
  const showParent = kind === "class" || kind === "interface";
  const showReturn = kind === "function";

  function updParam(i: number, k: string, v: string) { const n = params.map((p, j) => j === i ? { ...p, [k]: v } : p); update(id, { params: n }); }
  function updAttr(i: number, k: string, v: string) { const n = attrs.map((a, j) => j === i ? { ...a, [k]: v } : a); update(id, { attrs: n }); }
  function updMethod(i: number, k: string, v: string) { const n = methods.map((m, j) => j === i ? { ...m, [k]: v } : m); update(id, { methods: n }); }
  function updValue(i: number, k: string, v: string) { const n = values.map((e, j) => j === i ? { ...e, [k]: v } : e); update(id, { values: n }); }

  return (
    <div style={{
      ...boxStyle(data, 310, kind === "function" ? 260 : 340),
      position: "relative", border: `2.5px solid ${kColor}`, borderRadius: 14,
      background: `${kColor}08`, boxShadow: selected ? `0 0 0 3px ${kColor}33` : "0 2px 10px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <NodeFrame id={id} selected={!!selected} minW={260} minH={180} />
      <Handle type="target" position={Position.Top} style={hStyle(kColor)} />
      <Handle type="source" position={Position.Bottom} style={hStyle(kColor)} />

      {/* Header */}
      <div style={{ padding: "8px 12px", background: `${kColor}15`, borderBottom: `2px solid ${kColor}30`, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 6 }}>
          {defKinds.map((k) => (
            <button key={k} onClick={() => update(id, { defKind: k })} style={{
              fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 6,
              border: kind === k ? `2px solid ${defKindColors[k]}` : "1px solid rgba(0,0,0,0.10)",
              background: kind === k ? defKindColors[k] : "rgba(255,255,255,0.8)",
              color: kind === k ? "white" : "#666", cursor: "pointer", textTransform: "uppercase",
            }}>{k}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: showParent || showReturn ? "1fr 100px" : "1fr", gap: 6 }}>
          <input style={{ ...smallInputStyle(), fontWeight: 800, textAlign: "center", fontSize: 13 }} value={name} placeholder="Name" onChange={(e) => update(id, { name: e.target.value })} />
          {showParent && (
            <RefSelect
              value={parent}
              onChange={(v) => update(id, { parent: v })}
              selfId={id}
              filterKinds={["class", "interface"]}
              placeholder="extends…"
              color={kColor}
            />
          )}
          {showReturn && <input style={{ ...smallInputStyle(), fontSize: 11 }} value={returnType} placeholder="→ type" onChange={(e) => update(id, { returnType: e.target.value })} />}
        </div>
      </div>

      {/* Params (function) */}
      {showParams && (
        <div style={{ padding: "6px 12px", borderBottom: `1.5px solid ${kColor}20`, flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: kColor, marginBottom: 4, textTransform: "uppercase" }}>Parameters</div>
          <div style={{ display: "grid", gap: 3, maxHeight: 80, overflowY: "auto" }}>
            {params.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 18px", gap: 3, alignItems: "center" }}>
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "3px 6px" }} placeholder="name" value={p.name} onChange={(e) => updParam(i, "name", e.target.value)} />
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "3px 6px" }} placeholder="type" value={p.type} onChange={(e) => updParam(i, "type", e.target.value)} />
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "3px 6px" }} placeholder="default" value={p.default} onChange={(e) => updParam(i, "default", e.target.value)} />
                <RemoveBtn onClick={() => update(id, { params: params.filter((_, j) => j !== i) })} />
              </div>
            ))}
            <MiniBtn onClick={() => update(id, { params: [...params, { name: "", type: "", default: "" }] })} color={kColor} dashed>+ param</MiniBtn>
          </div>
        </div>
      )}

      {/* Attrs */}
      {showAttrs && (
        <div style={{ padding: "6px 12px", borderBottom: `1.5px solid ${kColor}20`, flexShrink: 0, maxHeight: "35%", overflowY: "auto" }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: kColor, marginBottom: 4, textTransform: "uppercase" }}>Attributes</div>
          <div style={{ display: "grid", gap: 3 }}>
            {attrs.map((a, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 1fr 1fr 18px", gap: 3, alignItems: "center" }}>
                <select style={{ ...smallInputStyle(), fontSize: 11, padding: "2px", textAlign: "center" }} value={a.visibility} onChange={(e) => updAttr(i, "visibility", e.target.value)}>
                  <option value="+">+</option><option value="-">−</option><option value="#">#</option>
                </select>
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "2px 4px" }} placeholder="name" value={a.name} onChange={(e) => updAttr(i, "name", e.target.value)} />
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "2px 4px" }} placeholder="type" value={a.type} onChange={(e) => updAttr(i, "type", e.target.value)} />
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "2px 4px" }} placeholder="default" value={a.default} onChange={(e) => updAttr(i, "default", e.target.value)} />
                <RemoveBtn onClick={() => update(id, { attrs: attrs.filter((_, j) => j !== i) })} />
              </div>
            ))}
            <MiniBtn onClick={() => update(id, { attrs: [...attrs, { name: "", type: "", default: "", visibility: "+" }] })} color={kColor} dashed>+ attribute</MiniBtn>
          </div>
        </div>
      )}

      {/* Methods */}
      {showMethods && (
        <div style={{ padding: "6px 12px", borderBottom: `1.5px solid ${kColor}20`, flex: 1, overflowY: "auto", minHeight: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: kColor, marginBottom: 4, textTransform: "uppercase" }}>Methods</div>
          <div style={{ display: "grid", gap: 3 }}>
            {methods.map((m, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 1fr 1fr 18px", gap: 3, alignItems: "center" }}>
                <select style={{ ...smallInputStyle(), fontSize: 11, padding: "2px", textAlign: "center" }} value={m.visibility} onChange={(e) => updMethod(i, "visibility", e.target.value)}>
                  <option value="+">+</option><option value="-">−</option><option value="#">#</option>
                </select>
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "2px 4px" }} placeholder="name" value={m.name} onChange={(e) => updMethod(i, "name", e.target.value)} />
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "2px 4px" }} placeholder="params" value={m.params} onChange={(e) => updMethod(i, "params", e.target.value)} />
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "2px 4px" }} placeholder="→ type" value={m.returnType} onChange={(e) => updMethod(i, "returnType", e.target.value)} />
                <RemoveBtn onClick={() => update(id, { methods: methods.filter((_, j) => j !== i) })} />
              </div>
            ))}
            <MiniBtn onClick={() => update(id, { methods: [...methods, { name: "", params: "", returnType: "", visibility: "+" }] })} color={kColor} dashed>+ method</MiniBtn>
          </div>
        </div>
      )}

      {/* Enum values */}
      {showEnum && (
        <div style={{ padding: "6px 12px", flex: 1, overflowY: "auto", minHeight: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: kColor, marginBottom: 4, textTransform: "uppercase" }}>Values</div>
          <div style={{ display: "grid", gap: 3 }}>
            {values.map((v, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 18px", gap: 3, alignItems: "center" }}>
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "3px 6px" }} placeholder="NAME" value={v.name} onChange={(e) => updValue(i, "name", e.target.value)} />
                <input style={{ ...smallInputStyle(), fontSize: 11, padding: "3px 6px" }} placeholder="= value" value={v.value} onChange={(e) => updValue(i, "value", e.target.value)} />
                <RemoveBtn onClick={() => update(id, { values: values.filter((_, j) => j !== i) })} />
              </div>
            ))}
            <MiniBtn onClick={() => update(id, { values: [...values, { name: "", value: "" }] })} color={kColor} dashed>+ value</MiniBtn>
          </div>
        </div>
      )}

      {/* Body (function) */}
      {showBody && (
        <div style={{ padding: "6px 12px", flex: 1, minHeight: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: kColor, marginBottom: 4, textTransform: "uppercase" }}>Body</div>
          <textarea style={{ ...smallInputStyle(), resize: "none", height: "calc(100% - 20px)", fontSize: 11 }} placeholder="return x * 2" value={body} onChange={(e) => update(id, { body: e.target.value })} />
        </div>
      )}

      {/* Sig preview */}
      {kind === "function" && (
        <div style={{ padding: "4px 12px 6px", borderTop: `1.5px solid ${kColor}20`, textAlign: "center", fontWeight: 800, fontSize: 10, color: kColor, fontFamily: mono, background: `${kColor}08`, flexShrink: 0 }}>
          {name}({params.map(p => p.name + (p.type ? `:${p.type}` : "") + (p.default ? `=${p.default}` : "")).join(", ")}){returnType ? ` → ${returnType}` : ""}
        </div>
      )}

      {/* Class/Struct preview */}
      {(kind === "class" || kind === "struct" || kind === "interface") && name && (
        <div style={{ padding: "4px 12px 6px", borderTop: `1.5px solid ${kColor}20`, textAlign: "center", fontWeight: 800, fontSize: 10, color: kColor, fontFamily: mono, background: `${kColor}08`, flexShrink: 0 }}>
          {kind} {name}{parent ? ` extends ${parent}` : ""} — {attrs.length} attrs, {methods.length} methods
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DOMAIN NODE — for preset templates (NN layers, etc.)
   Auto-sizing card with icon, editable params, typed ports
   ═══════════════════════════════════════════════ */
export function DomainNode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();

  const label = String(data?.label ?? "Node");
  const icon = String(data?.icon ?? "📦");
  const color = String(data?.color ?? "#6366f1");
  const desc = String(data?.desc ?? "");
  const instanceName = String(data?.instanceName ?? "");
  const presetParams: { name: string; type: string; default: string }[] = Array.isArray(data?.presetParams) ? data.presetParams : [];
  const paramValues: Record<string, string> = data?.paramValues ?? {};
  const inputTypes: string[] = Array.isArray(data?.inputTypes) ? data.inputTypes : [];
  const outputType = String(data?.outputType ?? "any");

  function setParamValue(pName: string, val: string) {
    update(id, { paramValues: { ...paramValues, [pName]: val } });
  }

  // Use width from data but let height be auto
  const w = typeof data?.w === "number" ? data.w : 260;

  return (
    <div style={{
      width: w,
      minHeight: 80,
      border: `2.5px solid ${color}`,
      borderRadius: 14,
      background: `${color}0a`,
      boxShadow: selected ? `0 0 0 3px ${color}33` : "0 2px 10px rgba(0,0,0,0.06)",
      position: "relative",
    }}>
      <NodeFrame id={id} selected={!!selected} minW={200} minH={80} />

      {/* Handles */}
      <Handle type="target" position={Position.Top} style={hStyle(color)} />
      <Handle type="source" position={Position.Bottom} style={hStyle(color)} />
      {inputTypes.length > 1 && (
        <Handle type="target" position={Position.Left} id="aux" style={{ ...hStyle(color), top: "50%" }} />
      )}

      {/* Header — colored bar with icon + label */}
      <div style={{
        padding: "8px 12px",
        background: `${color}18`,
        borderBottom: `2px solid ${color}30`,
        borderRadius: "12px 12px 0 0",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color }}>{label}</div>
          {desc && <div style={{ fontSize: 10, color: "#666", marginTop: 1, lineHeight: 1.2 }}>{desc}</div>}
        </div>
        <div style={{
          fontSize: 9, fontWeight: 800, color: "white",
          background: color, borderRadius: 6, padding: "2px 8px",
          textTransform: "uppercase", letterSpacing: 0.5,
        }}>{outputType}</div>
      </div>

      {/* Instance name */}
      <div style={{ padding: "8px 12px 4px" }}>
        <input
          style={{ ...smallInputStyle(), fontSize: 12, padding: "5px 8px", fontWeight: 700 }}
          placeholder="Instance name (optional)"
          value={instanceName}
          onChange={(e) => update(id, { instanceName: e.target.value })}
        />
      </div>

      {/* Parameters — each with label and input */}
      {presetParams.length > 0 && (
        <div style={{ padding: "4px 12px 8px" }}>
          <div style={{ fontSize: 9, fontWeight: 900, color, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Parameters</div>
          <div style={{ display: "grid", gap: 6 }}>
            {presetParams.map((p) => (
              <div key={p.name}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#555", marginBottom: 2 }}>
                  {p.name} <span style={{ opacity: 0.5, fontWeight: 600 }}>({p.type})</span>
                </div>
                {p.type === "ref" ? (
                  <RefSelect
                    value={paramValues[p.name] ?? p.default}
                    onChange={(v) => setParamValue(p.name, v)}
                    selfId={id}
                    placeholder="Pick node…"
                    color={color}
                  />
                ) : (
                  <input
                    style={{ ...smallInputStyle(), fontSize: 12, padding: "5px 8px" }}
                    value={paramValues[p.name] ?? p.default}
                    onChange={(e) => setParamValue(p.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Type badges at bottom */}
      <div style={{
        padding: "6px 12px 8px",
        borderTop: `1.5px solid ${color}15`,
        display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center",
      }}>
        {inputTypes.map((t, i) => (
          <div key={i} style={{ fontSize: 9, fontWeight: 800, color, border: `1.5px solid ${color}40`, borderRadius: 6, padding: "1px 8px" }}>
            in: {t}
          </div>
        ))}
        <div style={{ fontSize: 9, fontWeight: 800, color: "white", background: color, borderRadius: 6, padding: "1px 8px" }}>
          out: {outputType}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COMMENT
   ═══════════════════════════════════════════════ */
export function CommentNode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();
  const p = palette.comment;
  return (
    <div style={{ ...boxStyle(data, 200, 100), border: `2px solid ${p.border}`, borderRadius: 4, borderTopRightRadius: 20, background: "rgba(254,249,195,0.85)", padding: 10, position: "relative", boxShadow: selected ? `0 0 0 3px ${p.border}33` : "0 2px 8px rgba(0,0,0,0.06)" }}>
      <NodeFrame id={id} selected={!!selected} minW={120} minH={60} />
      <Handle type="target" position={Position.Top} style={{ ...hStyle(p.handle), opacity: 0.4 }} />
      <Handle type="source" position={Position.Bottom} style={{ ...hStyle(p.handle), opacity: 0.4 }} />
      <Badge text="Note" color={p.accent} />
      <textarea style={{ ...smallInputStyle(), height: "calc(100% - 24px)", resize: "none", marginTop: 6, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)", fontSize: 12, fontFamily: "system-ui, sans-serif" }} placeholder="Add a note…" value={String(data?.text ?? "")} onChange={(e) => update(id, { text: e.target.value })} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TRY / CATCH
   ═══════════════════════════════════════════════ */
export function TryCatchNode(props: NodeProps<AnyData>) {
  const { id, data, selected } = props;
  const update = useUpdate();
  const p = palette.trycatch;
  return (
    <div style={{ ...boxStyle(data, 280, 200), border: `2.5px solid ${p.border}`, borderRadius: 14, background: p.bg, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: selected ? `0 0 0 3px ${p.border}33` : "0 2px 10px rgba(0,0,0,0.06)" }}>
      <NodeFrame id={id} selected={!!selected} minW={240} minH={160} />
      <Handle type="target" position={Position.Top} style={hStyle(p.handle)} />
      <Handle type="source" position={Position.Bottom} style={hStyle(p.handle)} />
      <Handle type="source" position={Position.Right} id="error" style={{ ...hStyle("#ef4444"), background: "#ef4444", top: "75%" }} />
      <div style={{ padding: "8px 12px", borderBottom: `1.5px solid ${p.border}30`, flex: 1, minHeight: 0 }}>
        <Badge text="Try" color={p.accent} />
        <textarea style={{ ...smallInputStyle(), resize: "none", height: "calc(100% - 22px)", marginTop: 4, fontSize: 11 }} placeholder="risky operation…" value={String(data?.tryBody ?? "")} onChange={(e) => update(id, { tryBody: e.target.value })} />
      </div>
      <div style={{ padding: "8px 12px", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
          <Badge text="Catch" color="#ef4444" />
          <input style={{ ...smallInputStyle(), width: 60, fontSize: 11, padding: "2px 6px" }} value={String(data?.catchVar ?? "e")} placeholder="e" onChange={(e) => update(id, { catchVar: e.target.value })} />
        </div>
        <textarea style={{ ...smallInputStyle(), resize: "none", height: "calc(100% - 30px)", fontSize: 11 }} placeholder="handle error…" value={String(data?.catchBody ?? "")} onChange={(e) => update(id, { catchBody: e.target.value })} />
      </div>
      <div style={{ position: "absolute", right: 14, bottom: "18%", fontSize: 9, fontWeight: 900, color: "#ef4444", background: "rgba(255,255,255,0.85)", borderRadius: 4, padding: "1px 4px" }}>ERR</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
export const nodeTypes = {
  terminator: TerminatorNode,
  process: ProcessNode,
  decision: DecisionNode,
  io: IONode,
  loop: LoopNode,
  definition: DefinitionNode,
  domain: DomainNode,
  comment: CommentNode,
  trycatch: TryCatchNode,
};