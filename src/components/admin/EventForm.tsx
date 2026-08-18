import { toLocalInput } from "@/lib/format";
import type { Event } from "@prisma/client";
import { CoverPicker } from "./CoverPicker";

const MOTORES = ["Turismo", "Universitario", "After-work", "Fiesta", "Social", "Lanzamiento"];

export function EventForm({
  action,
  event,
}: {
  action: (fd: FormData) => Promise<void>;
  event?: Event;
}) {
  const isEdit = !!event;
  return (
    <form action={action} className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
      {isEdit && <input type="hidden" name="id" defaultValue={event!.id} />}

      <div>
        <label htmlFor="title">Título del evento *</label>
        <input id="title" name="title" required defaultValue={event?.title ?? ""} placeholder="Ej. TRAVELERS NIGHT" />
      </div>
      <div>
        <label htmlFor="subtitle">Subtítulo</label>
        <input id="subtitle" name="subtitle" defaultValue={event?.subtitle ?? ""} placeholder="Una frase que engancha" />
      </div>
      <div>
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" rows={3} defaultValue={event?.description ?? ""} placeholder="Qué va a pasar esa noche" />
      </div>

      <CoverPicker initial={event?.coverImage} />

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))" }}>
        <div>
          <label htmlFor="motor">Motor</label>
          <select id="motor" name="motor" defaultValue={event?.motor ?? "Fiesta"}>
            {MOTORES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date">Fecha y hora *</label>
          <input id="date" name="date" type="datetime-local" required defaultValue={event ? toLocalInput(event.date) : ""} />
        </div>
        <div>
          <label htmlFor="startTime">Hora mostrada</label>
          <input id="startTime" name="startTime" defaultValue={event?.startTime ?? "22:00"} placeholder="22:00" />
        </div>
      </div>

      <div className="hairline" />
      <div className="font-display" style={{ fontSize: 20, color: "var(--gold)" }}>Listas gratuitas</div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }} className="lists-grid">
        <div className="card" style={{ padding: 16, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>CHICAS</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="girlsListOpen" defaultChecked={event ? event.girlsListOpen : true} style={{ width: 18, height: 18 }} />
            <span>Lista abierta</span>
          </label>
          <div>
            <label htmlFor="girlsFreeUntil">Gratis hasta</label>
            <input id="girlsFreeUntil" name="girlsFreeUntil" defaultValue={event?.girlsFreeUntil ?? "00:00"} placeholder="00:00" />
          </div>
          <div>
            <label htmlFor="girlsCap">Cupo (vacío = sin límite)</label>
            <input id="girlsCap" name="girlsCap" type="number" min={0} defaultValue={event?.girlsCap ?? ""} />
          </div>
        </div>

        <div className="card" style={{ padding: 16, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>CHICOS</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="guysListOpen" defaultChecked={event ? event.guysListOpen : true} style={{ width: 18, height: 18 }} />
            <span>Lista abierta</span>
          </label>
          <div>
            <label htmlFor="guysFreeUntil">Gratis hasta</label>
            <input id="guysFreeUntil" name="guysFreeUntil" defaultValue={event?.guysFreeUntil ?? "23:00"} placeholder="23:00" />
          </div>
          <div>
            <label htmlFor="guysCap">Cupo (vacío = sin límite)</label>
            <input id="guysCap" name="guysCap" type="number" min={0} defaultValue={event?.guysCap ?? ""} />
          </div>
        </div>
      </div>

      <div className="hairline" />
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)" }}>
          <input type="checkbox" name="published" defaultChecked={event ? event.published : true} style={{ width: 18, height: 18 }} />
          <span>Publicado (visible en la web)</span>
        </label>
        {isEdit && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)" }}>
            <input type="checkbox" name="closed" defaultChecked={event?.closed} style={{ width: 18, height: 18 }} />
            <span>Cerrado (sin inscripciones)</span>
          </label>
        )}
      </div>

      <button type="submit" className="btn btn-gold" style={{ width: "fit-content", padding: "12px 26px" }}>
        {isEdit ? "Guardar cambios" : "Crear evento"}
      </button>
      <style>{`@media (max-width:620px){ .lists-grid{ grid-template-columns:1fr !important; } }`}</style>
    </form>
  );
}
