// Descarga las fotos reales de los productos de cluvi y las asigna en menu.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "menu");
mkdirSync(OUT, { recursive: true });

function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
function slug(s) {
  return norm(s).replace(/\s+/g, "-").slice(0, 50);
}

const raw = JSON.parse(readFileSync(join(ROOT, "cluvi_raw.json"), "utf8"));
const products = raw.productos;

const map = {}; // normLabel -> /menu/file
let downloaded = 0;

for (const p of products) {
  if (!p.image) continue;
  const img = p.image;
  const url = img.w_768 || img.w_992 || img.blog || img.image || img.w_1200;
  if (!url) continue;
  const ext = url.split("?")[0].split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const file = `${slug(p.label)}.${ext}`;
  try {
    const res = await fetch(url);
    if (!res.ok) { console.log("skip", p.label, res.status); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(OUT, file), buf);
    map[norm(p.label)] = `/menu/${file}`;
    downloaded++;
    console.log("ok", p.label, "->", file, `(${buf.length}b)`);
  } catch (e) {
    console.log("err", p.label, e.message);
  }
}

// Asignar imagenes a menu.json por nombre normalizado
const menuPath = join(ROOT, "src", "content", "menu.json");
const menu = JSON.parse(readFileSync(menuPath, "utf8"));
let matched = 0;
for (const sec of menu.sections) {
  for (const it of sec.items) {
    const key = norm(it.name_es);
    if (map[key]) { it.image = map[key]; matched++; }
  }
}
writeFileSync(menuPath, JSON.stringify(menu, null, 2), "utf8");
console.log(`\nDescargadas ${downloaded} imagenes. Asignadas a ${matched} items de menu.json.`);
