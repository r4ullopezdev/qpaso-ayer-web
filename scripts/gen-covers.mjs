// Genera arte SVG on-brand para cada evento (1200x630).
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "brand", "events");
mkdirSync(OUT, { recursive: true });

const EVENTS = [
  { slug: "lanzamiento-neon-party", title: "LANZAMIENTO NEON PARTY", motor: "GRAN REAPERTURA", c1: "#ff2fb0", c2: "#7b2ff7", accent: "#00ffd5" },
  { slug: "travelers-night", title: "TRAVELERS NIGHT", motor: "NOCHE DE VIAJEROS", c1: "#e4322b", c2: "#7a1512", accent: "#f5c542" },
  { slug: "college-thursdays", title: "COLLEGE THURSDAYS", motor: "JUEVES UNIVERSITARIO", c1: "#00c2a8", c2: "#063f39", accent: "#f5c542" },
  { slug: "panama-party", title: "PANAMA PARTY", motor: "VIERNES DE FIESTA", c1: "#f5c542", c2: "#b3730a", accent: "#e4322b" },
  { slug: "sunday-social", title: "SUNDAY SOCIAL", motor: "DOMINGO RELAJADO", c1: "#2b8ef5", c2: "#0c2a52", accent: "#f5c542" },
  { slug: "main-event-black-party", title: "MAIN EVENT BLACK PARTY", motor: "EL SABADO GRANDE", c1: "#222", c2: "#000", accent: "#f5c542" },
];

function wrap(title) {
  const words = title.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 14 && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function bulbs(y) {
  let s = "";
  for (let x = 60; x <= 1140; x += 40) {
    s += `<circle cx="${x}" cy="${y}" r="5" fill="#f5c542" opacity="0.85"/>`;
  }
  return s;
}

for (const e of EVENTS) {
  const lines = wrap(e.title);
  const startY = 315 - (lines.length - 1) * 46;
  const titleSvg = lines
    .map(
      (ln, i) =>
        `<text x="600" y="${startY + i * 92}" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="82" font-weight="900" fill="#ffffff" style="letter-spacing:1px">${ln}</text>`
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${e.c1}"/>
      <stop offset="1" stop-color="${e.c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="70%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b0a0d"/>
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="url(#g)"/>
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="url(#glow)"/>
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="none" stroke="${e.accent}" stroke-width="4"/>
  ${bulbs(70)}
  ${bulbs(560)}
  <text x="600" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${e.accent}" style="letter-spacing:6px">${e.motor}</text>
  ${titleSvg}
  <text x="600" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff" opacity="0.92" style="letter-spacing:3px">Q'PASO AYER · CALLE URUGUAY</text>
  <text x="600" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#ffffff" opacity="0.7" style="letter-spacing:4px">CIUDAD DE PANAMA</text>
</svg>`;
  writeFileSync(join(OUT, `${e.slug}.svg`), svg, "utf8");
  console.log("cover:", e.slug);
}
console.log("Listo.");
