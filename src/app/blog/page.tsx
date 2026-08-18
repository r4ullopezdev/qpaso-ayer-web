import Link from "next/link";
import type { Metadata } from "next";
import { getArticlesByLang } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog · Vida nocturna en Panamá | Q'Paso Ayer",
  description:
    "Guías de vida nocturna en Ciudad de Panamá y Calle Uruguay: dónde salir, fiestas, eventos y planes de noche. Panama City nightlife guides.",
};

export default function BlogIndex() {
  const es = getArticlesByLang("es");
  const en = getArticlesByLang("en");

  const List = ({ title, items }: { title: string; items: ReturnType<typeof getArticlesByLang> }) => (
    <section style={{ marginTop: 32 }}>
      <h2 className="font-display" style={{ fontSize: 30, color: "var(--gold)" }}>{title}</h2>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", marginTop: 14 }}>
        {items.map((a) => (
          <Link key={a.slug} href={`/blog/${a.slug}`} className="card" style={{ padding: 16, textDecoration: "none" }}>
            <div className="chip" style={{ marginBottom: 8 }}>{a.cluster}</div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{a.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{a.description.slice(0, 90)}…</div>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="container-x section">
      <h1 className="font-display" style={{ fontSize: "clamp(36px, 7vw, 56px)" }}>
        Guías de la noche en Panamá
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 8, maxWidth: 620 }}>
        Todo lo que necesitas para salir en Ciudad de Panamá y Calle Uruguay. Nightlife guides for Panama City.
      </p>
      <List title="En español" items={es} />
      <List title="In English" items={en} />
    </div>
  );
}
