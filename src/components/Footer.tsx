import Link from "next/link";
import { whatsappLink, type SiteSettings } from "@/lib/settings";
import { t, langPath, pick, type Lang } from "@/lib/i18n";

export function Footer({ settings, lang }: { settings: SiteSettings; lang: Lang }) {
  const tagline = pick(lang, settings.heroTagline, t("en", "hero.tagline"));
  return (
    <footer id="contacto" style={{ borderTop: "1px solid var(--border)", marginTop: 40 }}>
      <div className="bulbs" />
      <div className="container-x" style={{ paddingBlock: 44, display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div>
          <div className="font-display" style={{ fontSize: 26, color: "var(--gold)" }}>Q&apos;PASO AYER</div>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, maxWidth: 320 }}>
            {tagline}. Calle Uruguay, {lang === "en" ? "Panama City" : "Ciudad de Panamá"}.
          </p>
        </div>
        <div>
          <h4 style={{ color: "var(--gold)", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>{t(lang, "footer.visit")}</h4>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 10 }}>{settings.address}</p>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>
            {t(lang, "footer.dinner")}: {settings.hoursDinner}
            <br />
            {t(lang, "footer.party")}: {settings.hoursParty}
          </p>
        </div>
        <div>
          <h4 style={{ color: "var(--gold)", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>{t(lang, "footer.follow")}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            <a href={`https://instagram.com/${settings.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)", fontSize: 14 }}>
              Instagram {settings.instagram}
            </a>
            <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer" style={{ color: "var(--muted)", fontSize: 14 }}>
              WhatsApp {settings.whatsapp}
            </a>
            <Link href={langPath(lang, "/eventos")} style={{ color: "var(--muted)", fontSize: 14 }}>{t(lang, "footer.seeEvents")}</Link>
          </div>
        </div>
      </div>
      <div className="container-x" style={{ paddingBottom: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>© {new Date().getFullYear()} Q&apos;Paso Ayer. {t(lang, "footer.rights")}</span>
        <Link href="/admin" style={{ color: "var(--muted)", fontSize: 12 }}>{t(lang, "footer.staff")}</Link>
      </div>
    </footer>
  );
}
