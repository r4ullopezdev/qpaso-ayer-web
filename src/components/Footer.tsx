import Link from "next/link";
import { whatsappLink, type SiteSettings } from "@/lib/settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer id="contacto" style={{ borderTop: "1px solid var(--border)", marginTop: 40 }}>
      <div className="bulbs" />
      <div
        className="container-x"
        style={{
          paddingBlock: 44,
          display: "grid",
          gap: 28,
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
        <div>
          <div className="font-display" style={{ fontSize: 26, color: "var(--gold)" }}>
            Q&apos;PASO AYER
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, maxWidth: 320 }}>
            {settings.heroTagline}. Calle Uruguay, Ciudad de Panamá.
          </p>
        </div>
        <div>
          <h4 style={{ color: "var(--gold)", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>
            Visítanos
          </h4>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 10 }}>{settings.address}</p>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>
            Cena: {settings.hoursDinner}
            <br />
            Fiesta: {settings.hoursParty}
          </p>
        </div>
        <div>
          <h4 style={{ color: "var(--gold)", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>
            Síguenos
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            <a href={`https://instagram.com/${settings.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--muted)", fontSize: 14 }}>
              Instagram {settings.instagram}
            </a>
            <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer" style={{ color: "var(--muted)", fontSize: 14 }}>
              WhatsApp {settings.whatsapp}
            </a>
            <Link href="/eventos" style={{ color: "var(--muted)", fontSize: 14 }}>
              Ver eventos
            </Link>
          </div>
        </div>
      </div>
      <div className="container-x" style={{ paddingBottom: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          © {new Date().getFullYear()} Q&apos;Paso Ayer. Todos los derechos reservados.
        </span>
        <Link href="/admin" style={{ color: "var(--muted)", fontSize: 12 }}>
          Acceso staff
        </Link>
      </div>
    </footer>
  );
}
