import Link from "next/link";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/EventCard";
import { t, pick, langPath, type Lang } from "@/lib/i18n";

export async function HomeView({ lang }: { lang: Lang }) {
  const events = await prisma.event.findMany({
    where: { published: true, date: { gte: new Date(Date.now() - 6 * 3600 * 1000) } },
    orderBy: { date: "asc" },
    take: 7,
  });
  const [hero, ...rest] = events;

  return (
    <>
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div className="bulbs" />
        <div className="container-x" style={{ paddingBlock: "56px 40px", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.jpg" alt="Q'Paso Ayer" style={{ width: "min(440px, 82vw)", height: "auto", margin: "0 auto", borderRadius: 16 }} />
          <h1 className="font-display" style={{ fontSize: "clamp(38px, 7vw, 68px)", marginTop: 22, lineHeight: 0.95 }}>{t(lang, "hero.tagline")}</h1>
          <p style={{ color: "var(--muted)", fontSize: 17, maxWidth: 620, margin: "16px auto 0" }}>{t(lang, "hero.sub")}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
            <Link href={langPath(lang, "/eventos")} className="btn btn-red" style={{ fontSize: 15, padding: "14px 26px" }}>{t(lang, "hero.ctaEvents")}</Link>
            <Link href={langPath(lang, "/restaurante")} className="btn btn-ghost" style={{ fontSize: 15, padding: "14px 26px" }}>{t(lang, "hero.ctaMenu")}</Link>
          </div>
        </div>
      </section>

      {hero && (
        <section className="container-x" style={{ paddingBottom: 8 }}>
          <div className="card" style={{ padding: 28, borderColor: "var(--gold)", boxShadow: "0 0 0 1px var(--gold), 0 20px 50px rgba(245,197,66,0.1)", display: "grid", gap: 18 }}>
            <span className="chip" style={{ width: "fit-content" }}>{t(lang, "home.featuredEvent")}</span>
            <h2 className="font-display" style={{ fontSize: "clamp(34px, 6vw, 54px)", lineHeight: 0.95 }}>{hero.title}</h2>
            {pick(lang, hero.subtitle, hero.subtitleEn) && <p style={{ color: "var(--muted)", fontSize: 16, margin: 0 }}>{pick(lang, hero.subtitle, hero.subtitleEn)}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="chip" style={{ color: "var(--text)" }}>{lang === "en" ? "Girls free until" : "Chicas gratis hasta"} {hero.girlsFreeUntil}</span>
              <span className="chip" style={{ color: "var(--text)" }}>{lang === "en" ? "Guys free until" : "Chicos gratis hasta"} {hero.guysFreeUntil}</span>
            </div>
            <Link href={langPath(lang, `/eventos/${hero.slug}`)} className="btn btn-gold" style={{ width: "fit-content", padding: "13px 24px" }}>
              {lang === "en" ? "Get on the free list" : "Apuntarme gratis a la lista"}
            </Link>
          </div>
        </section>
      )}

      <section className="section container-x">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 34, color: "var(--gold)" }}>{t(lang, "home.week")}</h2>
          <Link href={langPath(lang, "/eventos")} style={{ fontSize: 14, color: "var(--muted)" }}>{t(lang, "home.seeAll")} →</Link>
        </div>
        {rest.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{t(lang, "events.soon")}</p>
        ) : (
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {rest.map((e) => <EventCard key={e.id} e={e} lang={lang} />)}
          </div>
        )}
      </section>

      <section className="section container-x">
        <div className="card" style={{ padding: 32, display: "grid", gap: 16, gridTemplateColumns: "1.4fr 1fr", alignItems: "center" }}>
          <div>
            <span className="chip">{t(lang, "home.restaurantKicker")}</span>
            <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 44px)", marginTop: 12 }}>{t(lang, "home.restaurantTitle")}</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 10, maxWidth: 460 }}>{t(lang, "home.restaurantText")}</p>
            <Link href={langPath(lang, "/restaurante")} className="btn btn-gold" style={{ marginTop: 18 }}>{t(lang, "hero.ctaMenu")}</Link>
          </div>
          <div className="bulbs" style={{ height: 120, borderRadius: 12, opacity: 0.35 }} />
        </div>
      </section>
    </>
  );
}
