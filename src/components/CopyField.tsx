"use client";

import { useState } from "react";

export function CopyField({ label, value }: { label?: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>}
      <div style={{ display: "flex", gap: 6 }}>
        <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} style={{ fontSize: 12 }} />
        <button type="button" onClick={copy} className="btn btn-gold" style={{ padding: "8px 12px", fontSize: 12, whiteSpace: "nowrap" }}>
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

export function LogoutButton({ endpoint, redirect }: { endpoint: string; redirect: string }) {
  async function logout() {
    await fetch(endpoint, { method: "POST" });
    window.location.href = redirect;
  }
  return (
    <button onClick={logout} className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
      Salir
    </button>
  );
}
