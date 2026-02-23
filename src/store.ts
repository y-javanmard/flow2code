import { create } from "zustand";
import type { Node, Edge, Connection, NodeChange, EdgeChange } from "reactflow";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import { nanoid } from "nanoid";
import type { PresetNodeTemplate } from "./presets";

type RFNode = Node<any>;
type RFEdge = Edge;

type RFState = {
  nodes: RFNode[];
  edges: RFEdge[];
  selectedNodeId: string | null;
  activePresetId: string | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: string, position: { x: number; y: number }) => void;
  addDomainNode: (template: PresetNodeTemplate, position: { x: number; y: number }) => void;
  reset: () => void;

  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, patch: Record<string, any>) => void;
  setAll: (nodes: RFNode[], edges: RFEdge[]) => void;
  setActivePreset: (id: string | null) => void;
};

function defaultDataFor(type: string): Record<string, any> {
  const base = { w: 240, h: 90 };
  const dataByType: Record<string, any> = {
    terminator: { w: 200, h: 56, title: "start" },
    process: { ...base, w: 240, h: 80, stmt: "" },
    decision: { ...base, w: 220, h: 140, cond: "" },
    io: { ...base, w: 240, h: 80, kind: "Input", vars: "", cast: "float", expr: "" },
    loop: { ...base, w: 260, h: 110, kind: "for", spec: "i = 1..n" },
    definition: {
      w: 310, h: 260, defKind: "function", name: "myFunc", parent: "", returnType: "", body: "",
      params: [{ name: "x", type: "float", default: "" }], attrs: [], methods: [], values: [],
    },
    comment: { w: 200, h: 100, text: "" },
    trycatch: { w: 280, h: 200, tryBody: "", catchVar: "e", catchBody: "" },
  };
  return dataByType[type] ?? { ...base };
}

export const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  activePresetId: null,

  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, type: "smoothstep", style: { stroke: "#6b7280", strokeWidth: 2 } },
        get().edges,
      ),
    });
  },

  addNode: (type, position) => {
    const id = `${type}-${nanoid(8)}`;
    set({ nodes: [...get().nodes, { id, type, position, data: defaultDataFor(type) }] });
  },

  addDomainNode: (template, position) => {
    const id = `domain-${template.key}-${nanoid(6)}`;
    const paramValues: Record<string, string> = {};
    for (const p of template.params) {
      paramValues[p.name] = p.default;
    }
    const newNode: RFNode = {
      id,
      type: "domain",
      position,
      data: {
        w: 260,
        // No fixed h — let node auto-size based on content
        templateKey: template.key,
        label: template.label,
        icon: template.icon,
        color: template.color,
        desc: template.desc,
        outputType: template.outputType,
        inputTypes: template.inputTypes,
        presetParams: template.params,
        paramValues,
        instanceName: "",
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  reset: () => set({ nodes: [], edges: [], selectedNodeId: null }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setActivePreset: (id) => set({ activePresetId: id }),

  updateNodeData: (id, patch) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...(n.data ?? {}), ...patch } } : n
      ),
    });
  },

  setAll: (nodes, edges) => set({ nodes, edges }),
}));