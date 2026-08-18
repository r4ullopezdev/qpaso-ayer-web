import Link from "next/link";
import { formatEventDate } from "@/lib/format";

export interface EventCardData {
  slug: string;
  title: string;
  subtitle: string | null;
  motor: string | null;
  date: Date;
  startTime: string;
  coverImage: string | null;
  girlsFreeUntil: string;
  guysFreeUntil: string;
  girlsListOpen: boolean;
  guysListOpen: boolean;
  closed: boolean;
}

const MOTOR_GRADIENT: Record<string, string> = {
  Turismo: "linear-gradient(135deg, #e4322b, #7a1512)",
  Universitario: "linear-gradient(135deg, #00c2a8, #063f39)",
  "After-work": "linear-gradient(135deg, #7b2ff7, #2a0f52)",
  Fiesta: "linear-gradient(135deg, #f5c542, #b3730a)",
  Social: "linear-gradient(135deg, #2b8ef5, #0c2a52)",
  Lanzamiento: "linear-gradient(135deg, #ff4b45, #f5c542)",
};

export function EventCard({ e, highlight = false }: { e: EventCardData; highlight?: boolean }) {
  const grad = MOTOR_GRADIENT[e.motor ?? ""] ?? "linear-gradient(135deg, #241b30, #0b0a0d)";
  return (
    <Link
      href={`/eventos/${e.slug}`}
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        textDecoration: "none",
        borderColor: highlight ? "var(--gold)" : "var(--border)",
        boxShadow: highlight ? "0 0 0 1px var(--gold), 0 14px 40px rgba(245,197,66,0.12)" : undefined,
      }}
    >
      {/* Arte del evento */}
      <div
        style={{
          position: "relative",
          height: 168,
          background: e.coverImage ? "#000" : grad,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        {e.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.coverImage}
            alt={e.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, opacity: 0.25 }} className="bulbs" />
        )}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))",
          }}
        >
          <span className="chip" style={{ background: "rgba(0,0,0,0.4)" }}>{e.motor ?? "Evento"}</span>
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 800, textAlign: "right", textShadow: "0 1px 4px #000" }}>
            {formatEventDate(e.date)}
            <br />
            {e.startTime}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <h3 className="font-display" style={{ fontSize: 28, lineHeight: 1, color: "var(--text)" }}>
          {e.title}
        </h3>
        {e.subtitle && <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>{e.subtitle}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "auto" }}>
          {e.closed ? (
            <span className="chip" style={{ color: "var(--muted)" }}>Cerrado</span>
          ) : (
            <>
              <span className="chip" style={{ color: e.girlsListOpen ? "var(--gold)" : "var(--muted)" }}>
                Chicas · gratis hasta {e.girlsFreeUntil}
              </span>
              <span className="chip" style={{ color: e.guysListOpen ? "var(--gold)" : "var(--muted)" }}>
                Chicos · gratis hasta {e.guysFreeUntil}
              </span>
            </>
          )}
        </div>
        <span className="btn btn-red" style={{ marginTop: 6 }}>
          Apuntarme gratis
        </span>
      </div>
    </Link>
  );
}
