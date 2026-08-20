"use client";

import { useRef, useState } from "react";

export function CoverPicker({ initial, name = "coverImage", label = "Arte del evento (imagen)", compact = false }: { initial?: string | null; name?: string; label?: string; compact?: boolean }) {
  const [value, setValue] = useState(initial ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "No se pudo subir");
      } else {
        setValue(data.url);
      }
    } catch {
      setError("Error de subida");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label>{label}</label>
      <input type="hidden" name={name} value={value} />
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginTop: 6 }}>
        <div
          style={{
            width: compact ? 84 : 200,
            height: compact ? 84 : 112,
            borderRadius: 10,
            border: "1px dashed var(--border)",
            background: value ? "#000" : "var(--bg-2)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Arte" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "var(--muted)", fontSize: 12 }}>Sin arte</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: "9px 14px", fontSize: 13 }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Subiendo…" : "Subir imagen"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          <input
            type="text"
            placeholder="…o pega una URL de imagen"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              style={{ background: "none", border: "none", color: "var(--red-2)", fontSize: 12, cursor: "pointer", textAlign: "left", padding: 0 }}
            >
              Quitar arte
            </button>
          )}
          {error && <div style={{ color: "var(--red-2)", fontSize: 12 }}>{error}</div>}
          <div style={{ color: "var(--muted)", fontSize: 11 }}>
            Recomendado 1200×630px. JPG, PNG, WEBP o SVG (máx. 6 MB).
          </div>
        </div>
      </div>
    </div>
  );
}
