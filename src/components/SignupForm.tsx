"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

type Mode = "FREE" | "PAID" | "TABLE_GIRLS";

interface Props {
  lang?: Lang;
  eventId: string;
  chicasOpen: boolean;
  chicosOpen: boolean;
  girlsFreeUntil: string;
  guysFreeUntil: string;
  paidOpen: boolean;
  paidPrice: string;
  tableOpen: boolean;
  tableMin: number;
  promoterName?: string | null;
}

interface Result {
  qrDataUrl: string;
  ticketUrl: string;
  emailSent: boolean;
  message: string;
}

const STR = {
  es: {
    closed: "Las inscripciones de este evento están cerradas. Escríbenos por WhatsApp para mesas y reservas.",
    ready: "¡ENTRADA LISTA!",
    show: "Muestra este QR en la puerta.",
    alsoEmail: " También te lo enviamos por correo.",
    viewTicket: "Ver / guardar mi entrada",
    title: "ASEGURA TU ENTRADA",
    fromPromoter: (n: string) => `Vienes de parte de ${n} 🎟️`,
    sub: "Elige tu tipo de entrada y recibe tu QR.",
    modes: { FREE: "Lista gratis", PAID: "Pago en puerta", TABLE_GIRLS: "Mesa chicas" },
    freeUntil: (u: string) => `gratis hasta ${u}`,
    closedList: "cerrada",
    paidTitle: (p: string) => `Entrada de pago · ${p}`,
    paidSub: "Se paga en la puerta. Reserva tu QR ahora.",
    girl: "Soy chica",
    guy: "Soy chico",
    tableTitle: "Mesa para chicas",
    tableSub: (m: number) => `Para grupos de ${m} o más. Necesitas un código (pídelo al staff).`,
    codeLabel: "Código de mesa",
    howMany: "¿Cuántas son?",
    name: "Nombre y apellido",
    namePh: "Tu nombre",
    email: "Correo (para enviarte el QR)",
    phone: "WhatsApp (opcional)",
    submit: "Recibir mi entrada (QR)",
    loading: "Generando tu entrada…",
    connErr: "Error de conexión. Inténtalo de nuevo.",
    genErr: "No se pudo completar. Inténtalo de nuevo.",
  },
  en: {
    closed: "Sign-ups for this event are closed. Message us on WhatsApp for tables and bookings.",
    ready: "TICKET READY!",
    show: "Show this QR at the door.",
    alsoEmail: " We also emailed it to you.",
    viewTicket: "View / save my ticket",
    title: "GET YOUR ENTRY",
    fromPromoter: (n: string) => `You're coming from ${n} 🎟️`,
    sub: "Choose your entry type and get your QR.",
    modes: { FREE: "Free list", PAID: "Pay at door", TABLE_GIRLS: "Girls table" },
    freeUntil: (u: string) => `free until ${u}`,
    closedList: "closed",
    paidTitle: (p: string) => `Paid entry · ${p}`,
    paidSub: "Paid at the door. Reserve your QR now.",
    girl: "I'm a girl",
    guy: "I'm a guy",
    tableTitle: "Girls table",
    tableSub: (m: number) => `For groups of ${m} or more. You need a code (ask the staff).`,
    codeLabel: "Table code",
    howMany: "How many are you?",
    name: "Full name",
    namePh: "Your name",
    email: "Email (to send your QR)",
    phone: "WhatsApp (optional)",
    submit: "Get my ticket (QR)",
    loading: "Generating your ticket…",
    connErr: "Connection error. Please try again.",
    genErr: "Couldn't complete it. Please try again.",
  },
};

export function SignupForm(props: Props) {
  const { lang = "es", eventId, chicasOpen, chicosOpen, girlsFreeUntil, guysFreeUntil, paidOpen, paidPrice, tableOpen, tableMin, promoterName } = props;
  const L = STR[lang];

  const modes: Mode[] = [];
  if (chicasOpen || chicosOpen) modes.push("FREE");
  if (paidOpen) modes.push("PAID");
  if (tableOpen) modes.push("TABLE_GIRLS");

  const [mode, setMode] = useState<Mode>(modes[0] ?? "FREE");
  const [list, setList] = useState<"CHICAS" | "CHICOS">(chicasOpen ? "CHICAS" : "CHICOS");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(tableMin);
  const [tableCode, setTableCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  if (modes.length === 0) {
    return <div className="card" style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>{L.closed}</div>;
  }

  if (result) {
    return (
      <div className="card" style={{ padding: 24, borderColor: "var(--gold)", textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 28, color: "var(--gold)" }}>{L.ready}</div>
        <p style={{ color: "var(--text)", marginTop: 8, fontSize: 14 }}>{result.message}</p>
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, width: 220, margin: "16px auto 6px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.qrDataUrl} alt="QR" style={{ width: "100%", display: "block" }} />
        </div>
        <p style={{ color: "var(--muted)", fontSize: 12 }}>{L.show}{result.emailSent ? L.alsoEmail : ""}</p>
        <a href={result.ticketUrl} className="btn btn-ghost" style={{ marginTop: 12, fontSize: 13 }}>{L.viewTicket}</a>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");
    try {
      const r = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          entryType: mode,
          list: mode === "TABLE_GIRLS" ? "CHICAS" : list,
          name, email, phone,
          guests: mode === "TABLE_GIRLS" ? guests : 1,
          tableCode: mode === "TABLE_GIRLS" ? tableCode : "",
          lang,
        }),
      });
      const data = await r.json();
      if (!r.ok) { setStatus("error"); setFeedback(data.error ?? L.genErr); return; }
      setResult(data as Result);
    } catch {
      setStatus("error"); setFeedback(L.connErr);
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="font-display" style={{ fontSize: 24, color: "var(--gold)" }}>{L.title}</div>
        {promoterName && <p style={{ color: "var(--gold)", fontSize: 12, margin: "4px 0 0", fontWeight: 700 }}>{L.fromPromoter(promoterName)}</p>}
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>{L.sub}</p>
      </div>

      {modes.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {modes.map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{ flex: 1, minWidth: 90, padding: "9px 8px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${mode === m ? "var(--gold)" : "var(--border)"}`, background: mode === m ? "rgba(245,197,66,0.12)" : "var(--bg-2)",
                color: mode === m ? "var(--gold)" : "var(--text)" }}>
              {L.modes[m]}
            </button>
          ))}
        </div>
      )}

      {mode === "FREE" && (
        <div style={{ display: "flex", gap: 10 }}>
          {(["CHICAS", "CHICOS"] as const).map((v) => {
            const open = v === "CHICAS" ? chicasOpen : chicosOpen;
            const until = v === "CHICAS" ? girlsFreeUntil : guysFreeUntil;
            const label = v === "CHICAS" ? (lang === "en" ? "GIRLS" : "CHICAS") : (lang === "en" ? "GUYS" : "CHICOS");
            return (
              <button key={v} type="button" disabled={!open} onClick={() => setList(v)}
                style={{ flex: 1, padding: "14px 10px", borderRadius: 12, cursor: open ? "pointer" : "not-allowed",
                  border: `1px solid ${list === v ? "var(--gold)" : "var(--border)"}`, background: list === v ? "rgba(245,197,66,0.12)" : "var(--bg-2)",
                  opacity: open ? 1 : 0.45, textAlign: "center" }}>
                <div className="font-display" style={{ fontSize: 22, color: list === v ? "var(--gold)" : "var(--text)" }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{open ? L.freeUntil(until) : L.closedList}</div>
              </button>
            );
          })}
        </div>
      )}

      {mode === "PAID" && (
        <div className="card" style={{ padding: 14, background: "var(--bg-2)" }}>
          <div style={{ fontWeight: 700 }}>{L.paidTitle(paidPrice)}</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{L.paidSub}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {(["CHICAS", "CHICOS"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setList(v)}
                style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: `1px solid ${list === v ? "var(--gold)" : "var(--border)"}`, background: list === v ? "rgba(245,197,66,0.12)" : "transparent",
                  color: list === v ? "var(--gold)" : "var(--muted)" }}>
                {v === "CHICAS" ? L.girl : L.guy}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "TABLE_GIRLS" && (
        <div className="card" style={{ padding: 14, background: "var(--bg-2)" }}>
          <div style={{ fontWeight: 700 }}>{L.tableTitle}</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{L.tableSub(tableMin)}</div>
          <div style={{ marginTop: 10 }}>
            <label htmlFor="code">{L.codeLabel}</label>
            <input id="code" value={tableCode} onChange={(e) => setTableCode(e.target.value.toUpperCase())} placeholder="QPA-XXXX" required />
          </div>
          <div style={{ marginTop: 10 }}>
            <label htmlFor="g">{L.howMany}</label>
            <input id="g" type="number" min={tableMin} max={30} value={guests} onChange={(e) => setGuests(Number(e.target.value))} required />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="name">{L.name}</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder={L.namePh} />
      </div>
      <div>
        <label htmlFor="email">{L.email}</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
      </div>
      <div>
        <label htmlFor="phone">{L.phone}</label>
        <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+507 ..." />
      </div>

      {status === "error" && <div style={{ color: "var(--red-2)", fontSize: 13, fontWeight: 600 }}>{feedback}</div>}
      <button type="submit" className="btn btn-gold" disabled={status === "loading"}>{status === "loading" ? L.loading : L.submit}</button>
    </form>
  );
}
