import React, { useState, useMemo } from "react";
import { useReactFlow } from "reactflow";
import { useStore } from "./store";
import { architectureTemplates, type ArchitectureTemplate } from "./presets";
import type { PresetNodeTemplate } from "./presets";

interface ArchitectureBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Record<string, PresetNodeTemplate>;
}

export function ArchitectureBuilder({ isOpen, onClose, presets }: ArchitectureBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("vision");
  const [selectedArch, setSelectedArch] = useState<ArchitectureTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const rf = useReactFlow();

  const categories = ["vision", "sequence", "nlp", "hybrid", "classic"] as const;

  const filtered = useMemo(() => {
    let results = architectureTemplates.filter((t) => t.category === selectedCategory);
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((t) => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by favorites
    if (showFavoritesOnly) {
      results = results.filter((t) => favoriteIds.has(t.id));
    }
    
    return results;
  }, [selectedCategory, searchQuery, showFavoritesOnly, favoriteIds]);

  function toggleFavorite(id: string) {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function buildArchitecture(arch: ArchitectureTemplate) {
    const startX = 100;
    const startY = 100;
    const spacing = 180;

    const nodeIndexToId: Record<number, string> = {};

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
      
      const nanoid = Math.random().toString(36).substring(2, 11);
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

      useStore.setState((state) => ({
        nodes: [...state.nodes, newNode],
      }));

      nodeIndexToId[i] = nodeId;
    });

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
      setSearchQuery("");
      setSelectedArch(null);
    }, 100);
  }

  if (!isOpen) return null;

  const categoryIcons: Record<string, string> = {
    vision: "🖼️",
    sequence: "↔️",
    nlp: "📖",
    hybrid: "🎬",
    classic: "🏛️",
  };

  const categoryLabels: Record<string, string> = {
    vision: "Vision Models",
    sequence: "Sequence Models",
    nlp: "Transformers",
    hybrid: "Hybrid Models",
    classic: "Classic Networks",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, backdropFilter: "blur(8px)", animation: "fadeIn 0.2s ease-out",
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{
        background: "white", borderRadius: 20, boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
        width: "95vw", maxWidth: 1400, maxHeight: "90vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        {/* Header with gradient */}
        <div style={{
          padding: "28px 32px", 
          background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: "white"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "white" }}>
              🏗️ Neural Architecture Templates
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
              {filtered.length} {filtered.length === 1 ? "architecture" : "architectures"} available
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: "rgba(255,255,255,0.2)", 
              border: "none", 
              fontSize: 28, 
              cursor: "pointer", 
              color: "white", 
              padding: "8px 16px",
              borderRadius: 10,
              transition: "all 0.2s",
              hover: { background: "rgba(255,255,255,0.3)" }
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >✕</button>
        </div>

        {/* Search & Filter Bar */}
        {!selectedArch && (
          <div style={{
            padding: "16px 32px",
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 16,
            alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, padding: "8px 16px", border: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: 18 }}>🔍</span>
              <input
                type="text"
                placeholder="Search architectures by name, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  width: "100%",
                  background: "transparent",
                  fontFamily: "system-ui",
                }}
              />
            </div>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: `2px solid ${showFavoritesOnly ? "#8b5cf6" : "#e5e7eb"}`,
                background: showFavoritesOnly ? "#8b5cf6" : "white",
                color: showFavoritesOnly ? "white" : "#666",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                transition: "all 0.2s",
              }}
            >
              {showFavoritesOnly ? "❤️ Favorites" : "🤍 All"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
          {/* Sidebar */}
          <div style={{
            width: 220,
            borderRight: "1px solid #e5e7eb",
            padding: "16px 12px",
            overflowY: "auto",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#999", textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.5, paddingLeft: 4 }}>
              Categories
            </div>
            {categories.map((cat) => {
              const count = architectureTemplates.filter(t => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSearchQuery(""); }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    marginBottom: 4,
                    border: selectedCategory === cat ? "2px solid #8b5cf6" : "1px solid #e5e7eb",
                    background: selectedCategory === cat ? "linear-gradient(135deg, #8b5cf612, #6366f108)" : "white",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: selectedCategory === cat ? 800 : 600,
                    color: selectedCategory === cat ? "#8b5cf6" : "#555",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat) {
                      e.currentTarget.style.background = "#f9fafb";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat) {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  <span>{categoryIcons[cat]} {categoryLabels[cat]}</span>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          {!selectedArch ? (
            <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
              {filtered.length === 0 ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 16,
                  color: "#999",
                }}>
                  <span style={{ fontSize: 48 }}>🔍</span>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No architectures found</div>
                    <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 20,
                }}>
                  {filtered.map((arch) => (
                    <div
                      key={arch.id}
                      style={{
                        background: "white",
                        border: "2px solid #e5e7eb",
                        borderRadius: 16,
                        padding: 20,
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onClick={() => setSelectedArch(arch)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#8b5cf6";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(139, 92, 246, 0.15)";
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Favorite button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(arch.id); }}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: "none",
                          border: "none",
                          fontSize: 20,
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        {favoriteIds.has(arch.id) ? "❤️" : "🤍"}
                      </button>

                      <div style={{ fontSize: 36, marginBottom: 12 }}>{arch.icon}</div>
                      <h3 style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 900,
                        color: "#111",
                        marginBottom: 8,
                      }}>
                        {arch.name}
                      </h3>
                      <p style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#666",
                        marginBottom: 12,
                        lineHeight: 1.5,
                        minHeight: 52,
                      }}>
                        {arch.description}
                      </p>

                      <div style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}>
                        {arch.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              background: "#f3f4f6",
                              color: "#555",
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 12,
                        borderTop: "1px solid #f0f0f0",
                      }}>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 6,
                          background:
                            arch.complexity === "beginner" ? "#dcfce7" :
                            arch.complexity === "intermediate" ? "#fef3c7" :
                            "#fee2e2",
                          color:
                            arch.complexity === "beginner" ? "#059669" :
                            arch.complexity === "intermediate" ? "#d97706" :
                            "#dc2626",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}>
                          {arch.complexity === "beginner" && "✓ Beginner"}
                          {arch.complexity === "intermediate" && "⚡ Intermediate"}
                          {arch.complexity === "advanced" && "⚠️ Advanced"}
                        </div>
                        <span style={{ fontSize: 12, color: "#999" }}>{arch.nodes.length} layers</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
              <div style={{ maxWidth: 700 }}>
                <button
                  onClick={() => setSelectedArch(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 15,
                    color: "#8b5cf6",
                    cursor: "pointer",
                    fontWeight: 700,
                    marginBottom: 24,
                    padding: 0,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(-4px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
                >
                  ← Back to architectures
                </button>

                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{selectedArch.icon}</div>
                  <h1 style={{
                    margin: "0 0 12px 0",
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#111",
                  }}>
                    {selectedArch.name}
                  </h1>
                  <p style={{
                    margin: 0,
                    fontSize: 15,
                    color: "#666",
                    lineHeight: 1.7,
                    marginBottom: 16,
                  }}>
                    {selectedArch.description}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                    {selectedArch.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #8b5cf612, #6366f108)",
                          color: "#6366f1",
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "1px solid #8b5cf620",
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 16,
                    marginBottom: 24,
                  }}>
                    <div style={{
                      background: "#f9fafb",
                      borderRadius: 12,
                      padding: 16,
                      textAlign: "center",
                      border: "1px solid #e5e7eb",
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#111", marginBottom: 4 }}>
                        {selectedArch.nodes.length} Layers
                      </div>
                      <div style={{ fontSize: 12, color: "#999" }}>Total blocks</div>
                    </div>
                    <div style={{
                      background: "#f9fafb",
                      borderRadius: 12,
                      padding: 16,
                      textAlign: "center",
                      border: "1px solid #e5e7eb",
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>
                        {selectedArch.complexity === "beginner" ? "✓" :
                         selectedArch.complexity === "intermediate" ? "⚡" : "⚠️"}
                      </div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color:
                          selectedArch.complexity === "beginner" ? "#059669" :
                          selectedArch.complexity === "intermediate" ? "#d97706" :
                          "#dc2626",
                        marginBottom: 4,
                        textTransform: "uppercase",
                      }}>
                        {selectedArch.complexity === "beginner" ? "Beginner" :
                         selectedArch.complexity === "intermediate" ? "Intermediate" : "Advanced"}
                      </div>
                      <div style={{ fontSize: 12, color: "#999" }}>Difficulty</div>
                    </div>
                    <div style={{
                      background: "#f9fafb",
                      borderRadius: 12,
                      padding: 16,
                      textAlign: "center",
                      border: "1px solid #e5e7eb",
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>🏆</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#111", marginBottom: 4 }}>
                        Popular
                      </div>
                      <div style={{ fontSize: 12, color: "#999" }}>Well-tested</div>
                    </div>
                  </div>

                  <h3 style={{
                    margin: "0 0 16px 0",
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#111",
                  }}>
                    Architecture Layers
                  </h3>
                  <div style={{
                    background: "linear-gradient(135deg, #f9fafb, #ffffff)",
                    borderRadius: 14,
                    padding: 20,
                    border: "1px solid #e5e7eb",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 13,
                  }}>
                    {selectedArch.nodes.map((node, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: i < selectedArch.nodes.length - 1 ? 12 : 0,
                          color: "#374151",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontWeight: 800, color: "#8b5cf6", fontSize: 14 }}>→</span>
                        <span style={{ fontWeight: 600 }}>{node.label}</span>
                        {i < selectedArch.nodes.length - 1 && (
                          <span style={{ color: "#d1d5db", marginLeft: "auto" }}>↓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => buildArchitecture(selectedArch)}
                  style={{
                    width: "100%",
                    padding: "16px 24px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(139, 92, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(139, 92, 246, 0.3)";
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