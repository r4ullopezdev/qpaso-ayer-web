import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateTableCodes, deleteTableCode } from "../actions";

export const dynamic = "force-dynamic";

export default async function CodigosPage() {
  await requireAdmin();
  const available = await prisma.tableCode.findMany({ where: { used: false }, orderBy: { createdAt: "desc" } });
  const used = await prisma.tableCode.findMany({ where: { used: true }, orderBy: { usedAt: "desc" }, take: 30 });

  return (
    <div className="container-x" style={{ paddingTop: 28, maxWidth: 820 }}>
      <h1 className="font-display" style={{ fontSize: 40, color: "var(--gold)" }}>Códigos de mesa</h1>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>
        Códigos de un solo uso para &quot;Mesa para chicas&quot;. Al usarse desaparecen de disponibles. Entrega uno por grupo.
      </p>

      <form action={generateTableCodes} className="card" style={{ padding: 16, marginTop: 16, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label htmlFor="count">¿Cuántos generar?</label>
          <input id="count" name="count" type="number" min={1} max={100} defaultValue={10} style={{ width: 120 }} />
        </div>
        <button type="submit" className="btn btn-gold" style={{ padding: "11px 18px" }}>Generar códigos</button>
      </form>

      <h2 className="font-display" style={{ fontSize: 24, marginTop: 26 }}>
        Disponibles <span style={{ color: "var(--muted)", fontSize: 15 }}>({available.length})</span>
      </h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        {available.map((c) => (
          <div key={c.id} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="font-display" style={{ fontSize: 20, color: "var(--gold)", letterSpacing: 1 }}>{c.code}</span>
            <form action={deleteTableCode}>
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" title="Eliminar" style={{ background: "none", border: "none", color: "var(--red-2)", cursor: "pointer", fontSize: 14 }}>✕</button>
            </form>
          </div>
        ))}
        {available.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>No hay códigos disponibles. Genera algunos.</p>}
      </div>

      <h2 className="font-display" style={{ fontSize: 24, marginTop: 30 }}>Usados</h2>
      {used.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>Todavía no se ha usado ninguno.</p>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {used.map((c) => (
            <span key={c.id} className="chip" style={{ color: "var(--muted)" }}>
              {c.code} · {c.usedAt ? new Date(c.usedAt).toLocaleDateString("es-PA") : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
