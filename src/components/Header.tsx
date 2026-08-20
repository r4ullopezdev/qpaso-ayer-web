"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { whatsappLink, type SiteSettings } from "@/lib/settings";
import { t, langPath, switchLangPath, type Lang } from "@/lib/i18n";

export function Header({ settings, lang }: { settings: SiteSettings; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const links = [
    { href: langPath(lang, "/eventos"), label: t(lang, "nav.events") },
    { href: langPath(lang, "/restaurante"), label: t(lang, "nav.restaurant") },
    { href: langPath(lang, "/nosotros"), label: t(lang, "nav.about") },
    { href: langPath(lang, "/#contacto"), label: t(lang, "nav.contact") },
  ];
  const other: Lang = lang === "en" ? "es" : "en";

  const LangToggle = () => (
    <Link
      href={switchLangPath(pathname, other)}
      style={{ fontSize: 13, fontWeight: 800, color: "var(--gold)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}
      title={other === "en" ? "English" : "Español"}
    >
      {other === "en" ? "EN" : "ES"}
    </Link>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(10px)",
        background: "rgba(11,10,13,0.72)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container-x" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <Logo lang={lang} />
        <nav style={{ display: "flex", alignItems: "center", gap: 20 }} className="nav-desktop">
          {links.map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {l.label}
            </Link>
          ))}
          <LangToggle />
          <a
            className="btn btn-gold"
            style={{ padding: "9px 16px" }}
            href={whatsappLink(settings.whatsapp, "Hola! Quiero reservar / info de eventos")}
            target="_blank"
            rel="noreferrer"
          >
            {t(lang, "nav.reserve")}
          </a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="nav-mobile-controls">
          <LangToggle />
          <button
            aria-label="Menú"
            onClick={() => setOpen((v) => !v)}
            className="nav-toggle"
            style={{ display: "none", background: "transparent", border: "1px solid var(--border)", borderRadius: 10, width: 42, height: 38, color: "var(--text)", fontSize: 18, cursor: "pointer" }}
          >
            ☰
          </button>
        </div>
      </div>
      {open && (
        <div className="container-x" style={{ paddingBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ padding: "8px 0", fontWeight: 600 }}>
              {l.label}
            </Link>
          ))}
          <a className="btn btn-gold" href={whatsappLink(settings.whatsapp, "Hola! Quiero reservar / info de eventos")} target="_blank" rel="noreferrer">
            {t(lang, "nav.reserve")}
          </a>
        </div>
      )}
      <style>{`
        @media (max-width: 760px) {
          .nav-desktop { display: none !important; }
          .nav-toggle { display: inline-flex !important; align-items:center; justify-content:center; }
        }
        @media (min-width: 761px) { .nav-mobile-controls { display: none !important; } }
      `}</style>
    </header>
  );
}
