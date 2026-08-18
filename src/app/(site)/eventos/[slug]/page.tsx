import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { countsForEvent, listStatus } from "@/lib/events";
import { formatLongDate } from "@/lib/format";
import { SignupForm } from "@/components/SignupForm";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.published) notFound();

  // Los conteos se usan solo para saber si una lista está llena/cerrada.
  // El público NO ve cuánta gente hay apuntada (eso es solo para el admin).
  const counts = await countsForEvent(event.id);
  const status = listStatus(event, counts);

  return (
    <div className="container-x section">
      <Link href="/eventos" style={{ color: "var(--muted)", fontSize: 13 }}>
        ← Todos los eventos
      </Link>

      {/* Banner de arte del evento */}
      {event.coverImage && (
        <div
          style={{
            marginTop: 14,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid var(--border)",
            maxHeight: 340,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.coverImage}
            alt={event.title}
            style={{ width: "100%", height: "auto", display: "block", maxHeight: 340, objectFit: "cover" }}
          />
        </div>
      )}

      <div style={{ display: "grid", gap: 30, gridTemplateColumns: "1.3fr 1fr", marginTop: 22, alignItems: "start" }} className="event-grid">
        <div>
          <span className="chip">{event.motor ?? "Evento"}</span>
          <h1 className="font-display" style={{ fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 0.92, marginTop: 12 }}>
            {event.title}
          </h1>
          {event.subtitle && (
            <p style={{ color: "var(--text)", fontSize: 18, marginTop: 8 }}>{event.subtitle}</p>
          )}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 18, color: "var(--muted)", fontSize: 15 }}>
            <span>📅 {formatLongDate(event.date)}</span>
            <span>🕘 {event.startTime}</span>
            <span>📍 Calle Uruguay</span>
          </div>
          {event.description && (
            <p style={{ color: "var(--muted)", fontSize: 15.5, marginTop: 20, lineHeight: 1.6, maxWidth: 560 }}>
              {event.description}
            </p>
          )}

          <div className="card" style={{ padding: 18, marginTop: 24 }}>
            <div style={{ fontWeight: 700, color: "var(--gold)", fontSize: 15 }}>Cómo funciona</div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>
              Apúntate gratis a la lista eligiendo tu grupo. Entrada gratis hasta la hora indicada;
              después, entrada normal. Llega con tiempo y muestra tu nombre en la puerta.
            </p>
          </div>
        </div>

        <div style={{ position: "sticky", top: 88 }}>
          <SignupForm
            eventId={event.id}
            chicasOpen={status.chicasOpen}
            chicosOpen={status.chicosOpen}
            girlsFreeUntil={event.girlsFreeUntil}
            guysFreeUntil={event.guysFreeUntil}
          />
        </div>
      </div>
      <style>{`@media (max-width: 820px){ .event-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
