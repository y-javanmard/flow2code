import React, { useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, ConnectionLineType, MarkerType, useReactFlow, ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";

import { useStore } from "./store";
import { nodeTypes, palette, defKindColors } from "./nodes";
import { makePromptPack } from "./compiler";
import { allPresets, getPresetById } from "./presets";
import type { PresetNodeTemplate } from "./presets";
import CodeViewer from "./CodeViewer";
import { ArchitectureBuilder } from "./ArchitectureBuilder";
import { architectureTemplates } from "./presets";

async function generateWithGemini(promptPack: string, language: string) {
  const r = await fetch("/api/generate-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ promptPack, language }) });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

/* ─── UI primitives ─── */
function Panel({ title, icon, color, children, collapsed, onToggle }: { title: string; icon?: string; color?: string; children: React.ReactNode; collapsed?: boolean; onToggle?: () => void }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, background: "white", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div
        onClick={onToggle}
        style={{
          padding: "10px 14px", fontWeight: 800, fontSize: 13, borderBottom: collapsed ? "none" : "1px solid #f0f0f0",
          background: color ? `${color}08` : "#fafafa", color: color ?? "#333",
          display: "flex", alignItems: "center", gap: 8, cursor: onToggle ? "pointer" : "default", userSelect: "none",
        }}
      >
        {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
        <span style={{ flex: 1 }}>{title}</span>
        {onToggle && <span style={{ fontSize: 12, opacity: 0.5 }}>{collapsed ? "▸" : "▾"}</span>}
      </div>
      {!collapsed && <div style={{ padding: 14 }}>{children}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", background: "white", outline: "none",
};
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, marginBottom: 5, fontWeight: 700, color: "#555" };

const actionBtn: React.CSSProperties = {
  padding: "7px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "white",
  cursor: "pointer", fontWeight: 700, fontSize: 12, color: "#374151", boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

function NodeBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px", borderRadius: 8, border: `2px solid ${color}`, background: `${color}12`,
      color, cursor: "pointer", fontWeight: 800, fontSize: 11, whiteSpace: "nowrap",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}25`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = `${color}12`; }}
    >+ {label}</button>
  );
}

/* ─── Preset Picker (appears as expandable row in toolbar) ─── */
function PresetCatalog({ onAdd }: { onAdd: (t: PresetNodeTemplate) => void }) {
  const activePresetId = useStore((s) => s.activePresetId);
  const setActivePreset = useStore((s) => s.setActivePreset);

  const preset = activePresetId ? getPresetById(activePresetId) : null;

  // Group templates by category
  const grouped = useMemo(() => {
    if (!preset) return {};
    const g: Record<string, PresetNodeTemplate[]> = {};
    for (const t of preset.templates) {
      (g[t.category] ??= []).push(t);
    }
    return g;
  }, [preset]);

  return (
    <div style={{
      background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
      padding: "8px 12px", borderRadius: 12, border: "1px solid #e5e7eb",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}>
      {/* Preset selector */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: preset ? 8 : 0 }}>
        {allPresets.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePreset(activePresetId === p.id ? null : p.id)}
            style={{
              fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
              border: activePresetId === p.id ? `2px solid ${p.color}` : "1px solid #d1d5db",
              background: activePresetId === p.id ? `${p.color}15` : "white",
              color: activePresetId === p.id ? p.color : "#555",
              cursor: "pointer",
            }}
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      {/* Template buttons grouped by category */}
      {preset && (
        <div style={{ display: "grid", gap: 6 }}>
          {Object.entries(grouped).map(([cat, templates]) => (
            <div key={cat}>
              <div style={{ fontSize: 9, fontWeight: 900, color: preset.color, textTransform: "uppercase", marginBottom: 3, letterSpacing: 0.5 }}>{cat}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {templates.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => onAdd(t)}
                    title={t.desc}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6,
                      border: `1.5px solid ${t.color}40`, background: `${t.color}08`,
                      color: t.color, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${t.color}20`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${t.color}08`; }}
                  >
                    <span style={{ fontSize: 13 }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Inspector ─── */
function Inspector() {
  const { nodes, selectedNodeId, updateNodeData } = useStore();
  const n = nodes.find((x) => x.id === selectedNodeId);
  if (!n) return <Panel title="Inspector" icon="🔍"><div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: 10 }}>Select a node to inspect</div></Panel>;

  const t = String(n.type);
  const d: any = n.data ?? {};
  const typeColor = (palette as any)[t]?.accent ?? d?.color ?? "#666";

  return (
    <Panel title={`${t.charAt(0).toUpperCase() + t.slice(1)}${d.label ? `: ${d.label}` : ""}`} icon="🔍" color={typeColor}>
      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 10, fontFamily: "monospace" }}>id: {n.id}</div>

      {/* Dimensions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div><label style={labelStyle}>Width</label><input style={inputStyle} value={String(d.w ?? "")} onChange={(e) => updateNodeData(n.id, { w: Number(e.target.value || 240) })} /></div>
        <div><label style={labelStyle}>Height</label><input style={inputStyle} value={String(d.h ?? "")} onChange={(e) => updateNodeData(n.id, { h: Number(e.target.value || 90) })} /></div>
      </div>

      {t === "terminator" && (<><label style={labelStyle}>Title</label><input style={inputStyle} value={String(d.title ?? "")} onChange={(e) => updateNodeData(n.id, { title: e.target.value })} /></>)}
      {t === "process" && (<><label style={labelStyle}>Statement</label><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={String(d.stmt ?? "")} onChange={(e) => updateNodeData(n.id, { stmt: e.target.value })} /></>)}
      {t === "decision" && (<><label style={labelStyle}>Condition</label><input style={inputStyle} value={String(d.cond ?? "")} onChange={(e) => updateNodeData(n.id, { cond: e.target.value })} /></>)}
      {t === "comment" && (<><label style={labelStyle}>Note text</label><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "system-ui" }} value={String(d.text ?? "")} onChange={(e) => updateNodeData(n.id, { text: e.target.value })} /></>)}

      {t === "io" && (
        <>
          <label style={labelStyle}>Kind</label>
          <select style={inputStyle} value={String(d.kind ?? "Input")} onChange={(e) => updateNodeData(n.id, { kind: e.target.value })}>
            <option value="Input">Input</option><option value="Output">Output</option>
          </select>
          <label style={{ ...labelStyle, marginTop: 10 }}>{d.kind === "Output" ? "Expression" : "Variables"}</label>
          <input style={inputStyle} value={String(d.kind === "Output" ? (d.expr ?? "") : (d.vars ?? ""))} onChange={(e) => updateNodeData(n.id, d.kind === "Output" ? { expr: e.target.value } : { vars: e.target.value })} />
        </>
      )}

      {t === "loop" && (
        <>
          <label style={labelStyle}>Kind</label>
          <select style={inputStyle} value={String(d.kind ?? "for")} onChange={(e) => updateNodeData(n.id, { kind: e.target.value })}>
            <option value="for">for</option><option value="while">while</option>
          </select>
          <label style={{ ...labelStyle, marginTop: 10 }}>Spec</label>
          <input style={inputStyle} value={String(d.spec ?? "")} onChange={(e) => updateNodeData(n.id, { spec: e.target.value })} />
        </>
      )}

      {t === "trycatch" && (
        <>
          <label style={labelStyle}>Try body</label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={String(d.tryBody ?? "")} onChange={(e) => updateNodeData(n.id, { tryBody: e.target.value })} />
          <label style={{ ...labelStyle, marginTop: 10 }}>Catch var</label>
          <input style={inputStyle} value={String(d.catchVar ?? "")} onChange={(e) => updateNodeData(n.id, { catchVar: e.target.value })} />
          <label style={{ ...labelStyle, marginTop: 10 }}>Catch body</label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={String(d.catchBody ?? "")} onChange={(e) => updateNodeData(n.id, { catchBody: e.target.value })} />
        </>
      )}

      {/* Domain node inspector */}
      {t === "domain" && (
        <>
          <label style={labelStyle}>Instance name</label>
          <input style={inputStyle} value={String(d.instanceName ?? "")} onChange={(e) => updateNodeData(n.id, { instanceName: e.target.value })} />

          {Array.isArray(d.presetParams) && d.presetParams.length > 0 && (
            <>
              <label style={{ ...labelStyle, marginTop: 12, fontWeight: 900 }}>Parameters</label>
              {d.presetParams.map((p: any) => (
                <div key={p.name} style={{ marginBottom: 6 }}>
                  <label style={{ ...labelStyle, fontSize: 11 }}>{p.name} <span style={{ opacity: 0.5 }}>({p.type})</span></label>
                  <input
                    style={inputStyle}
                    value={String((d.paramValues ?? {})[p.name] ?? p.default)}
                    onChange={(e) => updateNodeData(n.id, { paramValues: { ...(d.paramValues ?? {}), [p.name]: e.target.value } })}
                  />
                </div>
              ))}
            </>
          )}

          {d.outputType && (
            <div style={{ marginTop: 10, fontSize: 11 }}>
              <span style={{ fontWeight: 800, color: "#555" }}>Output type: </span>
              <span style={{ fontWeight: 800, color: d.color }}>{d.outputType}</span>
            </div>
          )}
        </>
      )}

      {/* Definition node inspector (simplified — main editing happens on-node) */}
      {t === "definition" && (
        <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
          Edit this definition directly on the canvas node. Use the kind tabs (Function/Class/Struct/Enum/Interface) and the "extends" dropdown to reference other definitions.
        </div>
      )}
    </Panel>
  );
}

/* ─── Toolbar ─── */
function Toolbar({ onExport, onGenerate, onExportPng, onSaveProject, isGenerating, onShowArchBuilder }: {
  onExport: () => void; onGenerate: () => void; onExportPng: () => void; onSaveProject: () => void; isGenerating: boolean; onShowArchBuilder: () => void;
}) {
  const addNode = useStore((s) => s.addNode);
  const addDomainNode = useStore((s) => s.addDomainNode);
  const reset = useStore((s) => s.reset);
  const rf = useReactFlow();

  function addAtCenter(type: string) {
    const pos = rf.screenToFlowPosition({ x: window.innerWidth / 2 - 240, y: window.innerHeight / 2 - 140 });
    addNode(type, pos);
  }

  function addDomainAtCenter(template: PresetNodeTemplate) {
    const pos = rf.screenToFlowPosition({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 60 });
    addDomainNode(template, pos);
  }

  return (
    <div className="no-export" style={{ position: "absolute", zIndex: 10, top: 12, left: 12, display: "flex", flexDirection: "column", gap: 8, maxWidth: "calc(100vw - 500px)" }}>
      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", padding: "8px 12px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <button style={{ ...actionBtn, color: "#ef4444", borderColor: "#fca5a5" }} onClick={() => reset()}>✕ New</button>
        <button style={actionBtn} onClick={onExport}>📋 Pack</button>
        <button style={actionBtn} onClick={onExportPng}>🖼 PNG</button>
        <button style={actionBtn} onClick={onSaveProject}>💾 Save</button>
        <button style={{ ...actionBtn, background: "#8b5cf6", color: "white", border: "none" }} onClick={onShowArchBuilder}>🏗️ Templates</button>
        <button style={{ ...actionBtn, background: isGenerating ? "#f3f4f6" : "#059669", color: isGenerating ? "#999" : "white", border: "none" }} onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "⏳…" : "⚡ Generate"}
        </button>
      </div>

      {/* Core nodes */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", padding: "8px 12px", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <NodeBtn label="Start/End" color={palette.terminator.accent} onClick={() => addAtCenter("terminator")} />
        <NodeBtn label="Process" color={palette.process.accent} onClick={() => addAtCenter("process")} />
        <NodeBtn label="Decision" color={palette.decision.accent} onClick={() => addAtCenter("decision")} />
        <NodeBtn label="I/O" color={palette.io.accent} onClick={() => addAtCenter("io")} />
        <NodeBtn label="Loop" color={palette.loop.accent} onClick={() => addAtCenter("loop")} />
        <NodeBtn label="Definition" color={palette.definition.accent} onClick={() => addAtCenter("definition")} />
        <NodeBtn label="Try/Catch" color={palette.trycatch.accent} onClick={() => addAtCenter("trycatch")} />
        <NodeBtn label="Note" color={palette.comment.accent} onClick={() => addAtCenter("comment")} />
      </div>

      {/* Domain presets */}
      <PresetCatalog onAdd={addDomainAtCenter} />
    </div>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a"); a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}

// Helper function to create presets map
function getTemplatePresetsMap() {
  const map: Record<string, any> = {};
  
  const neuralNetTemplates = [
    { key: "input_layer", icon: "📥", category: "Layers", color: "#059669", params: [], desc: "Input tensor shape", outputType: "tensor", inputTypes: [] },
    { key: "dense", icon: "🔗", category: "Layers", color: "#2563eb", params: [], desc: "Fully connected layer", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "conv2d", icon: "🔲", category: "Layers", color: "#7c3aed", params: [], desc: "2D Convolution", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "conv1d", icon: "📊", category: "Layers", color: "#7c3aed", params: [], desc: "1D Convolution", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "lstm", icon: "🔁", category: "Layers", color: "#dc2626", params: [], desc: "Long Short-Term Memory", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "gru", icon: "🔁", category: "Layers", color: "#dc2626", params: [], desc: "Gated Recurrent Unit", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "embedding", icon: "📝", category: "Layers", color: "#0891b2", params: [], desc: "Embedding layer for sequences", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "attention", icon: "👁", category: "Layers", color: "#c026d3", params: [], desc: "Multi-head attention", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "transformer", icon: "⚡", category: "Layers", color: "#c026d3", params: [], desc: "Full transformer encoder block", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "maxpool2d", icon: "⬇️", category: "Pooling", color: "#0d9488", params: [], desc: "Max pooling 2D", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "avgpool2d", icon: "⬇️", category: "Pooling", color: "#0d9488", params: [], desc: "Average pooling 2D", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "globalavgpool", icon: "🌐", category: "Pooling", color: "#0d9488", params: [], desc: "Global average pooling", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "flatten", icon: "📏", category: "Pooling", color: "#0d9488", params: [], desc: "Flatten to 1D", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "reshape", icon: "🔀", category: "Pooling", color: "#0d9488", params: [], desc: "Reshape tensor", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "dropout", icon: "💧", category: "Regularization", color: "#d97706", params: [], desc: "Dropout regularization", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "batchnorm", icon: "📐", category: "Regularization", color: "#d97706", params: [], desc: "Batch normalization", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "layernorm", icon: "📐", category: "Regularization", color: "#d97706", params: [], desc: "Layer normalization", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "add", icon: "➕", category: "Operations", color: "#64748b", params: [], desc: "Element-wise add (skip connection)", outputType: "tensor", inputTypes: ["tensor", "tensor"] },
    { key: "concatenate", icon: "🔗", category: "Operations", color: "#64748b", params: [], desc: "Concatenate tensors", outputType: "tensor", inputTypes: ["tensor", "tensor"] },
    { key: "output_layer", icon: "📤", category: "Output", color: "#be185d", params: [], desc: "Output layer", outputType: "prediction", inputTypes: ["tensor"] },
    { key: "compile", icon: "⚙️", category: "Training", color: "#374151", params: [], desc: "Compile model", outputType: "model", inputTypes: ["prediction"] },
    { key: "fit", icon: "🏋️", category: "Training", color: "#374151", params: [], desc: "Train the model", outputType: "history", inputTypes: ["model"] },
  ];

  for (const t of neuralNetTemplates) {
    map[t.key] = t;
  }

  return map;
}

/* ─── App ─── */
export default function App() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode } = useStore();
  const [pack, setPack] = useState("");
  const [language, setLanguage] = useState<"python" | "typescript">("python");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genErr, setGenErr] = useState("");
  const [genNotes, setGenNotes] = useState("");
  const [genFiles, setGenFiles] = useState<{ path: string; content: string }[]>([]);
  const [projectName, setProjectName] = useState("demo");
  const [saveStatus, setSaveStatus] = useState("");
  const [showArchBuilder, setShowArchBuilder] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [sidebarW, setSidebarW] = useState(460);

  function startDrag(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX, startW = sidebarW;
    function onMove(ev: MouseEvent) { setSidebarW(Math.max(320, Math.min(1000, startW + (startX - ev.clientX)))); }
    function onUp() { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const minimapNodeColor = (n: any) => {
    if (n.type === "domain") return n.data?.color ?? "#6366f1";
    return (palette as any)[n.type]?.accent ?? "#999";
  };

  const rfProps = useMemo(() => ({
    nodes, edges, nodeTypes, onNodesChange, onEdgesChange, onConnect,
    onSelectionChange: (sel: any) => selectNode(sel?.nodes?.[0]?.id ?? null),
    onPaneClick: () => selectNode(null),
    fitView: true, snapToGrid: true, snapGrid: [20, 20],
    connectionMode: ConnectionMode.Loose, connectionLineType: ConnectionLineType.SmoothStep,
    defaultEdgeOptions: {
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
      style: { stroke: "#6b7280", strokeWidth: 2 },
      labelStyle: { fill: "#374151", fontSize: 12, fontWeight: 700 },
    },
  }), [nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode]);

  function exportPack() { setPack(makePromptPack(nodes as any, edges as any, language)); }

  async function exportPng() {
    if (!canvasRef.current) return;
    const dataUrl = await toPng(canvasRef.current, { cacheBust: true, backgroundColor: "#f8fafc", filter: (node) => !(node as HTMLElement).classList?.contains("no-export") });
    downloadDataUrl(dataUrl, `${projectName || "flow"}.png`);
  }

  async function saveProject() {
    try {
      setSaveStatus("Saving…");
      const effectivePack = pack.trim() ? pack : makePromptPack(nodes as any, edges as any, language);
      const pngDataUrl = canvasRef.current ? await toPng(canvasRef.current, { cacheBust: true, backgroundColor: "#f8fafc", filter: (n) => !(n as HTMLElement).classList?.contains("no-export") }) : "";
      const r = await fetch("/api/save-project", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: projectName || "demo", flow: { nodes, edges }, promptPack: effectivePack, pngDataUrl, generated: { language, files: genFiles, notes: genNotes } }) });
      if (!r.ok) throw new Error(await r.text());
      const out = await r.json(); setSaveStatus(`Saved: ${out.dir}`);
    } catch (e: any) { setSaveStatus(`Save failed: ${e?.message ?? String(e)}`); }
  }

  async function runGeminiCodegen() {
    try {
      const effectivePack = pack.trim() ? pack : makePromptPack(nodes as any, edges as any, language);
      setIsGenerating(true); setGenErr(""); setGenNotes(""); setGenFiles([]);
      const out = await generateWithGemini(effectivePack, language);
      setGenFiles(out.files ?? []); setGenNotes(String(out.notes ?? ""));
    } catch (e: any) { setGenErr(e?.message ?? String(e)); }
    finally { setIsGenerating(false); }
  }

  // Collapsible panels
  const [col, setCol] = useState<Record<string, boolean>>({});
  const tog = (k: string) => setCol((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div ref={canvasRef} style={{ flex: 1, position: "relative", height: "100%", width: "100%" }}>
        <ReactFlow {...rfProps} style={{ width: "100%", height: "100%", background: "#f8fafc" }}>
          <Toolbar onExport={exportPack} onGenerate={runGeminiCodegen} onExportPng={exportPng} onSaveProject={saveProject} isGenerating={isGenerating} onShowArchBuilder={() => setShowArchBuilder(true)} />
          <Background variant="dots" gap={20} size={1.2} color="#d1d5db" />
          <MiniMap nodeColor={minimapNodeColor} style={{ borderRadius: 10, border: "1px solid #e5e7eb" }} />
          <Controls style={{ borderRadius: 10 }} />
        </ReactFlow>
      </div>

      <div onMouseDown={startDrag} title="Drag to resize" style={{ width: 5, cursor: "col-resize", background: "linear-gradient(180deg, #e5e7eb, #d1d5db)" }} />

      <div style={{ width: sidebarW, padding: 14, background: "#f9fafb", overflow: "auto", borderLeft: "1px solid #e5e7eb" }}>
        <div style={{ display: "grid", gap: 14 }}>
          <Inspector />

          <Panel title="Project" icon="💾" collapsed={col.proj} onToggle={() => tog("proj")}>
            <div style={{ display: "grid", gap: 10 }}>
              <div><label style={labelStyle}>Project name</label><input style={inputStyle} value={projectName} onChange={(e) => setProjectName(e.target.value)} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={actionBtn} onClick={exportPng}>🖼 PNG</button>
                <button style={actionBtn} onClick={saveProject}>💾 Save</button>
              </div>
              {saveStatus && <div style={{ fontSize: 12, opacity: 0.85 }}>{saveStatus}</div>}
            </div>
          </Panel>

          <Panel title="Codegen" icon="⚡" collapsed={col.code} onToggle={() => tog("code")}>
            <label style={labelStyle}>Target language</label>
            <select style={inputStyle} value={language} onChange={(e) => setLanguage(e.target.value as any)}>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
          </Panel>

          <Panel title="Prompt Pack" icon="📋" collapsed={col.pack} onToggle={() => tog("pack")}>
            <textarea value={pack} onChange={(e) => setPack(e.target.value)} spellCheck={false} style={{ ...inputStyle, minHeight: 180, resize: "vertical" }} />
          </Panel>

          <Panel title="Generated Files" icon="📄" collapsed={col.gen} onToggle={() => tog("gen")}>
            {genErr && <div style={{ color: "#ef4444", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 12 }}>{genErr}</div>}
            {genNotes && <div style={{ whiteSpace: "pre-wrap", marginBottom: 10, fontSize: 12 }}>{genNotes}</div>}
            {!genErr && <CodeViewer files={genFiles} title="Files" />}
          </Panel>
        </div>
      </div>

      {/* Architecture Builder Modal */}
      <ArchitectureBuilder 
        isOpen={showArchBuilder}
        onClose={() => setShowArchBuilder(false)}
        presets={getTemplatePresetsMap()}
      />
    </div>
  );
}