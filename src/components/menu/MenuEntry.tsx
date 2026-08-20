"use client";

import { useEffect, useState } from "react";

export interface EntryData {
  name: string;
  description: string;
  price: string | null;
  image: string | null;
  icon: string;
}
export interface Suggestion {
  label: string;
  name: string;
  price: string | null;
  image: string | null;
  icon: string;
}

const GRAD = "linear-gradient(135deg, #2a2130, #14111a)";

function Img({ src, icon, style, iconSize }: { src: string | null; icon: string; style: React.CSSProperties; iconSize: number }) {
  return (
    <div style={{ ...style, background: src ? "#0b0a0d" : GRAD, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: iconSize, opacity: 0.85 }}>{icon}</span>
      )}
    </div>
  );
}

export function MenuEntry({
  variant,
  data,
  suggestions,
  strings,
}: {
  variant: "row" | "card";
  data: EntryData;
  suggestions: Suggestion[];
  strings: { pairing: string; close: string; more: string };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const trigger =
    variant === "card" ? (
      <button onClick={() => setOpen(true)} className="card" style={{ width: 220, flexShrink: 0, overflow: "hidden", borderColor: "var(--gold)", scrollSnapAlign: "start", cursor: "pointer", textAlign: "left", padding: 0, color: "inherit" }}>
        <Img src={data.image} icon={data.icon} iconSize={48} style={{ height: 150, width: "100%" }} />
        <div style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{data.name}</div>
          {data.price && <div className="font-display" style={{ fontSize: 20, color: "var(--gold)", marginTop: 4 }}>{data.price}</div>}
        </div>
      </button>
    ) : (
      <button onClick={() => setOpen(true)} className="card" style={{ padding: 10, display: "flex", gap: 12, alignItems: "center", width: "100%", cursor: "pointer", textAlign: "left", color: "inherit" }}>
        <Img src={data.image} icon={data.icon} iconSize={30} style={{ width: 76, height: 76, borderRadius: 12, flexShrink: 0, border: "1px solid var(--border)" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{data.name}</div>
          {data.description && <div style={{ color: "var(--muted)", fontSize: 12.5, lineHeight: 1.4, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{data.description}</div>}
        </div>
        {data.price && <div className="font-display" style={{ fontSize: 20, color: "var(--gold)", whiteSpace: "nowrap" }}>{data.price}</div>}
      </button>
    );

  return (
    <>
      {trigger}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: "min(460px, 100%)", maxHeight: "90vh", overflowY: "auto", padding: 0 }}
          >
            <div style={{ position: "relative" }}>
              <Img src={data.image} icon={data.icon} iconSize={90} style={{ height: 260, width: "100%", borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />
              <button onClick={() => setOpen(false)} aria-label={strings.close}
                style={{ position: "absolute", top: 10, right: 10, width: 34, height: 34, borderRadius: 999, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 20, cursor: "pointer" }}>
                ×
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <h3 className="font-display" style={{ fontSize: 26, lineHeight: 1.05 }}>{data.name}</h3>
                {data.price && <div className="font-display" style={{ fontSize: 26, color: "var(--gold)", whiteSpace: "nowrap" }}>{data.price}</div>}
              </div>
              {data.description && <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6, marginTop: 8 }}>{data.description}</p>}

              {suggestions.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div className="hairline" style={{ marginBottom: 14 }} />
                  <div style={{ fontWeight: 800, fontSize: 14, color: "var(--gold)", marginBottom: 10 }}>{strings.pairing}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {suggestions.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: "var(--bg-2)", borderRadius: 12, padding: 8 }}>
                        <Img src={s.image} icon={s.icon} iconSize={22} style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, border: "1px solid var(--border)" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted)", fontWeight: 700 }}>{s.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
                        </div>
                        {s.price && <div className="font-display" style={{ fontSize: 17, color: "var(--gold)", whiteSpace: "nowrap" }}>{s.price}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
