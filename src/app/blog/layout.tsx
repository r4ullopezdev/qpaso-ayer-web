import Link from "next/link";

// Blog (SEO): no se enlaza desde el menú ni la home. Chrome propio y ligero.
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header style={{ borderBottom: "1px solid var(--border)", background: "rgba(11,10,13,0.8)" }}>
        <div className="container-x" style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" className="font-display" style={{ fontSize: 22, color: "var(--gold)" }}>
            Q&apos;PASO AYER
          </Link>
          <nav style={{ display: "flex", gap: 18 }}>
            <Link href="/eventos" style={{ fontSize: 14, color: "var(--muted)" }}>Eventos</Link>
            <Link href="/nosotros" style={{ fontSize: 14, color: "var(--muted)" }}>Nosotros</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer style={{ borderTop: "1px solid var(--border)", marginTop: 40 }}>
        <div className="container-x" style={{ paddingBlock: 28, color: "var(--muted)", fontSize: 13, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>© {new Date().getFullYear()} Q&apos;Paso Ayer · Calle Uruguay, Panamá</span>
          <Link href="/eventos" style={{ color: "var(--gold)" }}>Ver eventos →</Link>
        </div>
      </footer>
    </div>
  );
}
