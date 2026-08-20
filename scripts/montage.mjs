// Hoja de contactos de todas las fotos reales del menú (para verificación visual).
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "public", "menu");

const SET = ["altos-de-las-hormigas.png","anna-ice-rose.png","champana-anna-brut-rose.png","moet-ice-rose-imperial.jpg","veuve-cliquot-rose.jpg","moet-bright-night.jpg","don-perignon.png","bottle-moet-ice-imperial.png"];
const files = readdirSync(DIR).filter((f) => SET.includes(f)).sort();
const TILE = 190, IMG = 168, COLS = 6, LABEL = 34;
const rows = Math.ceil(files.length / COLS);
const W = COLS * TILE, H = rows * (TILE + LABEL);

const composites = [];
for (let i = 0; i < files.length; i++) {
  const col = i % COLS, row = Math.floor(i / COLS);
  const x = col * TILE + (TILE - IMG) / 2;
  const y = row * (TILE + LABEL) + 8;
  try {
    const img = await sharp(join(DIR, files[i])).resize(IMG, IMG, { fit: "contain", background: "#111" }).png().toBuffer();
    composites.push({ input: img, left: Math.round(x), top: Math.round(y) });
  } catch { /* skip */ }
  const label = files[i].replace(/\.(jpe?g|png)$/i, "").replace(/^(bottle|cocktail)-/, "");
  const svg = `<svg width="${TILE}" height="${LABEL}"><text x="${TILE / 2}" y="20" font-family="Arial" font-size="12" fill="#fff" text-anchor="middle">${label.slice(0, 26)}</text></svg>`;
  composites.push({ input: Buffer.from(svg), left: col * TILE, top: row * (TILE + LABEL) + IMG + 12 });
}

await sharp({ create: { width: W, height: H, channels: 3, background: "#222" } })
  .composite(composites)
  .png()
  .toFile(join(__dirname, "..", "montage.png"));
console.log(`Montage: ${files.length} imágenes -> montage.png (${W}x${H})`);
