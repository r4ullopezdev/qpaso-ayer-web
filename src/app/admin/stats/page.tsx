import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { totals, byDay, byHour } from "@/lib/promoterStats";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  await requireAdmin();
  const signups = await prisma.signup.findMany({ include: { promoter: true, event: true } });

  const t = totals(signups);
  const days = byDay(signups);
  const hours = byHour(signups);
  const maxHour = Math.max(1, ...hours);
  const peakHour = hours.indexOf(Math.max(...hours));

  // Por promotor
  const byPromoter = new Map<string, { name: string; entered: number; earnings: number }>();
  for (const s of signups) {
    if (!s.checkedIn) continue;
    const key = s.promoterId ?? "__none__";
    const name = s.promoter?.name ?? "Sin promotor";
    const row = byPromoter.get(key) ?? { name, entered: 0, earnings: 0 };
    const p = s.entryType === "TABLE_GIRLS" ? s.guests : 1;
    row.entered += p;
    row.earnings += (s.entryType === "FREE" ? 1 : s.entryType === "PAID" ? 2 : 0) * p;
    byPromoter.set(key, row);
  }
  const promoterRows = [...byPromoter.values()].sort((a, b) => b.entered - a.entered);

  const Stat = ({ n, label }: { n: string; label: string }) => (
    <div className="card" style={{ padding: 16, textAlign: "center", flex: 1, minWidth: 130 }}>
      <div className="font-display" style={{ fontSize: 30, color: "var(--gold)" }}>{n}</div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>
    </div>
  );

  return (
    <div className="container-x" style={{ paddingTop: 28, maxWidth: 900 }}>
      <h1 className="font-display" style={{ fontSize: 40, color: "var(--gold)" }}>Estadísticas</h1>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>Basado en las entradas realmente escaneadas en la puerta.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <Stat n={String(t.entered)} label="personas entraron" />
        <Stat n={String(t.freeEntered)} label="entradas gratis" />
        <Stat n={String(t.paidEntered)} label="entradas de pago" />
        <Stat n={String(t.signups)} label="inscritos totales" />
      </div>

      {/* Horas pico */}
      <div className="card" style={{ padding: 18, marginTop: 20 }}>
        <div className="font-display" style={{ fontSize: 22, color: "var(--gold)" }}>Horas de más movimiento</div>
        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
          {t.entered > 0 ? `Hora pico: ${peakHour}:00 h` : "Aún sin datos de entradas."}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
          {hours.map((v, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div
                title={`${i}:00 — ${v}`}
                style={{
                  height: `${(v / maxHour) * 100}%`,
                  minHeight: v > 0 ? 4 : 0,
                  background: i === peakHour && v > 0 ? "var(--gold)" : "var(--violet, #7b2ff7)",
                  borderRadius: 3,
                }}
              />
              {i % 3 === 0 && <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>{i}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Por día */}
      <div className="card" style={{ padding: 18, marginTop: 20 }}>
        <div className="font-display" style={{ fontSize: 22, color: "var(--gold)" }}>Por día</div>
        {days.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>Sin entradas todavía.</p>
        ) : (
          <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ color: "var(--muted)", textAlign: "left", fontSize: 12 }}>
                <th style={{ padding: "6px 0" }}>Día</th>
                <th>Entraron</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.day} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 0" }}>{d.day}</td>
                  <td>{d.entered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Por promotor */}
      <div className="card" style={{ padding: 18, marginTop: 20 }}>
        <div className="font-display" style={{ fontSize: 22, color: "var(--gold)" }}>Por promotor</div>
        {promoterRows.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>Sin datos.</p>
        ) : (
          <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ color: "var(--muted)", textAlign: "left", fontSize: 12 }}>
                <th style={{ padding: "6px 0" }}>Promotor</th>
                <th>Entraron</th>
                <th>A pagar</th>
              </tr>
            </thead>
            <tbody>
              {promoterRows.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 0" }}>{r.name}</td>
                  <td>{r.entered}</td>
                  <td style={{ color: "var(--gold)", fontWeight: 700 }}>${r.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
