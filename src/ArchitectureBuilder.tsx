import React, { useState, useMemo } from "react";
import { useReactFlow } from "reactflow";
import { useStore } from "./store";
import { architectureTemplates, type ArchitectureTemplate } from "./presets";
import type { PresetNodeTemplate } from "./presets";

interface ArchitectureBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Record<string, PresetNodeTemplate>; // map by templateKey
}

export function ArchitectureBuilder({ isOpen, onClose, presets }: ArchitectureBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("vision");
  const [selectedArch, setSelectedArch] = useState<ArchitectureTemplate | null>(null);
  const rf = useReactFlow();
  const { addDomainNode, nodes: existingNodes } = useStore();

  const categories = ["vision", "sequence", "nlp", "hybrid", "classic"] as const;

  const filtered = useMemo(() => {
    return architectureTemplates.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  function buildArchitecture(arch: ArchitectureTemplate) {
    const startX = 100;
    const startY = 100;
    const spacing = 180;

    // Map node indices to actual created node IDs for connection building
    const nodeIndexToId: Record<number, string> = {};

    // First pass: create all nodes
    arch.nodes.forEach((nodeSpec, i) => {
      const preset = presets[nodeSpec.templateKey];
      if (!preset) return;

      const template: PresetNodeTemplate = {
        key: preset.key,
        label: nodeSpec.label,
        icon: preset.icon,
        category: preset.category,
        color: preset.color,
        params: preset.params.map((p) => ({
          ...p,
          default: nodeSpec.params[p.name] ?? p.default,
        })),
        desc: preset.desc,
        outputType: preset.outputType,
        inputTypes: preset.inputTypes,
      };

      const pos = rf.screenToFlowPosition({ x: startX + i * spacing, y: startY });
      
      // Manually trigger add domain node logic
      const nanoid = Math.random().toString(36).substr(2, 9);
      const nodeId = `domain-${template.key}-${nanoid}`;
      
      const paramValues: Record<string, string> = {};
      for (const p of template.params) {
        paramValues[p.name] = nodeSpec.params[p.name] ?? p.default;
      }

      const newNode = {
        id: nodeId,
        type: "domain",
        position: pos,
        data: {
          w: 260,
          templateKey: template.key,
          label: nodeSpec.label,
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

      // Add to store
      useStore.setState((state) => ({
        nodes: [...state.nodes, newNode],
      }));

      nodeIndexToId[i] = nodeId;
    });

    // Second pass: create edges
    setTimeout(() => {
      const edgesToAdd: any[] = [];
      arch.connections.forEach(([fromIdx, toIdx]) => {
        const fromId = nodeIndexToId[fromIdx];
        const toId = nodeIndexToId[toIdx];
        if (fromId && toId) {
          edgesToAdd.push({
            id: `edge-${fromId}-${toId}`,
            source: fromId,
            target: toId,
            type: "smoothstep",
            style: { stroke: "#6b7280", strokeWidth: 2 },
            markerEnd: { type: "arrowclosed", width: 18, height: 18 },
          });
        }
      });

      useStore.setState((state) => ({
        edges: [...state.edges, ...edgesToAdd],
      }));

      onClose();
    }, 100);
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        width: "90vw",
        maxWidth: 1200,
        maxHeight: "85vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: 24,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#111" }}>
              🏗️ Neural Architecture Templates
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#666" }}>
              Pick a pre-built architecture and customize it
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: "#999",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
          {/* Sidebar: Category filter */}
          <div style={{
            width: 180,
            borderRight: "1px solid #e5e7eb",
            padding: 12,
            overflowY: "auto",
            background: "#f9fafb",
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#999", textTransform: "uppercase", marginBottom: 12, letterSpacing: 0.5 }}>
              Categories
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  marginBottom: 6,
                  border: selectedCategory === cat ? "2px solid #8b5cf6" : "1px solid #e5e7eb",
                  background: selectedCategory === cat ? "#8b5cf608" : "white",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 700,
                  color: selectedCategory === cat ? "#8b5cf6" : "#666",
                  transition: "all 0.15s",
                }}
              >
                {cat === "vision" && "🖼️ Vision"}
                {cat === "sequence" && "↔️ Sequence"}
                {cat === "nlp" && "📖 NLP"}
                {cat === "hybrid" && "🎬 Hybrid"}
                {cat === "classic" && "🏛️ Classic"}
              </button>
            ))}
          </div>

          {/* Main area: Template list or detail */}
          {!selectedArch ? (
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {filtered.map((arch) => (
                  <div
                    key={arch.id}
                    onClick={() => setSelectedArch(arch)}
                    style={{
                      background: "white",
                      border: "2px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 16,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      hover: { borderColor: "#8b5cf6", boxShadow: "0 0 0 3px #8b5cf608" },
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#8b5cf6";
                      e.currentTarget.style.boxShadow = "0 0 0 3px #8b5cf608";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{arch.icon}</div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#111", marginBottom: 6 }}>
                      {arch.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#666", marginBottom: 12, lineHeight: 1.4 }}>
                      {arch.description}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {arch.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: "#f3f4f6",
                            color: "#555",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: arch.complexity === "beginner" ? "#059669" : arch.complexity === "intermediate" ? "#d97706" : "#dc2626",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}>
                      {arch.complexity === "beginner" && "✓ Beginner"}
                      {arch.complexity === "intermediate" && "⚡ Intermediate"}
                      {arch.complexity === "advanced" && "⚠️ Advanced"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              <div style={{ maxWidth: 600 }}>
                <button
                  onClick={() => setSelectedArch(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 14,
                    color: "#8b5cf6",
                    cursor: "pointer",
                    fontWeight: 700,
                    marginBottom: 16,
                    padding: 0,
                  }}
                >
                  ← Back to templates
                </button>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{selectedArch.icon}</div>
                  <h2 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 900, color: "#111" }}>
                    {selectedArch.name}
                  </h2>
                  <p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>
                    {selectedArch.description}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    {selectedArch.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          background: "#f3f4f6",
                          color: "#555",
                          padding: "4px 12px",
                          borderRadius: 6,
                          textTransform: "uppercase",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 900, color: "#111" }}>
                    Architecture ({selectedArch.nodes.length} layers)
                  </h3>
                  <div style={{ background: "#f9fafb", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 12 }}>
                    {selectedArch.nodes.map((node, i) => (
                      <div key={i} style={{ marginBottom: 8, color: "#374151" }}>
                        <span style={{ fontWeight: 800, color: "#8b5cf6" }}>→</span> {node.label}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => buildArchitecture(selectedArch)}
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    borderRadius: 10,
                    border: "none",
                    background: "#8b5cf6",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#7c3aed";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#8b5cf6";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  🚀 Build This Architecture
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}