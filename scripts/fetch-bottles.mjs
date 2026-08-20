// Busca fotos REALES de botellas en Wikimedia Commons (User-Agent de navegador + filtro por marca).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "menu");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ascii = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const slug = (s) => ascii(s).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);

const STOP = new Set(["ron","rum","ice","rose","brut","anos","ano","blanco","black","red","blue","light","golden","lager","reserva","extra","dry","london","de","la","el","las","los","vodka","whisky","whiskey","gin","tequila","beer","cerveza","wine","vino","champagne","champa","champana","anejo","con","the","and","roja"]);

function brandTokens(name) {
  return ascii(name).replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w))
    .sort((a, b) => b.length - a.length); // más largo primero (más distintivo)
}

const CAT = {
  "Cervezas": "beer", "Ron": "rum", "Whisky": "whisky", "Vodka": "vodka",
  "Ginebra": "gin", "Tequila": "tequila", "Aguardiente": "",
  "Vinos": "wine", "Champaña": "champagne", "Otros licores": "",
};

async function getJSON(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.status === 429) { await sleep(1500 * (i + 1)); continue; }
      return await r.json();
    } catch { await sleep(1000 * (i + 1)); }
  }
  return null;
}
async function getBuf(url) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429) { await sleep(1500 * (i + 1)); continue; }
    const b = Buffer.from(await r.arrayBuffer());
    return { status: r.status, buf: b };
  }
  return { status: 429, buf: Buffer.alloc(0) };
}

async function search(term) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=12&gsrnamespace=6&prop=imageinfo&iiprop=url|mime&iiurlwidth=700&format=json`;
  const j = await getJSON(url);
  const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
  return pages.map((p) => ({ title: ascii(p.title || ""), info: p.imageinfo?.[0] }))
    .filter((p) => p.info?.thumburl && /^image\/(jpeg|png)/.test(p.info.mime || ""));
}

const menu = JSON.parse(readFileSync(join(ROOT, "src", "content", "menu.json"), "utf8"));
let ok = 0, skip = 0;
const report = [];

for (const sec of menu.sections) {
  if (!(sec.title_es in CAT)) continue;
  const catTok = CAT[sec.title_es];
  for (const it of sec.items) {
    if (it.image) continue;
    const tokens = brandTokens(it.name_es);
    if (tokens.length === 0) { skip++; report.push(`skip(no-token): ${it.name_es}`); continue; }
    const primary = tokens[0];
    const cands = await search(`${it.name_es} ${catTok} bottle`);
    // aceptar si el título contiene el token principal, y (contiene la categoría o el token es largo)
    const match = cands.find((c) => c.title.includes(primary) && (!catTok || c.title.includes(catTok) || primary.length >= 6));
    if (!match) { skip++; report.push(`skip(no-match): ${it.name_es}`); await sleep(120); continue; }
    const src = match.info.thumburl;
    const ext = /\.png/i.test(src) ? "png" : "jpg";
    const file = `bottle-${slug(it.name_es)}.${ext}`;
    const { status, buf } = await getBuf(src);
    if (status !== 200 || buf.length < 6000) { skip++; report.push(`skip(dl ${status}/${buf.length}): ${it.name_es}`); await sleep(700); continue; }
    writeFileSync(join(OUT, file), buf);
    it.image = `/menu/${file}`;
    ok++;
    report.push(`OK: ${it.name_es} -> ${file}  [${match.title}]`);
    await sleep(700);
  }
}

writeFileSync(join(ROOT, "src", "content", "menu.json"), JSON.stringify(menu, null, 2), "utf8");
console.log(report.join("\n"));
console.log(`\nDescargadas ${ok} botellas reales, ${skip} sin coincidencia.`);
