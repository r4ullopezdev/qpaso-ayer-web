import Link from "next/link";
import { getSettings, whatsappLink } from "@/lib/settings";
import { t, langPath, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Q'Paso Ayer · Links", robots: { index: false } };

const WHATSAPP = "+507 6931-2305";

export default async function LinkTree({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang: Lang = sp.lang === "en" ? "en" : "es";
  const settings = await getSettings();

  const buttons = [
    { href: langPath(lang, "/restaurante"), label: t(lang, "link.menu"), icon: "🍔" },
    { href: langPath(lang, "/eventos"), label: t(lang, "link.events"), icon: "🎉" },
    { href: settings.mapsUrl, label: t(lang, "link.directions"), icon: "📍", external: true },
    {
      href: whatsappLink(WHATSAPP, lang === "en" ? "Hi! I have a question about Q'Paso Ayer" : "¡Hola! Tengo una consulta sobre Q'Paso Ayer"),
      label: t(lang, "link.contact"),
      icon: "💬",
      external: true,
    },
  ];

  const Flag = ({ to, flag, label }: { to: Lang; flag: string; label: string }) => {
    const active = lang === to;
    return (
      <Link
        href={`/link?lang=${to}`}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999,
          fontWeight: 800, fontSize: 15, textDecoration: "none",
          border: `1.5px solid ${active ? "var(--gold)" : "var(--border)"}`,
          background: active ? "rgba(245,197,66,0.15)" : "transparent",
          color: active ? "var(--gold)" : "var(--muted)",
        }}
      >
        <span style={{ fontSize: 20 }}>{flag}</span> {label}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "34px 20px 50px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.jpg" alt="Q'Paso Ayer" style={{ width: "min(300px, 74vw)", height: "auto", borderRadius: 16 }} />
      <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", maxWidth: 320, marginTop: 6 }}>{t(lang, "link.tagline")}</div>

      {/* Cambio de idioma con banderas */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Flag to="es" flag="🇵🇦" label="Español" />
        <Flag to="en" flag="🇺🇸" label="English" />
      </div>

      <div style={{ width: "min(420px, 100%)", display: "flex", flexDirection: "column", gap: 13, marginTop: 24 }}>
        {buttons.map((b) => (
          <a
            key={b.label}
            href={b.href}
            target={b.external ? "_blank" : undefined}
            rel={b.external ? "noreferrer" : undefined}
            className="card"
            style={{ padding: "17px 20px", display: "flex", alignItems: "center", gap: 14, textDecoration: "none", fontWeight: 800, fontSize: 17, borderColor: "var(--border)" }}
          >
            <span style={{ fontSize: 24 }}>{b.icon}</span>
            <span style={{ flex: 1 }}>{b.label}</span>
            <span style={{ color: "var(--gold)" }}>→</span>
          </a>
        ))}
      </div>

      <a href={`https://instagram.com/${settings.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)", fontSize: 13, marginTop: 24 }}>
        Instagram {settings.instagram}
      </a>
      <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>Calle Uruguay · {lang === "en" ? "Panama City" : "Ciudad de Panamá"}</div>
    </div>
  );
}
