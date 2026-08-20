import { prisma } from "@/lib/db";
import { EventCard } from "@/components/EventCard";
import { t, type Lang } from "@/lib/i18n";

export async function EventsView({ lang }: { lang: Lang }) {
  const now = new Date(Date.now() - 6 * 3600 * 1000);
  const upcoming = await prisma.event.findMany({ where: { published: true, date: { gte: now } }, orderBy: { date: "asc" } });
  const past = await prisma.event.findMany({ where: { published: true, date: { lt: now } }, orderBy: { date: "desc" }, take: 6 });

  return (
    <div className="container-x section">
      <span className="chip">{t(lang, "events.kicker")}</span>
      <h1 className="font-display" style={{ fontSize: "clamp(38px, 7vw, 60px)", marginTop: 12 }}>{t(lang, "events.title")}</h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6, maxWidth: 560 }}>{t(lang, "events.intro")}</p>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", marginTop: 28 }}>
        {upcoming.map((e, i) => <EventCard key={e.id} e={e} highlight={i === 0} lang={lang} />)}
      </div>
      {upcoming.length === 0 && <p style={{ color: "var(--muted)", marginTop: 20 }}>{t(lang, "events.soon")}</p>}

      {past.length > 0 && (
        <>
          <h2 className="font-display" style={{ fontSize: 28, color: "var(--muted)", marginTop: 48 }}>{t(lang, "events.past")}</h2>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", marginTop: 16, opacity: 0.6 }}>
            {past.map((e) => <EventCard key={e.id} e={e} lang={lang} />)}
          </div>
        </>
      )}
    </div>
  );
}
