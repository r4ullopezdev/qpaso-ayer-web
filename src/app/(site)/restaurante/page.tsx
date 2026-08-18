import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Restaurante · Q'Paso Ayer" };

export default async function RestaurantePage() {
  const sections = await prisma.menuSection.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="container-x section">
      <span className="chip">Restaurante</span>
      <h1 className="font-display" style={{ fontSize: "clamp(38px, 7vw, 60px)", marginTop: 12 }}>
        La carta
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6, maxWidth: 560 }}>
        Cena informal para compartir antes de la fiesta. Llega temprano y arranca la noche con la mesa.
      </p>

      <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", marginTop: 28 }}>
        {sections.map((s) => (
          <div key={s.id} className="card" style={{ padding: 22 }}>
            <h2 className="font-display" style={{ fontSize: 26, color: "var(--gold)" }}>{s.title}</h2>
            <div className="hairline" style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {s.items.map((it) => (
                <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{it.name}</div>
                    {it.description && (
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>{it.description}</div>
                    )}
                  </div>
                  {it.price && (
                    <div className="font-display" style={{ fontSize: 20, color: "var(--gold)", whiteSpace: "nowrap" }}>
                      {it.price}
                    </div>
                  )}
                </div>
              ))}
              {s.items.length === 0 && (
                <p style={{ color: "var(--muted)", fontSize: 13 }}>Próximamente.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 24 }}>
        * Carta provisional. La carta oficial se cargará pronto.
      </p>
      <div style={{ marginTop: 20 }}>
        <Link href="/eventos" className="btn btn-red">Ver eventos de la semana</Link>
      </div>
    </div>
  );
}
