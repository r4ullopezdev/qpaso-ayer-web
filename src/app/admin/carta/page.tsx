import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CoverPicker } from "@/components/admin/CoverPicker";
import {
  createSection, saveSection, deleteSection,
  createMenuItem, saveMenuItem, deleteMenuItem,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function CartaAdmin() {
  await requireAdmin();
  const sections = await prisma.menuSection.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
  const secOptions = sections.map((s) => ({ id: s.id, title: s.title }));

  const Field = ({ label, name, def, ph }: { label: string; name: string; def?: string | null; ph?: string }) => (
    <div>
      <label style={{ fontSize: 12 }}>{label}</label>
      <input name={name} defaultValue={def ?? ""} placeholder={ph} />
    </div>
  );

  return (
    <div className="container-x" style={{ paddingTop: 28, maxWidth: 900 }}>
      <h1 className="font-display" style={{ fontSize: 40, color: "var(--gold)" }}>Carta</h1>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>Gestiona secciones, platos, fotos, precios y destacados. Los cambios salen al instante en la web (ES/EN).</p>

      {/* Nueva sección */}
      <form action={createSection} className="card" style={{ padding: 16, marginTop: 16, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr auto", alignItems: "end" }}>
        <Field label="Nueva sección (ES)" name="title" ph="Ej. Postres" />
        <Field label="Sección (EN)" name="titleEn" ph="Desserts" />
        <button type="submit" className="btn btn-gold" style={{ padding: "11px 18px" }}>Añadir sección</button>
      </form>

      <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
        {sections.map((s) => (
          <details key={s.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <summary style={{ padding: 16, cursor: "pointer", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{s.title} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {s.items.length} platos</span></span>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>editar ▾</span>
            </summary>
            <div style={{ padding: "0 16px 16px" }}>
              {/* Editar sección */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                <form action={saveSection} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", flex: 1 }}>
                  <input type="hidden" name="id" value={s.id} />
                  <div><label style={{ fontSize: 12 }}>Título ES</label><input name="title" defaultValue={s.title} /></div>
                  <div><label style={{ fontSize: 12 }}>Título EN</label><input name="titleEn" defaultValue={s.titleEn ?? ""} /></div>
                  <div style={{ width: 80 }}><label style={{ fontSize: 12 }}>Orden</label><input name="order" type="number" defaultValue={s.order} /></div>
                  <button type="submit" className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>Guardar sección</button>
                </form>
                <form action={deleteSection}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 12, color: "var(--red-2)" }}>Eliminar sección</button>
                </form>
              </div>

              <div className="hairline" style={{ margin: "14px 0" }} />

              {/* Items */}
              <div style={{ display: "grid", gap: 8 }}>
                {s.items.map((it) => (
                  <details key={it.id} className="card" style={{ background: "var(--bg-2)" }}>
                    <summary style={{ padding: 10, cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "#000", flexShrink: 0, display: "inline-flex" }}>
                        {it.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{it.name} {it.featured && <span title="destacado">⭐</span>}</span>
                      <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 14 }}>{it.price}</span>
                    </summary>
                    <div style={{ padding: "0 12px 12px" }}>
                      <form action={saveMenuItem} style={{ display: "grid", gap: 10 }}>
                        <input type="hidden" name="id" value={it.id} />
                        <CoverPicker name="image" label="Foto del plato" initial={it.image} compact />
                        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                          <Field label="Nombre ES" name="name" def={it.name} />
                          <Field label="Nombre EN" name="nameEn" def={it.nameEn} />
                        </div>
                        <div><label style={{ fontSize: 12 }}>Descripción ES</label><textarea name="description" rows={2} defaultValue={it.description ?? ""} /></div>
                        <div><label style={{ fontSize: 12 }}>Descripción EN</label><textarea name="descriptionEn" rows={2} defaultValue={it.descriptionEn ?? ""} /></div>
                        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 80px" }}>
                          <Field label="Precio" name="price" def={it.price} ph="$0.00" />
                          <div>
                            <label style={{ fontSize: 12 }}>Sección</label>
                            <select name="sectionId" defaultValue={it.sectionId}>
                              {secOptions.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
                            </select>
                          </div>
                          <div><label style={{ fontSize: 12 }}>Orden</label><input name="order" type="number" defaultValue={it.order} /></div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <input type="checkbox" name="featured" defaultChecked={it.featured} style={{ width: 18, height: 18 }} />
                          <span>Destacado (aparece en &quot;Lo más pedido&quot;)</span>
                        </label>
                        <button type="submit" className="btn btn-gold" style={{ width: "fit-content", padding: "9px 18px", fontSize: 13 }}>Guardar plato</button>
                      </form>
                      <form action={deleteMenuItem} style={{ marginTop: 8 }}>
                        <input type="hidden" name="id" value={it.id} />
                        <button type="submit" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12, color: "var(--red-2)" }}>Eliminar plato</button>
                      </form>
                    </div>
                  </details>
                ))}
              </div>

              {/* Añadir plato */}
              <form action={createMenuItem} className="card" style={{ padding: 12, marginTop: 12, display: "grid", gap: 10 }}>
                <input type="hidden" name="sectionId" value={s.id} />
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)" }}>+ Añadir plato a {s.title}</div>
                <CoverPicker name="image" label="Foto (opcional)" compact />
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 100px" }}>
                  <Field label="Nombre ES" name="name" ph="Nombre del plato" />
                  <Field label="Nombre EN" name="nameEn" ph="Dish name" />
                  <Field label="Precio" name="price" ph="$0.00" />
                </div>
                <div><label style={{ fontSize: 12 }}>Descripción ES</label><textarea name="description" rows={2} /></div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <input type="checkbox" name="featured" style={{ width: 18, height: 18 }} /><span>Destacado</span>
                </label>
                <button type="submit" className="btn btn-gold" style={{ width: "fit-content", padding: "9px 18px", fontSize: 13 }}>Añadir plato</button>
              </form>
            </div>
          </details>
        ))}
      </div>
      <style>{`@media (max-width:640px){ form[style*="grid-template-columns"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
