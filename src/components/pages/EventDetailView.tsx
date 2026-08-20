import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { countsForEvent, listStatus } from "@/lib/events";
import { formatLongDate } from "@/lib/format";
import { REF_COOKIE } from "@/lib/auth/session";
import { SignupForm } from "@/components/SignupForm";
import { t, pick, langPath, type Lang } from "@/lib/i18n";

export async function EventDetailView({ lang, slug }: { lang: Lang; slug: string }) {
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.published) notFound();

  const counts = await countsForEvent(event.id);
  const status = listStatus(event, counts);

  const refCode = (await cookies()).get(REF_COOKIE)?.value;
  const promoter = refCode ? await prisma.promoter.findUnique({ where: { code: refCode.toUpperCase() } }) : null;

  const description = pick(lang, event.description, event.descriptionEn);
  const subtitle = pick(lang, event.subtitle, event.subtitleEn);

  return (
    <div className="container-x section">
      <Link href={langPath(lang, "/eventos")} style={{ color: "var(--muted)", fontSize: 13 }}>← {t(lang, "event.back")}</Link>

      {event.coverImage && (
        <div style={{ marginTop: 14, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", maxHeight: 340 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.coverImage} alt={event.title} style={{ width: "100%", height: "auto", display: "block", maxHeight: 340, objectFit: "cover" }} />
        </div>
      )}

      <div style={{ display: "grid", gap: 30, gridTemplateColumns: "1.3fr 1fr", marginTop: 22, alignItems: "start" }} className="event-grid">
        <div>
          <span className="chip">{event.motor ?? "Evento"}</span>
          <h1 className="font-display" style={{ fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 0.92, marginTop: 12 }}>{event.title}</h1>
          {subtitle && <p style={{ color: "var(--text)", fontSize: 18, marginTop: 8 }}>{subtitle}</p>}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 18, color: "var(--muted)", fontSize: 15 }}>
            <span>📅 {formatLongDate(event.date, lang)}</span>
            <span>🕘 {event.startTime}</span>
            <span>📍 Calle Uruguay</span>
          </div>
          {description && <p style={{ color: "var(--muted)", fontSize: 15.5, marginTop: 20, lineHeight: 1.6, maxWidth: 560 }}>{description}</p>}

          <div className="card" style={{ padding: 18, marginTop: 24 }}>
            <div style={{ fontWeight: 700, color: "var(--gold)", fontSize: 15 }}>{t(lang, "event.howKicker")}</div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>{t(lang, "event.howText")}</p>
          </div>
        </div>

        <div style={{ position: "sticky", top: 88 }}>
          <SignupForm
            lang={lang}
            eventId={event.id}
            chicasOpen={status.chicasOpen}
            chicosOpen={status.chicosOpen}
            girlsFreeUntil={event.girlsFreeUntil}
            guysFreeUntil={event.guysFreeUntil}
            paidOpen={!event.closed && event.paidEntryOpen}
            paidPrice={event.paidPrice}
            tableOpen={!event.closed && event.girlsTableOpen}
            tableMin={event.girlsTableMin}
            promoterName={promoter?.active ? promoter.name : null}
          />
        </div>
      </div>
      <style>{`@media (max-width: 820px){ .event-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
