import { prisma } from "@/lib/db";
import { EventCard } from "@/components/EventCard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Eventos · Q'Paso Ayer" };

export default async function EventosPage() {
  const now = new Date(Date.now() - 6 * 3600 * 1000);
  const upcoming = await prisma.event.findMany({
    where: { published: true, date: { gte: now } },
    orderBy: { date: "asc" },
  });
  const past = await prisma.event.findMany({
    where: { published: true, date: { lt: now } },
    orderBy: { date: "desc" },
    take: 6,
  });

  return (
    <div className="container-x section">
      <span className="chip">Programación</span>
      <h1 className="font-display" style={{ fontSize: "clamp(38px, 7vw, 60px)", marginTop: 12 }}>
        Eventos
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6, maxWidth: 560 }}>
        Apúntate gratis a la lista de cada noche. Elige CHICAS o CHICOS — cada lista tiene entrada
        gratis hasta una hora distinta.
      </p>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", marginTop: 28 }}>
        {upcoming.map((e, i) => (
          <EventCard key={e.id} e={e} highlight={i === 0} />
        ))}
      </div>
      {upcoming.length === 0 && (
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Pronto publicamos nuevos eventos.</p>
      )}

      {past.length > 0 && (
        <>
          <h2 className="font-display" style={{ fontSize: 28, color: "var(--muted)", marginTop: 48 }}>
            Ya pasaron
          </h2>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", marginTop: 16, opacity: 0.6 }}>
            {past.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
