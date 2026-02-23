import type { Node, Edge } from "reactflow";

export function makePromptPack(nodes: Node[], edges: Edge[], language: string) {
  const payload = {
    language,
    flow: {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
      })),
    },
  };

  return [
    `You are a code generator.`,
    `You will receive a flowchart JSON (nodes + edges).`,
    `Each node.type has meaning:`,
    `- terminator: start/end (data.title)`,
    `- process: a statement (data.stmt)`,
    `- decision: condition only (data.cond), branches via handles true (id="t") / false (id="f")`,
    `- loop: for/while spec (data.spec), outputs: body (id="body"), exit (id="exit")`,
    `- io: input/output (data.kind, data.vars or data.expr)`,
    `- definition: unified definition node with data.defKind:`,
    `    - "function": data.name, data.params [{name, type, default}], data.returnType, data.body`,
    `    - "class": data.name, data.parent (reference to another class), data.attrs [{name, type, default, visibility}], data.methods [{name, params, returnType, visibility}]`,
    `    - "struct": data.name, data.attrs`,
    `    - "enum": data.name, data.values [{name, value}]`,
    `    - "interface": data.name, data.parent, data.attrs, data.methods`,
    `- domain: domain-specific node from a preset catalog. Key fields:`,
    `    - data.templateKey: the kind (e.g. "conv2d", "dense", "lstm", "factory", "source_csv")`,
    `    - data.label: display name`,
    `    - data.instanceName: user-given instance name`,
    `    - data.paramValues: {paramName: value} with the configured parameters`,
    `    - data.outputType / data.inputTypes: type information for connections`,
    `    - Edges between domain nodes represent data flow (tensor→tensor, dataframe→dataframe, etc.)`,
    `    - If domain nodes form a NN architecture, generate model code (Keras/PyTorch based on language)`,
    `    - If domain nodes form a data pipeline, generate ETL code`,
    `    - If domain nodes form an API, generate endpoint/service code`,
    `    - If domain nodes form tensor network, generate contraction code`,
    `- comment: annotation note (data.text) — for context only`,
    `- trycatch: error handling (data.tryBody, data.catchVar, data.catchBody)`,
    ``,
    `Visibility codes: "+" = public, "-" = private, "#" = protected`,
    `When data.parent references another node's name, implement inheritance.`,
    ``,
    `Return STRICT JSON with this schema:`,
    `{"language": "...", "files":[{"path":"...", "content":"..."}], "notes":"..."} `,
    ``,
    `FLOWCHART_JSON:`,
    JSON.stringify(payload, null, 2),
  ].join("\n");
}