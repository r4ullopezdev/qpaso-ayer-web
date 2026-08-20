import Link from "next/link";
import { prisma } from "@/lib/db";
import { Carousel } from "@/components/Carousel";
import { MenuEntry, type EntryData, type Suggestion } from "@/components/menu/MenuEntry";
import { t, pick, langPath, type Lang } from "@/lib/i18n";

type MItem = { id: string; name: string; nameEn: string | null; description: string | null; descriptionEn: string | null; price: string | null; image: string | null; featured: boolean };
type MSection = { id: string; title: string; titleEn: string | null; items: MItem[] };

function sectionIcon(title: string): string {
  const s = title.toLowerCase();
  if (/(coctel|cocktail)/.test(s)) return "🍸";
  if (/(cerveza|beer)/.test(s)) return "🍺";
  if (/(vino|wine)/.test(s)) return "🍷";
  if (/(champa|champagne)/.test(s)) return "🍾";
  if (/(jugo|juice)/.test(s)) return "🧃";
  if (/(soda|bebida|drink)/.test(s)) return "🥤";
  if (/(ron|whisky|vodka|ginebra|gin|tequila|aguardiente|licor|rum|liqueur)/.test(s)) return "🥃";
  return "🍽️";
}
function anchorId(title: string): string {
  return "sec-" + title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const GRAD = "linear-gradient(135deg, #2a2130, #14111a)";

export async function MenuView({ lang }: { lang: Lang }) {
  const sections = (await prisma.menuSection.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  })) as unknown as MSection[];

  // ---- Pools para maridaje / upsell ----
  const iconOf = (sec: MSection) => sectionIcon(sec.title);
  const flat: { it: MItem; sec: MSection }[] = [];
  for (const sec of sections) for (const it of sec.items) flat.push({ it, sec });
  const inSec = (re: RegExp) => flat.filter((x) => re.test(x.sec.title.toLowerCase()));
  const alcoholPool = inSec(/coctel|cerveza/); // bebidas alcohólicas accesibles
  const noAlcoholPool = inSec(/jugo|soda|bebida/);
  const startersPool = inSec(/entrada/);
  const mainsPool = inSec(/principal/);

  const toData = (it: MItem, sec: MSection): EntryData => ({
    name: pick(lang, it.name, it.nameEn),
    description: pick(lang, it.description, it.descriptionEn),
    price: it.price,
    image: it.image,
    icon: iconOf(sec),
  });
  const toSug = (x: { it: MItem; sec: MSection } | undefined, label: string): Suggestion | null => {
    if (!x) return null;
    return { label, name: pick(lang, x.it.name, x.it.nameEn), price: x.it.price, image: x.it.image, icon: iconOf(x.sec) };
  };
  const pickFrom = (pool: typeof flat, seed: number, exceptId: string) => {
    if (pool.length === 0) return undefined;
    for (let k = 0; k < pool.length; k++) {
      const c = pool[(seed + k) % pool.length];
      if (c.it.id !== exceptId) return c;
    }
    return undefined;
  };

  const suggestionsFor = (it: MItem, sec: MSection): Suggestion[] => {
    const seed = hash(it.name);
    const out: (Suggestion | null)[] = [];
    out.push(toSug(pickFrom(alcoholPool, seed, it.id), t(lang, "menu.sugAlcohol")));
    out.push(toSug(pickFrom(noAlcoholPool, seed + 1, it.id), t(lang, "menu.sugNoAlcohol")));
    const st = sec.title.toLowerCase();
    if (/entrada/.test(st)) out.push(toSug(pickFrom(mainsPool, seed + 2, it.id), t(lang, "menu.sugMain")));
    else if (/principal/.test(st)) out.push(toSug(pickFrom(startersPool, seed + 2, it.id), t(lang, "menu.sugStarter")));
    else out.push(toSug(pickFrom(startersPool, seed + 2, it.id), t(lang, "menu.sugStarter")));
    return out.filter((s): s is Suggestion => s !== null);
  };

  const strings = { pairing: t(lang, "menu.pairing"), close: t(lang, "menu.close"), more: t(lang, "menu.tapMore") };

  const featured = flat.filter((x) => x.it.featured).sort((a, b) => (a.it.image ? 0 : 1) - (b.it.image ? 0 : 1));
  const sectionCover = (s: MSection): string | null => s.items.find((i) => i.image)?.image ?? null;

  return (
    <div className="container-x section">
      <span className="chip">{t(lang, "menu.kicker")}</span>
      <h1 className="font-display" style={{ fontSize: "clamp(38px, 7vw, 60px)", marginTop: 12 }}>{t(lang, "menu.title")}</h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6, maxWidth: 560 }}>{t(lang, "menu.intro")}</p>

      {/* Secciones como tarjetas flotantes (carrusel) */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 className="font-display" style={{ fontSize: 22, color: "var(--text)" }}>{lang === "en" ? "Browse the menu" : "Explora la carta"}</h2>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{lang === "en" ? "swipe / use arrows" : "desliza / usa las flechas"} →</span>
        </div>
        <Carousel ariaLabel="secciones">
          {sections.map((s) => {
            const cover = sectionCover(s);
            return (
              <a key={s.id} href={`#${anchorId(s.title)}`} className="card" style={{ width: 150, flexShrink: 0, overflow: "hidden", textDecoration: "none", scrollSnapAlign: "start" }}>
                <div style={{ height: 100, background: cover ? "#0b0a0d" : GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
                  ) : (
                    <span style={{ fontSize: 40 }}>{sectionIcon(s.title)}</span>
                  )}
                </div>
                <div style={{ padding: "10px 12px", fontWeight: 800, fontSize: 14 }}>{sectionIcon(s.title)} {pick(lang, s.title, s.titleEn)}</div>
              </a>
            );
          })}
        </Carousel>
      </div>

      {/* Destacados (carrusel) */}
      {featured.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 className="font-display" style={{ fontSize: 28, color: "var(--gold)" }}>{t(lang, "menu.featured")}</h2>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{lang === "en" ? "swipe / arrows" : "desliza / flechas"} →</span>
          </div>
          <Carousel ariaLabel="destacados">
            {featured.map((x) => (
              <MenuEntry key={x.it.id} variant="card" data={toData(x.it, x.sec)} suggestions={suggestionsFor(x.it, x.sec)} strings={strings} />
            ))}
          </Carousel>
        </div>
      )}

      {/* Carta completa por secciones */}
      {sections.map((s) => (
        <section key={s.id} id={anchorId(s.title)} style={{ marginTop: 34, scrollMarginTop: 90 }}>
          <h2 className="font-display" style={{ fontSize: 26, color: "var(--gold)", display: "flex", alignItems: "center", gap: 8 }}>
            <span>{sectionIcon(s.title)}</span> {pick(lang, s.title, s.titleEn)}
          </h2>
          <div className="hairline" style={{ margin: "10px 0 14px" }} />
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {s.items.map((it) => (
              <MenuEntry key={it.id} variant="row" data={toData(it, s)} suggestions={suggestionsFor(it, s)} strings={strings} />
            ))}
          </div>
        </section>
      ))}

      <div style={{ marginTop: 30 }}>
        <Link href={langPath(lang, "/eventos")} className="btn btn-red">{t(lang, "menu.seeEvents")}</Link>
      </div>
    </div>
  );
}
