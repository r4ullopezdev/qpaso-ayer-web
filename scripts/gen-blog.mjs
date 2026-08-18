// Genera 100+ artículos SEO (ES + EN) para el blog oculto.
// Salida: src/content/blog-articles.json
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "src", "content");
mkdirSync(OUT_DIR, { recursive: true });

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}
// hash estable para elegir variantes sin aleatoriedad
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const pick = (arr, seed) => arr[seed % arr.length];

// ---- Keywords ES ----
const ES = [
  ["vida nocturna en Panamá", "nightlife"],
  ["discotecas en Ciudad de Panamá", "nightlife"],
  ["mejores bares en Panamá", "nightlife"],
  ["dónde salir de noche en Panamá", "nightlife"],
  ["fiestas en Ciudad de Panamá", "nightlife"],
  ["clubes nocturnos en Panamá", "nightlife"],
  ["rooftop bars en Panamá", "nightlife"],
  ["qué hacer de noche en Ciudad de Panamá", "nightlife"],
  ["bares en Calle Uruguay", "calle-uruguay"],
  ["dónde salir en Calle Uruguay", "calle-uruguay"],
  ["mejores bares en Calle Uruguay 2026", "calle-uruguay"],
  ["discotecas en Calle Uruguay", "calle-uruguay"],
  ["vida nocturna en Bella Vista Panamá", "calle-uruguay"],
  ["dónde tomar algo en Calle Uruguay", "calle-uruguay"],
  ["Calle Uruguay vs Casco Viejo de noche", "calle-uruguay"],
  ["bar con juegos en Panamá", "juegos"],
  ["dónde jugar beer pong en Panamá", "juegos"],
  ["bares con billar y dardos en Panamá", "juegos"],
  ["planes divertidos de noche en Panamá", "juegos"],
  ["fiesta universitaria en Panamá", "universitario"],
  ["jueves universitario en Ciudad de Panamá", "universitario"],
  ["dónde salen los universitarios en Panamá", "universitario"],
  ["fiestas para jóvenes en Panamá", "universitario"],
  ["dónde salir de fiesta siendo turista en Panamá", "turismo"],
  ["vida nocturna para mochileros en Panamá", "turismo"],
  ["dónde conocer gente de noche en Panamá", "turismo"],
  ["fiesta para extranjeros en Ciudad de Panamá", "turismo"],
  ["qué hacer una noche en Ciudad de Panamá", "turismo"],
  ["after office en Ciudad de Panamá", "afterwork"],
  ["mejores after work en Panamá", "afterwork"],
  ["dónde ir después del trabajo en Bella Vista", "afterwork"],
  ["happy hour en Calle Uruguay", "afterwork"],
  ["planes de viernes por la noche en Panamá", "fin-de-semana"],
  ["planes de sábado por la noche en Panamá", "fin-de-semana"],
  ["dónde salir el fin de semana en Panamá", "fin-de-semana"],
  ["mejor fiesta del sábado en Ciudad de Panamá", "fin-de-semana"],
  ["lista gratis para entrar a discoteca en Panamá", "listas"],
  ["cómo entrar gratis a una fiesta en Panamá", "listas"],
  ["reservar mesa en discoteca en Panamá", "listas"],
  ["dónde celebrar un cumpleaños de noche en Panamá", "eventos"],
  ["dónde hacer una despedida de soltero en Panamá", "eventos"],
  ["música reggaetón en discotecas de Panamá", "musica"],
  ["dónde bailar reggaetón en Ciudad de Panamá", "musica"],
  ["fiestas temáticas en Panamá", "eventos"],
  ["dónde ver DJ en vivo en Panamá", "musica"],
  ["bares para grupos grandes en Panamá", "eventos"],
  ["cena y fiesta en el mismo lugar en Panamá", "restaurante"],
  ["dónde cenar antes de salir en Calle Uruguay", "restaurante"],
  ["mejores alitas y burgers de noche en Panamá", "restaurante"],
  ["ambiente de fiesta seguro en Panamá", "turismo"],
];

// ---- Keywords EN ----
const EN = [
  ["nightlife in Panama City", "nightlife"],
  ["best bars in Panama City", "nightlife"],
  ["clubs in Panama City", "nightlife"],
  ["where to party in Panama City", "nightlife"],
  ["things to do at night in Panama City", "nightlife"],
  ["rooftop bars in Panama City", "nightlife"],
  ["Panama City nightlife guide 2026", "nightlife"],
  ["best clubs in Panama", "nightlife"],
  ["Calle Uruguay nightlife", "calle-uruguay"],
  ["best bars in Calle Uruguay Panama", "calle-uruguay"],
  ["where to go out in Calle Uruguay", "calle-uruguay"],
  ["Bella Vista Panama nightlife", "calle-uruguay"],
  ["Calle Uruguay vs Casco Viejo nightlife", "calle-uruguay"],
  ["bars with games in Panama City", "juegos"],
  ["beer pong bars in Panama City", "juegos"],
  ["fun night out in Panama City", "juegos"],
  ["where to party in Panama City for tourists", "turismo"],
  ["Panama City nightlife for backpackers", "turismo"],
  ["cheap night out in Panama City", "turismo"],
  ["where to meet people at night in Panama City", "turismo"],
  ["solo traveler nightlife in Panama City", "turismo"],
  ["best night out in Panama City for foreigners", "turismo"],
  ["college parties in Panama City", "universitario"],
  ["Thursday nightlife in Panama City", "universitario"],
  ["student nightlife in Panama City", "universitario"],
  ["after work bars in Panama City", "afterwork"],
  ["happy hour in Calle Uruguay Panama", "afterwork"],
  ["business nightlife in Panama City", "afterwork"],
  ["Friday night in Panama City", "fin-de-semana"],
  ["Saturday night in Panama City", "fin-de-semana"],
  ["best weekend nightlife in Panama City", "fin-de-semana"],
  ["free guest list clubs in Panama City", "listas"],
  ["how to get on the guest list in Panama City", "listas"],
  ["bottle service and tables in Panama City", "listas"],
  ["birthday party venues at night in Panama City", "eventos"],
  ["bachelor party in Panama City nightlife", "eventos"],
  ["where to dance reggaeton in Panama City", "musica"],
  ["live DJ nightlife in Panama City", "musica"],
  ["themed parties in Panama City", "eventos"],
  ["big group night out in Panama City", "eventos"],
  ["dinner and party in one place Panama City", "restaurante"],
  ["where to eat before going out in Calle Uruguay", "restaurante"],
  ["best wings and burgers late night Panama City", "restaurante"],
  ["safe nightlife in Panama City", "turismo"],
  ["Panama City party this weekend", "fin-de-semana"],
  ["neon party in Panama City", "eventos"],
  ["ladies night in Panama City", "listas"],
  ["what to do in Panama City at night as a tourist", "turismo"],
  ["best latin nightlife in Panama City", "musica"],
  ["Panama City bar crawl alternative", "turismo"],
];

// ---------- Plantillas ES ----------
const T_ES = {
  intro: (kw) => [
    `Si buscas ${kw.toLowerCase()}, tienes que conocer Calle Uruguay: la milla dorada de la noche en Ciudad de Panamá. Y en su corazón está Q'Paso Ayer, el lugar donde empieza la noche.`,
    `${cap(kw)} ya no es un misterio. La movida de Ciudad de Panamá late en Calle Uruguay, y Q'Paso Ayer se ha convertido en su nuevo punto de encuentro: cena, juegos, tragos y fiesta.`,
    `Hablemos de ${kw.toLowerCase()}. En Panamá la noche arranca temprano y en un sitio concreto: Calle Uruguay. Aquí tienes el plan completo para no fallar.`,
    `¿Buscando ${kw.toLowerCase()}? Esta guía rápida te lleva directo a donde está pasando: Calle Uruguay, Bella Vista, y el ambiente de Q'Paso Ayer.`,
  ],
  expect: () => [
    "Ambiente que sube de intensidad con la noche: cena informal y after temprano, juegos y calentamiento a media noche, y fiesta con DJ hasta tarde.",
    "Un formato que muta con las horas: llegas, comes algo para compartir, juegas una ronda y te quedas para la mejor parte de la noche.",
    "Energía real, música latina y urbana, y una mezcla única de gente local y viajeros de todo el mundo.",
  ],
  venue:
    "Q'Paso Ayer no es un bar cualquiera: es un punto de encuentro. Cena para compartir (alitas, burgers, nachos), juegos como beer pong y dardos, tragos, y una programación distinta cada noche — de martes a domingo. Cada noche tiene su motivo, así que siempre está pasando algo.",
  lists:
    "Lo mejor: puedes apuntarte GRATIS a la lista de cada evento. Eliges tu grupo (chicas o chicos), dejas tu nombre y tienes entrada gratis hasta la hora indicada. Sin pagos online, sin complicaciones.",
  tips: () => [
    "Llega temprano: la entrada gratis por lista tiene hora límite y las mejores mesas vuelan.",
    "Apúntate antes por la web para asegurar tu lugar en la lista de la noche.",
    "¿Vienes en grupo? Escribe por WhatsApp para reservar mesa y no hacer fila.",
  ],
  hood:
    "Calle Uruguay está en Bella Vista, a minutos del Área Bancaria y de los principales hoteles y hostales de Ciudad de Panamá. Es la zona más cómoda para salir sin depender de traslados largos, y el mejor punto para arrancar la noche.",
  faq: (kw) => [
    [`¿Dónde queda el mejor plan para ${kw.toLowerCase()}?`, "En Calle Uruguay, Bella Vista, Ciudad de Panamá. Q'Paso Ayer está en plena zona nocturna."],
    ["¿Cómo entro gratis?", "Apúntate a la lista del evento eligiendo chicas o chicos. Cada lista tiene entrada gratis hasta una hora distinta."],
    ["¿Tienen comida?", "Sí. Cena informal para compartir antes de la fiesta: alitas, burgers, nachos y tragos."],
  ],
};

// ---------- Plantillas EN ----------
const T_EN = {
  intro: (kw) => [
    `Looking for ${kw.toLowerCase()}? You need to know Calle Uruguay — the golden mile of nightlife in Panama City. And at its heart is Q'Paso Ayer, the place where the night begins.`,
    `${cap(kw)} is no secret. Panama City's scene beats on Calle Uruguay, and Q'Paso Ayer has become its new meeting point: dinner, games, drinks and a real party.`,
    `Let's talk about ${kw.toLowerCase()}. In Panama the night starts early and in one spot: Calle Uruguay. Here's the full plan so you don't miss out.`,
    `Searching for ${kw.toLowerCase()}? This quick guide takes you straight to where it's happening: Calle Uruguay, Bella Vista, and the vibe at Q'Paso Ayer.`,
  ],
  expect: () => [
    "A vibe that builds with the night: casual dinner and early after-work, games and warm-up around midnight, and a DJ party until late.",
    "A format that shifts with the hours: you arrive, share some food, play a round and stay for the best part of the night.",
    "Real energy, Latin and urban music, and a unique mix of locals and travelers from all over the world.",
  ],
  venue:
    "Q'Paso Ayer isn't just another bar — it's a meeting point. Shareable food (wings, burgers, nachos), games like beer pong and darts, drinks, and a different lineup every night from Tuesday to Sunday. Every night has a reason, so something is always happening.",
  lists:
    "Best part: you can join the FREE guest list for each event. Pick your group (girls or guys), drop your name and get free entry until the listed time. No online payments, no hassle.",
  tips: () => [
    "Come early: the free guest-list entry has a cut-off time and the best tables go fast.",
    "Sign up online in advance to lock in your spot on the night's list.",
    "Coming with a group? Message us on WhatsApp to book a table and skip the line.",
  ],
  hood:
    "Calle Uruguay is in Bella Vista, minutes from the Banking Area and from Panama City's main hotels and hostels. It's the easiest area for a night out without long transfers — and the best spot to kick off the night.",
  faq: (kw) => [
    [`Where is the best spot for ${kw.toLowerCase()}?`, "In Calle Uruguay, Bella Vista, Panama City. Q'Paso Ayer sits right in the nightlife zone."],
    ["How do I get in for free?", "Join the event's guest list by choosing girls or guys. Each list has free entry until a different time."],
    ["Do you have food?", "Yes. Casual shareable dinner before the party: wings, burgers, nachos and drinks."],
  ],
};

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildArticle(kw, cluster, lang, index) {
  const T = lang === "es" ? T_ES : T_EN;
  const seed = hash(kw + lang);
  const slug = slugify((lang === "en" ? "en-" : "") + kw);
  const title =
    lang === "es"
      ? `${cap(kw)}: guía 2026 (Calle Uruguay)`
      : `${cap(kw)}: 2026 guide (Calle Uruguay)`;
  const description =
    lang === "es"
      ? `${cap(kw)} en Ciudad de Panamá. Descubre Calle Uruguay y Q'Paso Ayer: eventos, listas gratis, juegos, cena y fiesta. Guía 2026.`
      : `${cap(kw)} in Panama City. Discover Calle Uruguay and Q'Paso Ayer: events, free guest lists, games, dinner and party. 2026 guide.`;

  const L = (o) => (lang === "es" ? o.es : o.en);
  const sections = [
    { h2: L({ es: "Qué vas a encontrar", en: "What to expect" }), body: pick(T.expect(), seed) },
    { h2: L({ es: "Por qué Q'Paso Ayer", en: "Why Q'Paso Ayer" }), body: T.venue },
    { h2: L({ es: "Entra gratis a la lista", en: "Get in free on the list" }), body: T.lists },
    { h2: L({ es: "Tips para tu noche", en: "Tips for your night" }), body: pick(T.tips(), seed + 1) + " " + pick(T.tips(), seed + 2) },
    { h2: L({ es: "La zona: Calle Uruguay", en: "The area: Calle Uruguay" }), body: T.hood },
  ];

  return {
    slug,
    lang,
    cluster,
    keyword: kw,
    title,
    description,
    h1: cap(kw),
    intro: pick(T.intro(kw), seed),
    sections,
    faqs: T.faq(kw).map(([q, a]) => ({ q, a })),
  };
}

const articles = [];
ES.forEach(([kw, c], i) => articles.push(buildArticle(kw, c, "es", i)));
EN.forEach(([kw, c], i) => articles.push(buildArticle(kw, c, "en", i)));

// enlaces internos: 4 relacionados del mismo idioma
for (const a of articles) {
  const same = articles.filter((x) => x.lang === a.lang && x.slug !== a.slug);
  const start = hash(a.slug) % same.length;
  a.related = [0, 1, 2, 3].map((k) => same[(start + k) % same.length].slug);
}

// dedupe slugs
const seen = new Set();
for (const a of articles) {
  let s = a.slug, n = 1;
  while (seen.has(s)) { n++; s = `${a.slug}-${n}`; }
  a.slug = s; seen.add(s);
}

writeFileSync(join(OUT_DIR, "blog-articles.json"), JSON.stringify(articles, null, 2), "utf8");
console.log(`Generados ${articles.length} artículos (${ES.length} ES + ${EN.length} EN).`);
