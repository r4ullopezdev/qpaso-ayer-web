// Asigna las fotos de botella descargadas a los items del menú (match normalizado) y limpia duplicados.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// name_es (normalizado) -> archivo en /menu
const MAP = {
  "atlasgoldenlight": "bottle-atlas-golden-light.png",
  "balboaroja": "bottle-balboa-roja.jpg",
  "millerlite": "bottle-miller-lite.jpg",
  "cartaviejaanejo": "bottle-carta-vieja-anejo.jpg",
  "cartavieja8anos": "bottle-carta-vieja-8-anos.jpg",
  "abueloanejo": "bottle-abuelo-anejo.jpg",
  "abuelo7anos": "bottle-abuelo-7-anos.jpg",
  "abuelo12anos": "bottle-abuelo-12-anos.jpg",
  "diplomatico": "bottle-diplomatico.jpg",
  "buchanans12anos": "bottle-buchanan-s-12-anos.jpg",
  "buchanans18anos": "bottle-buchanan-s-18-anos.jpg",
  "oldparr12anos": "bottle-old-parr-12-anos.jpg",
  "oldparr18anos": "bottle-old-parr-18-anos.jpg",
  "chivas12": "bottle-chivas-12.jpg",
  "chivas18": "bottle-chivas-18.jpg",
  "smirnoffvodka": "bottle-smirnoff.jpg",
  "bombay": "bottle-bombay.jpg",
  "tanquerayten": "bottle-tanqueray-ten.png",
  "hendricks": "bottle-hendrick-s.png",
  "josecuervo": "bottle-jose-cuervo.png",
  "donjulioblanco": "bottle-don-julio-blanco.jpg",
  "donjulioreposado": "bottle-don-julio-reposado.jpg",
  "donjulioanejo": "bottle-don-julio-anejo.jpg",
  "donjulio70": "bottle-don-julio-70.jpg",
  "donjulio1942": "bottle-don-julio-1942.png",
  "tequilarose": "bottle-tequila-rose.jpg",
  "tequilaclaseazul": "bottle-tequila-clase-azul.png",
  "aniscartujo": "bottle-anis-cartujo.jpg",
  "martincodax": "bottle-martin-codax.jpg",
  "moeticeimperial": "bottle-moet-ice-imperial.png",
  "hypnotic": "bottle-hypnotic.jpg",
};

const menu = JSON.parse(readFileSync(join(ROOT, "src", "content", "menu.json"), "utf8"));
let assigned = 0;
for (const sec of menu.sections) {
  for (const it of sec.items) {
    if (it.image) continue;
    const file = MAP[norm(it.name_es)];
    if (file && existsSync(join(ROOT, "public", "menu", file))) {
      it.image = `/menu/${file}`;
      assigned++;
    }
  }
}
writeFileSync(join(ROOT, "src", "content", "menu.json"), JSON.stringify(menu, null, 2), "utf8");

// borrar duplicados
for (const dup of ["bottle-anis-cartujo.png", "bottle-old-parr-18-anos.png", "bottle-clase-azul.png"]) {
  const p = join(ROOT, "public", "menu", dup);
  if (existsSync(p)) { unlinkSync(p); }
}

const total = menu.sections.reduce((a, s) => a + s.items.length, 0);
const withImg = menu.sections.reduce((a, s) => a + s.items.filter((i) => i.image).length, 0);
console.log(`Asignadas ${assigned} nuevas. Total con foto: ${withImg}/${total}.`);
