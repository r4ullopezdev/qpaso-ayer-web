import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EventForm } from "@/components/admin/EventForm";
import { saveEvent, deleteEvent, toggleCheckIn, deleteSignup } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { signups: { orderBy: { createdAt: "desc" } } },
  });
  if (!event) notFound();

  const chicas = event.signups.filter((s) => s.list === "CHICAS");
  const chicos = event.signups.filter((s) => s.list === "CHICOS");

  return (
    <div className="container-x" style={{ paddingTop: 28, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <Link href="/admin" style={{ color: "var(--muted)", fontSize: 13 }}>← Panel</Link>
        <Link href={`/eventos/${event.slug}`} target="_blank" style={{ color: "var(--gold)", fontSize: 13 }}>
          Ver página pública ↗
        </Link>
      </div>
      <h1 className="font-display" style={{ fontSize: 38, color: "var(--gold)", marginTop: 10 }}>
        {event.title}
      </h1>

      <div style={{ marginTop: 18 }}>
        <EventForm action={saveEvent} event={event} />
      </div>

      {/* Inscripciones */}
      <div style={{ marginTop: 30 }}>
        <h2 className="font-display" style={{ fontSize: 28 }}>
          Inscritos <span style={{ color: "var(--muted)", fontSize: 16 }}>({event.signups.length})</span>
        </h2>
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "1fr 1fr", marginTop: 14 }} className="lists-grid">
          <SignupList title="CHICAS" rows={chicas} eventId={event.id} />
          <SignupList title="CHICOS" rows={chicos} eventId={event.id} />
        </div>
      </div>

      {/* Zona peligrosa */}
      <div className="card" style={{ padding: 18, marginTop: 30, borderColor: "#4a2530" }}>
        <div style={{ fontWeight: 700, color: "var(--red-2)" }}>Eliminar evento</div>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0 12px" }}>
          Borra el evento y todas sus inscripciones. No se puede deshacer.
        </p>
        <form action={deleteEvent}>
          <input type="hidden" name="id" value={event.id} />
          <button type="submit" className="btn btn-red" style={{ padding: "9px 18px", fontSize: 13 }}>
            Eliminar definitivamente
          </button>
        </form>
      </div>
      <style>{`@media (max-width:720px){ .lists-grid{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

function SignupList({
  title,
  rows,
  eventId,
}: {
  title: string;
  rows: { id: string; name: string; phone: string | null; guests: number; checkedIn: boolean }[];
  eventId: string;
}) {
  const total = rows.reduce((a, r) => a + r.guests, 0);
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="font-display" style={{ fontSize: 22, color: "var(--gold)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{rows.length} inscritos · {total} personas</div>
      </div>
      <div className="hairline" style={{ margin: "10px 0" }} />
      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Nadie todavía.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, textDecoration: r.checkedIn ? "line-through" : "none", opacity: r.checkedIn ? 0.55 : 1 }}>
                  {r.name} {r.guests > 1 && <span style={{ color: "var(--muted)" }}>(+{r.guests - 1})</span>}
                </div>
                {r.phone && <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.phone}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <form action={toggleCheckIn}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="eventId" value={eventId} />
                  <button type="submit" className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}>
                    {r.checkedIn ? "Deshacer" : "Entró"}
                  </button>
                </form>
                <form action={deleteSignup}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="eventId" value={eventId} />
                  <button type="submit" className="btn btn-ghost" style={{ padding: "5px 9px", fontSize: 11, color: "var(--red-2)" }}>
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
