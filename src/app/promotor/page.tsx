import { headers } from "next/headers";
import { requirePromoter } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { totals, byDay } from "@/lib/promoterStats";
import { CopyField, LogoutButton } from "@/components/CopyField";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi panel · Promotor QPA" };

export default async function PromoterDashboard() {
  const session = await requirePromoter();
  const promoter = await prisma.promoter.findUnique({
    where: { id: session.sub },
    include: { signups: true },
  });
  if (!promoter) {
    return <div className="container-x section">Promotor no encontrado.</div>;
  }
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { date: "asc" },
    take: 12,
  });

  const t = totals(promoter.signups);
  const days = byDay(promoter.signups);

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const generalLink = `${base}/eventos?ref=${promoter.code}`;

  const Stat = ({ n, label }: { n: string; label: string }) => (
    <div className="card" style={{ padding: 16, textAlign: "center", flex: 1, minWidth: 120 }}>
      <div className="font-display" style={{ fontSize: 30, color: "var(--gold)" }}>{n}</div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>
    </div>
  );

  return (
    <div className="container-x" style={{ maxWidth: 780, paddingBlock: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="font-display" style={{ fontSize: 34, color: "var(--gold)" }}>Hola, {promoter.name}</div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Código: <b>{promoter.code}</b></div>
        </div>
        <LogoutButton endpoint="/api/promoter/logout" redirect="/promotor/login" />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
        <Stat n={`$${t.earnings}`} label="ganado (por entradas)" />
        <Stat n={String(t.entered)} label="personas entraron" />
        <Stat n={String(t.freeEntered)} label="gratis ($1 c/u)" />
        <Stat n={String(t.paidEntered)} label="pago ($2 c/u)" />
      </div>

      {/* Links de referido */}
      <div className="card" style={{ padding: 18, marginTop: 20 }}>
        <div className="font-display" style={{ fontSize: 22, color: "var(--gold)" }}>Tus links</div>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 12px" }}>
          Comparte estos links. Todo el que se apunte por ellos cuenta para ti.
        </p>
        <CopyField label="Link general (todos los eventos)" value={generalLink} />
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {events.map((e) => (
            <CopyField key={e.id} label={e.title} value={`${base}/eventos/${e.slug}?ref=${promoter.code}`} />
          ))}
        </div>
      </div>

      {/* Por día */}
      <div className="card" style={{ padding: 18, marginTop: 20 }}>
        <div className="font-display" style={{ fontSize: 22, color: "var(--gold)" }}>Por día</div>
        {days.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>Aún no ha entrado nadie con tu código.</p>
        ) : (
          <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ color: "var(--muted)", textAlign: "left", fontSize: 12 }}>
                <th style={{ padding: "6px 0" }}>Día</th>
                <th>Entraron</th>
                <th>Ganado</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.day} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 0" }}>{d.day}</td>
                  <td>{d.entered}</td>
                  <td style={{ color: "var(--gold)", fontWeight: 700 }}>${d.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
