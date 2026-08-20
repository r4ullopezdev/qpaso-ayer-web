// Genera imágenes SVG de botellas/copas por categoría de bebida (para licores sin foto real).
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "menu", "cat");
mkdirSync(OUT, { recursive: true });

const BG = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#241b30"/><stop offset="1" stop-color="#0f0c15"/>
  </linearGradient>
  <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.05"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
</defs>
<rect width="400" height="400" fill="url(#bg)"/>`;

function wrap(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">${BG}${inner}</svg>`;
}

// Botella estándar (licor): cuerpo con hombros, cuello, tapa, etiqueta
function bottle({ glass, cap, label, labelText, capH = 26 }) {
  return wrap(`
  <g>
    <!-- tapa -->
    <rect x="182" y="70" width="36" height="${capH}" rx="4" fill="${cap}"/>
    <!-- cuello -->
    <rect x="186" y="${70 + capH - 2}" width="28" height="34" fill="${glass}"/>
    <!-- hombros + cuerpo -->
    <path d="M186 ${100 + capH} q0 14 -18 26 q-14 9 -14 30 v130 q0 18 18 18 h56 q18 0 18 -18 v-130 q0 -21 -14 -30 q-18 -12 -18 -26 z" fill="${glass}"/>
    <!-- brillo -->
    <rect x="166" y="150" width="14" height="150" rx="7" fill="url(#shine)"/>
    <!-- etiqueta -->
    <rect x="158" y="205" width="84" height="70" rx="6" fill="${label}"/>
    <rect x="158" y="205" width="84" height="16" rx="6" fill="rgba(0,0,0,0.15)"/>
    <text x="200" y="248" text-anchor="middle" font-family="Georgia, serif" font-size="16" font-weight="700" fill="#1a1300">${labelText}</text>
  </g>`);
}

// Botella de vino
function wine({ glass, label, labelText }) {
  return wrap(`
  <g>
    <rect x="190" y="60" width="20" height="70" fill="${glass}"/>
    <rect x="188" y="58" width="24" height="14" rx="3" fill="#4a2a2a"/>
    <path d="M190 128 q-24 10 -24 46 v130 q0 16 16 16 h36 q16 0 16 -16 v-130 q0 -36 -24 -46 z" fill="${glass}"/>
    <rect x="176" y="170" width="10" height="140" rx="5" fill="url(#shine)"/>
    <rect x="168" y="210" width="64" height="70" rx="4" fill="${label}"/>
    <text x="200" y="252" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#1a1300">${labelText}</text>
  </g>`);
}

// Botella de champaña
function champagne({ glass, label }) {
  return wrap(`
  <g>
    <rect x="184" y="56" width="32" height="26" rx="4" fill="#c9a24b"/>
    <rect x="190" y="80" width="20" height="46" fill="${glass}"/>
    <path d="M190 124 q-30 14 -30 54 v120 q0 16 16 16 h48 q16 0 16 -16 v-120 q0 -40 -30 -54 z" fill="${glass}"/>
    <rect x="172" y="170" width="10" height="130" rx="5" fill="url(#shine)"/>
    <rect x="164" y="212" width="72" height="64" rx="4" fill="${label}"/>
    <text x="200" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#1a1300">Champagne</text>
  </g>`);
}

// Botella de cerveza
function beer() {
  return wrap(`
  <g>
    <rect x="188" y="70" width="24" height="10" rx="2" fill="#c9a24b"/>
    <rect x="190" y="80" width="20" height="46" fill="#3a7a2a"/>
    <path d="M190 124 q-22 12 -22 42 v128 q0 16 16 16 h32 q16 0 16 -16 v-128 q0 -30 -22 -42 z" fill="#3a7a2a"/>
    <rect x="176" y="160" width="9" height="130" rx="4" fill="url(#shine)"/>
    <rect x="164" y="205" width="72" height="66" rx="5" fill="#f5c542"/>
    <text x="200" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#1a1300">BEER</text>
  </g>`);
}

// Copa de coctel (martini)
function cocktail() {
  return wrap(`
  <g stroke="#f5c542" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <path d="M120 130 L280 130 L200 220 Z" fill="rgba(245,197,66,0.15)"/>
    <line x1="200" y1="220" x2="200" y2="300"/>
    <line x1="160" y1="300" x2="240" y2="300"/>
  </g>
  <circle cx="245" cy="150" r="10" fill="#e4322b"/>`);
}

// Vaso de jugo con pajilla
function juice({ color = "#f5a623", label = "Juice" }) {
  return wrap(`
  <g>
    <path d="M150 120 h100 l-12 180 q-2 14 -16 14 h-44 q-14 0 -16 -14 z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" stroke-width="3"/>
    <path d="M156 175 h88 l-9 125 q-1 9 -11 9 h-48 q-10 0 -11 -9 z" fill="${color}"/>
    <line x1="235" y1="90" x2="215" y2="200" stroke="#e4322b" stroke-width="8" stroke-linecap="round"/>
  </g>`);
}

// Lata de soda
function soda() {
  return wrap(`
  <g>
    <rect x="150" y="110" width="100" height="180" rx="16" fill="#c0c4cc"/>
    <rect x="150" y="110" width="100" height="180" rx="16" fill="url(#shine)"/>
    <rect x="150" y="150" width="100" height="80" fill="#e4322b"/>
    <text x="200" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#fff">SODA</text>
    <ellipse cx="200" cy="110" rx="50" ry="10" fill="#9aa0aa"/>
  </g>`);
}

const files = {
  "rum.svg": bottle({ glass: "#7a3b12", cap: "#3a1e08", label: "#e8c98a", labelText: "RON" }),
  "whisky.svg": bottle({ glass: "#8a5a1e", cap: "#2a1a08", label: "#e8c98a", labelText: "WHISKY" }),
  "vodka.svg": bottle({ glass: "#7fb2d6", cap: "#2b4a5e", label: "#eef4f8", labelText: "VODKA" }),
  "gin.svg": bottle({ glass: "#2f6b3a", cap: "#173a20", label: "#dbead0", labelText: "GIN" }),
  "tequila.svg": bottle({ glass: "#cdb06a", cap: "#7a5a1e", label: "#f3ead0", labelText: "TEQUILA" }),
  "aguardiente.svg": bottle({ glass: "#c9d2d6", cap: "#5e6a70", label: "#eef4f8", labelText: "SECO" }),
  "liqueur.svg": bottle({ glass: "#5a3a2a", cap: "#2a1810", label: "#e8c98a", labelText: "LICOR" }),
  "wine.svg": wine({ glass: "#4a1220", label: "#e8c98a", labelText: "VINO" }),
  "champagne.svg": champagne({ glass: "#b9922e", label: "#f3ead0" }),
  "beer.svg": beer(),
  "cocktail.svg": cocktail(),
  "juice.svg": juice({}),
  "soda.svg": soda(),
};

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(OUT, name), svg, "utf8");
  console.log("bottle:", name);
}
console.log("Listo:", Object.keys(files).length, "imágenes en public/menu/cat/");
