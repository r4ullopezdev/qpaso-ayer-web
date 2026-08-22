import { prisma } from "@/lib/db";
import { EventCard } from "@/components/EventCard";
import { t, type Lang } from "@/lib/i18n";

// Las fechas de los eventos se guardan en UTC representando la hora de Panamá (UTC-5).
// Un evento se ARCHIVA (desaparece) automáticamente 7 h después de su hora de inicio,
// para que la fiesta siga visible durante toda la noche y se oculte a la mañana siguiente
// en hora de Panamá. No hay sección de "pasados": lo que ya pasó, desaparece.
const ARCHIVE_GRACE_MS = 7 * 3600 * 1000;

export async function EventsView({ lang }: { lang: Lang }) {
  const cutoff = new Date(Date.now() - ARCHIVE_GRACE_MS);
  const upcoming = await prisma.event.findMany({
    where: { published: true, closed: false, date: { gte: cutoff } },
    orderBy: { date: "asc" },
  });

  return (
    <div className="container-x section">
      <span className="chip">{t(lang, "events.kicker")}</span>
      <h1 className="font-display" style={{ fontSize: "clamp(38px, 7vw, 60px)", marginTop: 12 }}>{t(lang, "events.title")}</h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6, maxWidth: 560 }}>{t(lang, "events.intro")}</p>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", marginTop: 28 }}>
        {upcoming.map((e, i) => <EventCard key={e.id} e={e} highlight={i === 0} lang={lang} />)}
      </div>
      {upcoming.length === 0 && <p style={{ color: "var(--muted)", marginTop: 20 }}>{t(lang, "events.soon")}</p>}
    </div>
  );
}
