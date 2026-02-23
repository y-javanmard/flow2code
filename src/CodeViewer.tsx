import React, { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";

export type GenFile = { path: string; content: string };

function extOf(path: string) {
  const m = path.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1] ?? "";
}

function langExtensionFor(path: string) {
  const ext = extOf(path);
  if (ext === "py") return python();
  if (ext === "ts" || ext === "tsx" || ext === "js" || ext === "jsx")
    return javascript({ typescript: ext === "ts" || ext === "tsx" });
  if (ext === "json") return json();
  if (ext === "css") return css();
  if (ext === "html" || ext === "htm") return html();
  return []; // fallback: no specific mode
}

export default function CodeViewer({
  files,
  title = "Generated files",
}: {
  files: GenFile[];
  title?: string;
}) {
  const [active, setActive] = useState(0);

  React.useEffect(() => {
    if (active >= files.length) setActive(0);
  }, [files.length, active]);

  const activeFile = files[active];

  const extensions = useMemo(() => {
    if (!activeFile) return [];
    const ex = langExtensionFor(activeFile.path);
    return Array.isArray(ex) ? ex : [ex];
  }, [activeFile?.path]);

  if (!files.length) {
    return <div style={{ fontSize: 12, opacity: 0.7 }}>No files yet.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {active + 1}/{files.length}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          paddingBottom: 6,
          borderBottom: "1px solid #eee",
        }}
      >
        {files.map((f, i) => (
          <button
            key={f.path}
            onClick={() => setActive(i)}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 800,
              background: i === active ? "#111" : "white",
              color: i === active ? "white" : "#111",
            }}
            title={f.path}
          >
            {f.path.split("/").pop()}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #222" }}>
        <CodeMirror
          value={activeFile?.content ?? ""}
          height="520px"
          theme={oneDark}              // <-- Atom-like One Dark
          extensions={extensions}
          editable={false}             // read-only (generated)
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            autocompletion: false,
          }}
        />
      </div>
    </div>
  );
}

