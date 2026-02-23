/* ═══════════════════════════════════════════════
   registry.ts — Node reference registry
   
   Scans all nodes and builds a list of "referenceable"
   entities (definitions, domain nodes) so that other
   nodes can pick them from a dropdown.
   ═══════════════════════════════════════════════ */

import { useStore } from "./store";

export type NodeRef = {
  /** Node id in the flow */
  id: string;
  /** Display name (e.g. "MyClass", "Dense_1") */
  name: string;
  /** Kind label (e.g. "class", "function", "Conv2D") */
  kind: string;
  /** Color for the badge */
  color: string;
  /** Output type for typed connections */
  outputType: string;
};

/**
 * Hook: returns all referenceable node entries from current flow.
 */
export function useNodeRegistry(): NodeRef[] {
  const nodes = useStore((s) => s.nodes);

  const refs: NodeRef[] = [];

  for (const n of nodes) {
    if (n.type === "definition" && n.data?.name) {
      const defKind = n.data.defKind ?? "function";
      const defKindColors: Record<string, string> = {
        function: "#0891b2",
        class: "#7c3aed",
        struct: "#0d9488",
        enum: "#c026d3",
        interface: "#0369a1",
      };
      refs.push({
        id: n.id,
        name: n.data.name,
        kind: defKind,
        color: defKindColors[defKind] ?? "#666",
        outputType: defKind === "function" ? "function" : "class",
      });
    }

    if (n.type === "domain" && n.data?.label) {
      refs.push({
        id: n.id,
        name: n.data.label + (n.data.instanceName ? ` (${n.data.instanceName})` : ""),
        kind: n.data.templateKey ?? "domain",
        color: n.data.color ?? "#666",
        outputType: n.data.outputType ?? "any",
      });
    }
  }

  return refs;
}

/**
 * Filter refs by output type compatibility
 */
export function filterRefsByType(refs: NodeRef[], acceptedTypes: string[]): NodeRef[] {
  if (!acceptedTypes.length) return refs;
  return refs.filter((r) => acceptedTypes.includes(r.outputType) || acceptedTypes.includes("any"));
}