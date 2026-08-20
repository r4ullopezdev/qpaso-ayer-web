import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div>
        <div className="font-display" style={{ fontSize: 64, color: "var(--gold)" }}>404</div>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>Esta página no existe / This page doesn&apos;t exist.</p>
        <Link href="/" className="btn btn-gold" style={{ marginTop: 18 }}>Volver al inicio</Link>
      </div>
    </div>
  );
}
