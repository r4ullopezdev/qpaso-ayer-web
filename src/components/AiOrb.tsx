"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS: Record<Lang, string[]> = {
  es: ["¿Qué eventos hay?", "¿Cómo me apunto gratis?", "¿Tienen carta?", "¿Dónde están?"],
  en: ["What events are there?", "How do I join for free?", "Do you have a menu?", "Where are you?"],
};

export function AiOrb({ lang = "es" }: { lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: t(lang, "orb.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang }),
      });
      const data = await r.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "…" }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: lang === "en" ? "Oops, something went wrong. Message us on WhatsApp." : "Ups, hubo un problema. Escríbenos por WhatsApp.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 20,
            width: "min(380px, calc(100vw - 32px))",
            height: "min(540px, calc(100vh - 130px))",
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(180deg, #17141c, #120f18)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(245,197,66,0.06)",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--gold)", boxShadow: "0 0 10px var(--gold)" }} />
            <div style={{ flex: 1 }}>
              <div className="font-display" style={{ fontSize: 18, color: "var(--gold)", lineHeight: 1 }}>
                ASISTENTE QPA
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Eventos · listas · carta</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              style={{ background: "transparent", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer" }}
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "9px 12px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  whiteSpace: "pre-wrap",
                  background: m.role === "user" ? "linear-gradient(180deg,#f5c542,#e7b44a)" : "var(--panel-2)",
                  color: m.role === "user" ? "#1a1300" : "var(--text)",
                  border: m.role === "user" ? "none" : "1px solid var(--border)",
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", color: "var(--muted)", fontSize: 13, padding: "4px 6px" }}>
                escribiendo…
              </div>
            )}
            {messages.length <= 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                {SUGGESTIONS[lang].map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      fontSize: 12,
                      padding: "7px 11px",
                      borderRadius: 999,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--gold)",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-gold" style={{ padding: "10px 14px" }} disabled={loading}>
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Orbe */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir asistente"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 60,
          width: 62,
          height: 62,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: "radial-gradient(circle at 32% 30%, #ffe08a, #f5c542 40%, #e4322b 120%)",
          boxShadow: "0 0 0 4px rgba(245,197,66,0.12), 0 10px 30px rgba(228,50,43,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          animation: "qpaPulse 2.6s ease-in-out infinite",
        }}
      >
        {open ? "×" : "✦"}
      </button>
      <style>{`
        @keyframes qpaPulse {
          0%,100% { box-shadow: 0 0 0 4px rgba(245,197,66,0.12), 0 10px 30px rgba(228,50,43,0.40); }
          50% { box-shadow: 0 0 0 10px rgba(245,197,66,0.05), 0 12px 38px rgba(228,50,43,0.55); }
        }
      `}</style>
    </>
  );
}
