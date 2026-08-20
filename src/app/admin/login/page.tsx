"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      const dest = next || (data.role === "DOOR" ? "/puerta" : "/admin");
      router.push(dest);
      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: 20 }}>
      <form onSubmit={submit} className="card" style={{ padding: 28, width: "min(380px, 100%)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="font-display" style={{ fontSize: 30, color: "var(--gold)", textAlign: "center" }}>
          ADMIN · QPA
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", margin: 0 }}>
          Acceso de staff
        </p>
        <div>
          <label htmlFor="u">Usuario</label>
          <input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </div>
        <div>
          <label htmlFor="p">Contraseña</label>
          <input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: "var(--red-2)", fontSize: 13, fontWeight: 600 }}>{error}</div>}
        <button type="submit" className="btn btn-gold" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
