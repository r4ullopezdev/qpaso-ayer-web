import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { countsForEvent } from "@/lib/events";
import { formatDateTime } from "@/lib/format";
import { setEventFlag, deleteEvent, deleteUnpublishedEvents } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  const withCounts = await Promise.all(
    events.map(async (e) => ({ e, c: await countsForEvent(e.id) }))
  );
  const totalSignups = withCounts.reduce((a, x) => a + x.c.total, 0);
  const upcoming = events.filter((e) => e.date >= new Date()).length;
  const unpublishedCount = events.filter((e) => !e.published).length;

  return (
    <div className="container-x" style={{ paddingTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 40, color: "var(--gold)" }}>Panel de eventos</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            {events.length} eventos · {upcoming} próximos · {totalSignups} apuntados en total
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {unpublishedCount > 0 && (
            <form action={deleteUnpublishedEvents}>
              <button type="submit" className="btn btn-ghost" style={{ borderColor: "#4a2530", color: "var(--red-2)" }}>
                Eliminar desactivados ({unpublishedCount})
              </button>
            </form>
          )}
          <Link href="/admin/eventos/new" className="btn btn-gold">+ Nuevo evento</Link>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
        {withCounts.map(({ e, c }) => (
          <div key={e.id} className="card" style={{ padding: 18, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="chip">{e.motor ?? "Evento"}</span>
                  {e.published ? (
                    <span className="chip" style={{ color: "#7CFFB2", borderColor: "#245" }}>Publicado</span>
                  ) : (
                    <span className="chip" style={{ color: "var(--muted)" }}>Borrador</span>
                  )}
                  {e.closed && <span className="chip" style={{ color: "var(--red-2)" }}>Cerrado</span>}
                </div>
                <h3 className="font-display" style={{ fontSize: 26, marginTop: 8 }}>{e.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{formatDateTime(e.date)}</p>
              </div>
              <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
                <div>
                  <div className="font-display" style={{ fontSize: 26, color: "var(--gold)" }}>{c.chicasGuests}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>chicas</div>
                </div>
                <div>
                  <div className="font-display" style={{ fontSize: 26, color: "var(--gold)" }}>{c.chicosGuests}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>chicos</div>
                </div>
                <div>
                  <div className="font-display" style={{ fontSize: 26 }}>{c.total}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>total</div>
                </div>
              </div>
            </div>

            <div className="hairline" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Link href={`/admin/eventos/${e.id}`} className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }}>
                Ver / editar
              </Link>
              <FlagButton id={e.id} field="girlsListOpen" value={!e.girlsListOpen} label={e.girlsListOpen ? "Cerrar lista chicas" : "Abrir lista chicas"} />
              <FlagButton id={e.id} field="guysListOpen" value={!e.guysListOpen} label={e.guysListOpen ? "Cerrar lista chicos" : "Abrir lista chicos"} />
              <FlagButton id={e.id} field="published" value={!e.published} label={e.published ? "Despublicar" : "Publicar"} />
              <FlagButton id={e.id} field="closed" value={!e.closed} label={e.closed ? "Reabrir evento" : "Cerrar evento"} />
              <form action={deleteEvent} style={{ marginLeft: "auto" }}>
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 12, borderColor: "#4a2530", color: "var(--red-2)" }}>
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--muted)" }}>
            No hay eventos todavía. <Link href="/admin/eventos/new" style={{ color: "var(--gold)" }}>Crea el primero</Link>.
          </div>
        )}
      </div>
    </div>
  );
}

function FlagButton({ id, field, value, label }: { id: string; field: string; value: boolean; label: string }) {
  return (
    <form action={setEventFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(value)} />
      <button type="submit" className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 12 }}>
        {label}
      </button>
    </form>
  );
}
