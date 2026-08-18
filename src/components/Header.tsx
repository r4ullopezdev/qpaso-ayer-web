"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { whatsappLink, type SiteSettings } from "@/lib/settings";

export function Header({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/eventos", label: "Eventos" },
    { href: "/restaurante", label: "Restaurante" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/#contacto", label: "Contacto" },
  ];
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
      <div
        className="container-x"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        <Logo />
        <nav style={{ display: "flex", alignItems: "center", gap: 22 }} className="nav-desktop">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}
            >
              {l.label}
            </Link>
          ))}
          <a
            className="btn btn-gold"
            style={{ padding: "9px 16px" }}
            href={whatsappLink(settings.whatsapp, "Hola! Quiero reservar / info de eventos")}
            target="_blank"
            rel="noreferrer"
          >
            Reservar
          </a>
        </nav>
        <button
          aria-label="Menú"
          onClick={() => setOpen((v) => !v)}
          className="nav-toggle"
          style={{
            display: "none",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 10,
            width: 42,
            height: 38,
            color: "var(--text)",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </div>
      {open && (
        <div
          className="container-x nav-mobile"
          style={{ paddingBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ padding: "8px 0", fontWeight: 600 }}
            >
              {l.label}
            </Link>
          ))}
          <a
            className="btn btn-gold"
            href={whatsappLink(settings.whatsapp, "Hola! Quiero reservar / info de eventos")}
            target="_blank"
            rel="noreferrer"
          >
            Reservar por WhatsApp
          </a>
        </div>
      )}
      <style>{`
        @media (max-width: 760px) {
          .nav-desktop { display: none !important; }
          .nav-toggle { display: inline-flex !important; align-items:center; justify-content:center; }
        }
      `}</style>
    </header>
  );
}
