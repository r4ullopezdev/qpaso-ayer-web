// Descarga fotos REALES de cócteles desde TheCocktailDB y las asigna en menu.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "menu");

function slug(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);
}

// name_es en menu.json  ->  término de búsqueda en TheCocktailDB
const SEARCH = {
  "Long Island": "long island iced tea",
  "Daiquiri": "daiquiri",
  "Caipirinha": "caipirinha",
  "Derrame Cerebral": "brain hemorrhage",
  "Piña Colada": "pina colada",
  "Cosmopolitan": "cosmopolitan",
  "Margarita": "margarita",
  "Orgasmo": "orgasm",
  "Mojito": "mojito",
  "Martini": "dry martini",
  "Mimosa": "mimosa",
  "Whisky Sour": "whiskey sour",
};

async function thumbFor(term) {
  try {
    const r = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`);
    const j = await r.json();
    return j.drinks && j.drinks[0] ? j.drinks[0].strDrinkThumb : null;
  } catch {
    return null;
  }
}

const menu = JSON.parse(readFileSync(join(ROOT, "src", "content", "menu.json"), "utf8"));
const cocktailSection = menu.sections.find((s) => /coctel/i.test(s.title_es));
let done = 0;

for (const it of cocktailSection.items) {
  if (it.image) continue; // ya tiene (Whisky Sour real de cluvi)
  const term = SEARCH[it.name_es];
  if (!term) { console.log("· sin fuente:", it.name_es); continue; }
  const url = await thumbFor(term);
  if (!url) { console.log("· no encontrado:", it.name_es); continue; }
  try {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const file = `cocktail-${slug(it.name_es)}.jpg`;
    writeFileSync(join(OUT, file), buf);
    it.image = `/menu/${file}`;
    done++;
    console.log("ok", it.name_es, "->", file, `(${buf.length}b)`);
  } catch (e) {
    console.log("err", it.name_es, e.message);
  }
}

writeFileSync(join(ROOT, "src", "content", "menu.json"), JSON.stringify(menu, null, 2), "utf8");
console.log(`\nDescargados ${done} cócteles reales.`);
