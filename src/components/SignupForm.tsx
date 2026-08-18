"use client";

import { useState } from "react";

interface Props {
  eventId: string;
  chicasOpen: boolean;
  chicosOpen: boolean;
  girlsFreeUntil: string;
  guysFreeUntil: string;
}

export function SignupForm({ eventId, chicasOpen, chicosOpen, girlsFreeUntil, guysFreeUntil }: Props) {
  const initial: "CHICAS" | "CHICOS" | null = chicasOpen ? "CHICAS" : chicosOpen ? "CHICOS" : null;
  const [list, setList] = useState<"CHICAS" | "CHICOS" | null>(initial);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  if (!chicasOpen && !chicosOpen) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>
        Las listas gratuitas de este evento están cerradas. Escríbenos por WhatsApp para mesas y reservas.
      </div>
    );
  }

  if (status === "ok") {
    return (
      <div className="card" style={{ padding: 24, borderColor: "var(--gold)", textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 30, color: "var(--gold)" }}>¡ESTÁS EN LA LISTA!</div>
        <p style={{ color: "var(--text)", marginTop: 10, fontSize: 15 }}>{feedback}</p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!list) return;
    setStatus("loading");
    setFeedback("");
    try {
      const r = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, list, name, phone, guests }),
      });
      const data = await r.json();
      if (!r.ok) {
        setStatus("error");
        setFeedback(data.error ?? "No se pudo apuntar. Inténtalo de nuevo.");
        return;
      }
      setStatus("ok");
      setFeedback(data.message ?? "¡Listo!");
    } catch {
      setStatus("error");
      setFeedback("Error de conexión. Inténtalo de nuevo.");
    }
  }

  const tab = (value: "CHICAS" | "CHICOS", open: boolean, until: string) => (
    <button
      type="button"
      disabled={!open}
      onClick={() => setList(value)}
      style={{
        flex: 1,
        padding: "14px 10px",
        borderRadius: 12,
        cursor: open ? "pointer" : "not-allowed",
        border: `1px solid ${list === value ? "var(--gold)" : "var(--border)"}`,
        background: list === value ? "rgba(245,197,66,0.12)" : "var(--bg-2)",
        opacity: open ? 1 : 0.45,
        textAlign: "center",
      }}
    >
      <div className="font-display" style={{ fontSize: 22, color: list === value ? "var(--gold)" : "var(--text)" }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
        {open ? `gratis hasta ${until}` : "cerrada"}
      </div>
    </button>
  );

  return (
    <form onSubmit={submit} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="font-display" style={{ fontSize: 24, color: "var(--gold)" }}>APÚNTATE GRATIS</div>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>
          Elige tu lista y deja tu nombre. Sin pagos: entrada gratis hasta la hora indicada.
        </p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {tab("CHICAS", chicasOpen, girlsFreeUntil)}
        {tab("CHICOS", chicosOpen, guysFreeUntil)}
      </div>
      <div>
        <label htmlFor="name">Nombre y apellido</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Tu nombre" />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 2 }}>
          <label htmlFor="phone">WhatsApp (opcional)</label>
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+507 ..." />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="guests">Personas</label>
          <input id="guests" type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
        </div>
      </div>
      {status === "error" && (
        <div style={{ color: "var(--red-2)", fontSize: 13, fontWeight: 600 }}>{feedback}</div>
      )}
      <button type="submit" className="btn btn-gold" disabled={status === "loading" || !list}>
        {status === "loading" ? "Apuntando…" : "Confirmar en la lista"}
      </button>
    </form>
  );
}
