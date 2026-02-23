import React, { useEffect, useRef, useState } from "react";

const mono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

export function EditableLine({
  value,
  placeholder,
  onChange,
  style,
}: {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  if (!editing) {
    return (
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        title="Double-click to edit"
        style={{
          cursor: "text",
          userSelect: "none",
          textAlign: "center",
          fontWeight: 800,
          fontSize: 12,
          opacity: value ? 1 : 0.6,
          ...style,
        }}
      >
        {value || placeholder || "—"}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter" || e.key === "Escape") setEditing(false);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        border: "1px solid rgba(0,0,0,0.18)",
        borderRadius: 8,
        padding: "6px 8px",
        outline: "none",
        fontFamily: mono,
        fontSize: 12,
        background: "rgba(255,255,255,0.95)",
      }}
    />
  );
}

export function EditableBlock({
  value,
  placeholder,
  onChange,
  minHeight = 70,
}: {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  minHeight?: number;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  if (!editing) {
    return (
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        title="Double-click to edit"
        style={{
          cursor: "text",
          userSelect: "none",
          whiteSpace: "pre-wrap",
          fontFamily: mono,
          fontSize: 12,
          border: "1px solid rgba(0,0,0,0.14)",
          borderRadius: 10,
          padding: 8,
          background: "rgba(255,255,255,0.78)",
          minHeight,
          opacity: value ? 1 : 0.6,
        }}
      >
        {value || placeholder || "—"}
      </div>
    );
  }

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") setEditing(false);
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) setEditing(false);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        minHeight,
        resize: "none",
        fontFamily: mono,
        fontSize: 12,
        border: "1px solid rgba(0,0,0,0.18)",
        borderRadius: 10,
        padding: 8,
        outline: "none",
        background: "rgba(255,255,255,0.95)",
      }}
    />
  );
}
