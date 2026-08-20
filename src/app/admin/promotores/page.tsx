import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { totals } from "@/lib/promoterStats";
import { CopyField } from "@/components/CopyField";
import { createPromoter, togglePromoter, resetPromoterPassword, createDoorUser } from "../actions";

export const dynamic = "force-dynamic";

export default async function PromotoresPage() {
  await requireAdmin();
  const promoters = await prisma.promoter.findMany({
    orderBy: { createdAt: "desc" },
    include: { signups: true },
  });
  const doorUsers = await prisma.adminUser.findMany({ where: { role: "DOOR" }, orderBy: { username: "asc" } });

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;

  return (
    <div className="container-x" style={{ paddingTop: 28, maxWidth: 900 }}>
      <h1 className="font-display" style={{ fontSize: 40, color: "var(--gold)" }}>Promotores</h1>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>
        Cada promotor tiene un link de referido. Gana <b>$1</b> por persona que entra gratis y <b>$2</b> por entrada de pago.
      </p>

      {/* Crear promotor */}
      <form action={createPromoter} className="card" style={{ padding: 18, marginTop: 16, display: "grid", gap: 12, gridTemplateColumns: "1.4fr 1fr 1fr auto", alignItems: "end" }}>
        <div>
          <label htmlFor="name">Nombre</label>
          <input id="name" name="name" required placeholder="Nombre del promotor" />
        </div>
        <div>
          <label htmlFor="code">Código (opcional)</label>
          <input id="code" name="code" placeholder="auto" />
        </div>
        <div>
          <label htmlFor="password">Contraseña (opcional)</label>
          <input id="password" name="password" placeholder="auto" />
        </div>
        <button type="submit" className="btn btn-gold" style={{ padding: "11px 18px" }}>Crear</button>
      </form>

      {/* Lista de promotores */}
      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        {promoters.map((p) => {
          const t = totals(p.signups);
          return (
            <div key={p.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="font-display" style={{ fontSize: 24 }}>{p.name}</span>
                    <span className="chip">{p.code}</span>
                    {!p.active && <span className="chip" style={{ color: "var(--red-2)" }}>inactivo</span>}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
                    {t.entered} entraron · {t.freeEntered} gratis · {t.paidEntered} pago
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="font-display" style={{ fontSize: 30, color: "var(--gold)" }}>${t.earnings}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>a pagar</div>
                </div>
              </div>

              <div className="hairline" style={{ margin: "12px 0" }} />
              <CopyField label="Link general del promotor" value={`${base}/eventos?ref=${p.code}`} />

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <form action={togglePromoter}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 12 }}>
                    {p.active ? "Desactivar" : "Activar"}
                  </button>
                </form>
                <form action={resetPromoterPassword} style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                  <input type="hidden" name="id" value={p.id} />
                  <input name="password" placeholder="nueva contraseña" style={{ fontSize: 12, width: 160 }} />
                  <button type="submit" className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 12 }}>Cambiar clave</button>
                </form>
              </div>
            </div>
          );
        })}
        {promoters.length === 0 && (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Aún no hay promotores.</div>
        )}
      </div>

      {/* Accesos de puerta */}
      <h2 className="font-display" style={{ fontSize: 28, color: "var(--gold)", marginTop: 40 }}>Accesos de puerta</h2>
      <p style={{ color: "var(--muted)", fontSize: 13 }}>El portero solo ve el escáner. Su sesión queda guardada en su teléfono.</p>
      <form action={createDoorUser} className="card" style={{ padding: 18, marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr auto", alignItems: "end" }}>
        <div>
          <label htmlFor="username">Usuario</label>
          <input id="username" name="username" required placeholder="ej. portero2" />
        </div>
        <div>
          <label htmlFor="dpass">Contraseña</label>
          <input id="dpass" name="password" required placeholder="contraseña" />
        </div>
        <button type="submit" className="btn btn-gold" style={{ padding: "11px 18px" }}>Crear acceso</button>
      </form>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {doorUsers.map((u) => (
          <span key={u.id} className="chip" style={{ color: "var(--text)" }}>{u.username}</span>
        ))}
      </div>
      <style>{`@media (max-width:720px){ form[style*="grid-template-columns"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
