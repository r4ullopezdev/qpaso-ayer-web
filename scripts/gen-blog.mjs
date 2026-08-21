// Genera artículos SEO (ES + EN) para el blog. Contenido rico y variado por cluster.
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
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const pick = (arr, seed) => arr[seed % arr.length];
function picks(arr, seed, n) {
  // n elementos distintos, deterministas
  const out = [];
  const used = new Set();
  let i = 0;
  while (out.length < Math.min(n, arr.length)) {
    const idx = (seed + i * 7) % arr.length;
    if (!used.has(idx)) { used.add(idx); out.push(arr[idx]); }
    i++;
    if (i > arr.length * 3) break;
  }
  return out;
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
const lc = (s) => s.toLowerCase();

// =================== KEYWORDS ES ===================
const ES = [
  // --- originales ---
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
  ["Calle Uruguay vs Casco Viejo de noche", "zonas"],
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
  // --- NUEVAS (100) ---
  // turismo (foco fuerte)
  ["qué hacer en Panamá de noche en una escala", "turismo"],
  ["vida nocturna en Panamá para turistas 2026", "turismo"],
  ["salir de noche cerca del aeropuerto de Panamá", "turismo"],
  ["fiesta en Panamá durante una escala de Copa", "turismo"],
  ["dónde salir de noche cerca de hoteles en Panamá", "turismo"],
  ["vida nocturna en Panamá para nómadas digitales", "turismo"],
  ["dónde salir de noche siendo mujer sola en Panamá", "turismo"],
  ["vida nocturna en Panamá para expats", "turismo"],
  ["primera noche en Ciudad de Panamá qué hacer", "turismo"],
  ["dónde salir de noche cerca de hostales en Panamá", "turismo"],
  ["vida nocturna en Panamá para colombianos", "turismo"],
  ["vida nocturna en Panamá para españoles", "turismo"],
  ["es seguro salir de noche en Ciudad de Panamá", "turismo"],
  ["cómo moverse de noche en Panamá en Uber o taxi", "turismo"],
  ["cuánto cuesta salir de fiesta en Panamá", "turismo"],
  ["qué ponerse para salir de noche en Panamá", "turismo"],
  ["vida nocturna en Panamá para pasajeros de crucero", "turismo"],
  ["dónde tomar algo cerca de Multiplaza Panamá", "turismo"],
  ["planes de noche cerca de la Cinta Costera", "turismo"],
  ["guía de fiesta en Panamá para tu primer viaje", "turismo"],
  ["dónde salir de noche recién llegado a Panamá", "turismo"],
  ["bar recomendado para turistas en Ciudad de Panamá", "turismo"],
  ["dónde bailar siendo turista en Ciudad de Panamá", "turismo"],
  ["mejor plan nocturno para viajeros en Panamá", "turismo"],
  ["vida nocturna en Panamá para grupos de amigos de viaje", "turismo"],
  // zonas y comparativas
  ["vida nocturna en Marbella Panamá", "zonas"],
  ["bares en Obarrio Panamá", "zonas"],
  ["vida nocturna en El Cangrejo Panamá", "zonas"],
  ["dónde salir en Punta Pacífica de noche", "zonas"],
  ["Calle Uruguay vs Amador de noche", "zonas"],
  ["Calle Uruguay vs Marbella de noche", "zonas"],
  ["mejor zona para salir de fiesta en Ciudad de Panamá", "zonas"],
  ["bares cerca del Área Bancaria de Panamá", "zonas"],
  ["dónde salir de noche en el centro de Ciudad de Panamá", "zonas"],
  ["vida nocturna cerca de Vía España", "zonas"],
  ["dónde salir de noche en Bella Vista Panamá", "zonas"],
  ["mapa de la noche en Calle Uruguay", "zonas"],
  // temporada
  ["dónde salir en Carnaval en Ciudad de Panamá", "temporada"],
  ["fiesta de fin de año en Ciudad de Panamá", "temporada"],
  ["dónde celebrar Año Nuevo de fiesta en Panamá", "temporada"],
  ["planes de noche en fiestas patrias de Panamá", "temporada"],
  ["vida nocturna en temporada alta en Panamá", "temporada"],
  ["dónde salir un feriado en Ciudad de Panamá", "temporada"],
  ["planes de Halloween de noche en Panamá", "temporada"],
  ["fiesta de San Valentín de noche en Panamá", "temporada"],
  ["dónde salir en vacaciones en Ciudad de Panamá", "temporada"],
  // eventos
  ["ladies night en Ciudad de Panamá", "eventos"],
  ["fiesta de neón en Ciudad de Panamá", "eventos"],
  ["fiesta temática de los 2000 en Panamá", "eventos"],
  ["fiesta blanca en Ciudad de Panamá", "eventos"],
  ["dónde celebrar una graduación de noche en Panamá", "eventos"],
  ["dónde hacer una despedida de soltera en Panamá", "eventos"],
  ["fiesta de cumpleaños sorpresa en Panamá", "eventos"],
  ["dónde salir en tu cumpleaños gratis en Panamá", "eventos"],
  ["dónde hacer un after de empresa en Panamá", "eventos"],
  ["reservar para un grupo grande de noche en Panamá", "eventos"],
  // juegos
  ["torneo de beer pong en Ciudad de Panamá", "juegos"],
  ["bar con jenga gigante en Panamá", "juegos"],
  ["juegos para beber en grupo en Panamá", "juegos"],
  ["bar con dardos en Ciudad de Panamá", "juegos"],
  ["plan diferente de noche en Panamá que no sea solo bailar", "juegos"],
  ["bar para jugar en pareja en Panamá", "juegos"],
  // musica
  ["dónde bailar salsa en Ciudad de Panamá", "musica"],
  ["dónde escuchar música urbana en Panamá", "musica"],
  ["fiesta de reggaetón viejo en Panamá", "musica"],
  ["dónde hay DJ los fines de semana en Panamá", "musica"],
  ["mejor música para salir de fiesta en Panamá", "musica"],
  ["dónde bailar de todo un poco en Ciudad de Panamá", "musica"],
  ["fiesta latina en Ciudad de Panamá", "musica"],
  ["dónde suena afrobeats en Ciudad de Panamá", "musica"],
  // afterwork
  ["after office los viernes en Ciudad de Panamá", "afterwork"],
  ["dónde tomar cerveza después del trabajo en Panamá", "afterwork"],
  ["happy hour 2x1 en Ciudad de Panamá", "afterwork"],
  ["plan de jueves después del trabajo en Panamá", "afterwork"],
  ["bar para ir al salir de la oficina en Bella Vista", "afterwork"],
  ["dónde relajarse un viernes por la tarde en Panamá", "afterwork"],
  // universitario
  ["dónde salen los universitarios los jueves en Panamá", "universitario"],
  ["fiesta barata para estudiantes en Ciudad de Panamá", "universitario"],
  ["plan de noche para jóvenes de 18 a 25 en Panamá", "universitario"],
  ["dónde salir siendo estudiante de intercambio en Panamá", "universitario"],
  ["after de la universidad en Ciudad de Panamá", "universitario"],
  ["fiesta universitaria con lista gratis en Panamá", "universitario"],
  // listas
  ["cómo reservar mesa en un bar en Ciudad de Panamá", "listas"],
  ["entrada gratis para chicas en discotecas de Panamá", "listas"],
  ["hasta qué hora es gratis entrar a la fiesta en Panamá", "listas"],
  ["cómo apuntarse a la lista de un evento en Panamá", "listas"],
  ["cuánto cuesta una mesa VIP en discotecas de Panamá", "listas"],
  ["cómo entrar sin fila a una discoteca en Panamá", "listas"],
  ["a qué hora abre la fiesta en Ciudad de Panamá", "listas"],
  // fin de semana
  ["qué hacer un viernes en Ciudad de Panamá", "fin-de-semana"],
  ["qué hacer un sábado por la noche en Panamá", "fin-de-semana"],
  ["planes de domingo por la noche en Panamá", "fin-de-semana"],
  ["mejor plan de fin de semana en Ciudad de Panamá", "fin-de-semana"],
  ["dónde empezar la noche del sábado en Panamá", "fin-de-semana"],
  ["qué hacer este fin de semana en Ciudad de Panamá", "fin-de-semana"],
  // nightlife
  ["mejores discotecas de Ciudad de Panamá 2026", "nightlife"],
  ["dónde salir de noche por primera vez en Panamá", "nightlife"],
  ["bares abiertos hasta tarde en Ciudad de Panamá", "nightlife"],
  ["dónde hay buena fiesta entre semana en Panamá", "nightlife"],
  ["plan de noche completo en Ciudad de Panamá", "nightlife"],
  ["dónde salir de noche en pareja en Panamá", "nightlife"],
  ["bar y discoteca en el mismo lugar en Panamá", "nightlife"],
  ["dónde salir de noche sin gastar mucho en Panamá", "nightlife"],
  // restaurante
  ["dónde comer alitas de noche en Ciudad de Panamá", "restaurante"],
  ["cena para compartir antes de la fiesta en Panamá", "restaurante"],
];

// =================== KEYWORDS EN ===================
const EN = [
  // --- originales ---
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
  ["Calle Uruguay vs Casco Viejo nightlife", "zonas"],
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
  // --- NUEVAS (100) ---
  // turismo (foco fuerte)
  ["what to do in Panama City during a layover at night", "turismo"],
  ["Panama City nightlife for tourists 2026", "turismo"],
  ["night out near Tocumen airport Panama", "turismo"],
  ["Copa Airlines layover night out in Panama City", "turismo"],
  ["nightlife near hotels in Panama City", "turismo"],
  ["Panama City nightlife for digital nomads", "turismo"],
  ["solo female traveler night out in Panama City", "turismo"],
  ["Panama City nightlife for expats", "turismo"],
  ["first night in Panama City what to do", "turismo"],
  ["nightlife near hostels in Panama City", "turismo"],
  ["is it safe to go out at night in Panama City", "turismo"],
  ["how to get around Panama City at night Uber taxi", "turismo"],
  ["how much does a night out cost in Panama City", "turismo"],
  ["what to wear for a night out in Panama City", "turismo"],
  ["Panama City nightlife for cruise passengers", "turismo"],
  ["nightlife near Multiplaza Panama", "turismo"],
  ["night plans near Cinta Costera Panama", "turismo"],
  ["Panama City party guide for first-time visitors", "turismo"],
  ["where to go out just arrived in Panama City", "turismo"],
  ["recommended bar for tourists in Panama City", "turismo"],
  ["where to dance as a tourist in Panama City", "turismo"],
  ["best night out for travelers in Panama City", "turismo"],
  ["Panama City nightlife for a group of friends traveling", "turismo"],
  ["English speaking nightlife in Panama City", "turismo"],
  ["Panama City stopover nightlife", "turismo"],
  // zonas
  ["Marbella Panama nightlife", "zonas"],
  ["bars in Obarrio Panama", "zonas"],
  ["El Cangrejo Panama nightlife", "zonas"],
  ["where to go out in Punta Pacifica at night", "zonas"],
  ["Calle Uruguay vs Amador nightlife", "zonas"],
  ["Calle Uruguay vs Marbella nightlife", "zonas"],
  ["best area for nightlife in Panama City", "zonas"],
  ["bars near the Banking Area Panama City", "zonas"],
  ["where to go out in downtown Panama City", "zonas"],
  ["nightlife near Via Espana Panama", "zonas"],
  ["where to go out in Bella Vista Panama City", "zonas"],
  ["Calle Uruguay nightlife map", "zonas"],
  // temporada
  ["where to go out during Carnival in Panama City", "temporada"],
  ["New Year's Eve party in Panama City", "temporada"],
  ["where to celebrate New Year nightlife in Panama City", "temporada"],
  ["nightlife during Panama holidays", "temporada"],
  ["Panama City nightlife in high season", "temporada"],
  ["where to go out on a public holiday in Panama City", "temporada"],
  ["Halloween night out in Panama City", "temporada"],
  ["Valentine's Day night out in Panama City", "temporada"],
  ["where to go out on vacation in Panama City", "temporada"],
  // eventos
  ["ladies night out in Panama City", "eventos"],
  ["neon party venue in Panama City", "eventos"],
  ["2000s throwback party in Panama City", "eventos"],
  ["white party in Panama City", "eventos"],
  ["where to celebrate a graduation at night in Panama City", "eventos"],
  ["bachelorette party in Panama City nightlife", "eventos"],
  ["surprise birthday party venue in Panama City", "eventos"],
  ["where to go out free on your birthday in Panama City", "eventos"],
  ["company after party venue in Panama City", "eventos"],
  ["book for a large group at night in Panama City", "eventos"],
  // juegos
  ["beer pong tournament in Panama City", "juegos"],
  ["giant jenga bar in Panama City", "juegos"],
  ["drinking games with a group in Panama City", "juegos"],
  ["darts bar in Panama City", "juegos"],
  ["different night out in Panama City not just dancing", "juegos"],
  ["date night games bar in Panama City", "juegos"],
  // musica
  ["where to dance salsa in Panama City", "musica"],
  ["where to hear urban music in Panama City", "musica"],
  ["old school reggaeton party in Panama City", "musica"],
  ["where to find a DJ on weekends in Panama City", "musica"],
  ["best music for a night out in Panama City", "musica"],
  ["where to dance a bit of everything in Panama City", "musica"],
  ["latin party in Panama City", "musica"],
  ["where they play afrobeats in Panama City", "musica"],
  // afterwork
  ["Friday after work in Panama City", "afterwork"],
  ["where to grab a beer after work in Panama City", "afterwork"],
  ["2 for 1 happy hour in Panama City", "afterwork"],
  ["Thursday after work plan in Panama City", "afterwork"],
  ["bar to go after leaving the office in Bella Vista", "afterwork"],
  ["where to unwind on a Friday evening in Panama City", "afterwork"],
  // universitario
  ["where students go out on Thursdays in Panama City", "universitario"],
  ["cheap party for students in Panama City", "universitario"],
  ["night plan for young adults 18 to 25 in Panama City", "universitario"],
  ["nightlife for exchange students in Panama City", "universitario"],
  ["university after party in Panama City", "universitario"],
  ["college party with free guest list in Panama City", "universitario"],
  // listas
  ["how to book a table at a bar in Panama City", "listas"],
  ["free entry for girls at clubs in Panama City", "listas"],
  ["until what time is free entry to the party in Panama City", "listas"],
  ["how to join the guest list for an event in Panama City", "listas"],
  ["how much is a VIP table at clubs in Panama City", "listas"],
  ["how to skip the line at a club in Panama City", "listas"],
  ["what time does the party start in Panama City", "listas"],
  // fin de semana
  ["what to do on a Friday in Panama City", "fin-de-semana"],
  ["what to do on a Saturday night in Panama City", "fin-de-semana"],
  ["Sunday night plans in Panama City", "fin-de-semana"],
  ["best weekend plan in Panama City", "fin-de-semana"],
  ["where to start the Saturday night in Panama City", "fin-de-semana"],
  // nightlife
  ["best clubs in Panama City 2026", "nightlife"],
  ["where to go out for the first time in Panama City", "nightlife"],
  ["bars open late in Panama City", "nightlife"],
  ["good midweek party in Panama City", "nightlife"],
  ["a complete night out in Panama City", "nightlife"],
  ["where to go out as a couple at night in Panama City", "nightlife"],
  ["bar and club in one place in Panama City", "nightlife"],
  // restaurante
  ["where to eat wings at night in Panama City", "restaurante"],
  ["shareable dinner before the party in Panama City", "restaurante"],
];

// =================== CONTENIDO ES ===================
const ES_TITLES = [
  (kw) => `${cap(kw)}: guía 2026`,
  (kw) => `${cap(kw)} — Calle Uruguay, Panamá`,
  (kw) => `${cap(kw)}: el plan que funciona`,
  (kw) => `${cap(kw)} (2026) | Q'Paso Ayer`,
];
const ES_DESC = [
  (kw) => `${cap(kw)}: Calle Uruguay, Bella Vista. En Q'Paso Ayer tienes cena para compartir, juegos, listas gratis y fiesta con DJ de martes a domingo. Guía 2026.`,
  (kw) => `Guía práctica de ${lc(kw)}: horarios, cómo entrar gratis por lista, qué esperar y por qué Q'Paso Ayer (Calle Uruguay) es el mejor punto de arranque.`,
  (kw) => `Todo sobre ${lc(kw)} en Ciudad de Panamá: zona, ambiente, precios, reservas y listas gratis. Empieza la noche en Q'Paso Ayer, Calle Uruguay.`,
];
const ES_INTRO = [
  (kw) => `Si buscas ${lc(kw)}, hay un punto de partida claro: Calle Uruguay, la milla dorada de la noche en Ciudad de Panamá. Y en su corazón está Q'Paso Ayer, donde empieza la noche con cena, juegos y fiesta.`,
  (kw) => `Hablemos de ${lc(kw)} sin rodeos. La movida de Ciudad de Panamá se concentra en Bella Vista, y Q'Paso Ayer (Calle Uruguay) se ha vuelto el sitio para arrancar: comes algo, juegas una ronda y te quedas para la mejor parte.`,
  (kw) => `¿Planeando ${lc(kw)}? Esta guía te lleva directo a lo que importa: dónde ir, a qué hora, cómo entrar gratis por lista y qué esperar. Spoiler: empieza en Q'Paso Ayer, Calle Uruguay.`,
  (kw) => `${cap(kw)} tiene truco: elegir bien dónde empezar. En Ciudad de Panamá ese sitio es Calle Uruguay, y Q'Paso Ayer es el arranque perfecto — de martes a domingo siempre pasa algo.`,
];

// bloques base ES (variantes)
const ES_VENUE = [
  "Q'Paso Ayer no es un bar más: es un punto de encuentro en plena Calle Uruguay. Cena informal para compartir (alitas, burgers, nachos), juegos como beer pong y dardos, tragos bien servidos y una programación distinta cada noche, de martes a domingo. Cada noche tiene su motivo, así que siempre hay ambiente.",
  "Lo que hace especial a Q'Paso Ayer es el formato todo-en-uno: cenas, juegas y terminas de fiesta sin cambiar de sitio. Está en Calle Uruguay (Bella Vista), con música latina y urbana, y una energía que sube según avanza la noche. Ideal para grupos, parejas y quien llega solo buscando ambiente.",
  "En Q'Paso Ayer la noche tiene guion: llegas para la cena y el after temprano, sigues con juegos y calentamiento, y te quedas para el DJ. Todo en Calle Uruguay, la zona más viva de Ciudad de Panamá. Comida para compartir, tragos y buena mezcla de gente local y viajera.",
];
const ES_LISTS = [
  "Lo mejor para el bolsillo: puedes apuntarte GRATIS a la lista de cada evento. Eliges tu grupo (chicas o chicos), dejas tu nombre y tienes entrada gratis hasta la hora indicada. Sin pagos online y sin complicaciones — solo llega antes del cierre de lista.",
  "La entrada por lista es gratis hasta cierta hora: te apuntas por la web, eliges lista de chicas o de chicos, y entras sin pagar cover si llegas a tiempo. Es la forma más lista de salir sin gastar de más en Ciudad de Panamá.",
  "¿No quieres pagar cover? Apúntate a la lista del evento antes de salir. Cada lista (chicas o chicos) tiene entrada gratis hasta una hora distinta; después se aplica el cover normal. Reservar mesa para grupos también evita fila.",
];
const ES_TIPS = [
  "Llega temprano: la entrada gratis por lista tiene hora límite y las mejores mesas vuelan.",
  "Apúntate antes por la web para asegurar tu lugar en la lista de la noche.",
  "¿Vienes en grupo? Escribe por WhatsApp (+507 6931-2305) para reservar mesa y no hacer fila.",
  "Cena algo al llegar: bajas el ritmo, compartes con el grupo y aguantas mejor la noche.",
  "Consulta la agenda de la semana: cada noche tiene una temática distinta, de martes a domingo.",
];
const ES_AREA = [
  "Calle Uruguay está en Bella Vista, a minutos del Área Bancaria y de los principales hoteles y hostales de Ciudad de Panamá. Es la zona más cómoda para salir sin depender de traslados largos, con todo a distancia caminable y taxis/Uber a la mano.",
  "La ventaja de Calle Uruguay es la concentración: bares, cocinas y discotecas en pocas cuadras, en Bella Vista. Llegas en Uber en minutos desde casi cualquier hotel del centro, y te mueves a pie de un plan a otro sin perder la noche.",
];
const ES_TOURIST = [
  "Para el viajero, Calle Uruguay es la apuesta segura: está bien iluminada, con movimiento toda la noche y muy cerca de los hoteles de Bella Vista y Marbella. Usa Uber para llegar y volver (más previsible que el taxi de calle), lleva efectivo en dólares para propinas y guarda el teléfono en la pista. La moneda es el dólar estadounidense, así que no necesitas cambiar dinero.",
  "Consejo de viajero: llega en Uber, empieza con la cena para ubicarte y hacer grupo, y aprovecha la lista gratis para no gastar de más. Panamá usa el dólar y el ambiente en Calle Uruguay mezcla locales y extranjeros, así que es fácil socializar aunque vengas solo.",
];

// contenido por cluster ES: {h2, body}
const ES_CLUSTER = {
  nightlife: [
    { h2: "Cómo es la noche en Ciudad de Panamá", body: "La noche panameña arranca temprano y termina tarde: el after office empieza sobre las 6-7 pm, la cosa se anima después de las 10 y la fiesta fuerte va de medianoche en adelante. Bella Vista, y sobre todo Calle Uruguay, es el epicentro donde se junta todo: bares, cocinas y discotecas en pocas cuadras." },
    { h2: "Qué tipo de ambiente buscas", body: "¿Trago tranquilo y conversación, o pista y reggaetón? En Calle Uruguay tienes ambos a un par de puertas de distancia. Q'Paso Ayer resuelve la duda con un formato que cambia según la hora: relajado para cenar, animado para jugar y fiestero para cerrar." },
    { h2: "Entre semana también hay plan", body: "No hace falta esperar al sábado. De martes a domingo hay programación: jueves universitario, after office los viernes y temáticas de fin de semana. Entre semana suele haber menos fila y mejores mesas." },
  ],
  "calle-uruguay": [
    { h2: "Por qué Calle Uruguay", body: "Calle Uruguay es la 'milla dorada' de la noche en Ciudad de Panamá: una concentración de bares, restaurantes y discotecas en Bella Vista que la convierte en el sitio más práctico para salir. Empiezas en un lado con una cena y terminas al otro en la pista, todo caminando." },
    { h2: "Qué encontrarás en la zona", body: "Desde rooftops y cocteles hasta discotecas de reggaetón, pasando por bares con juegos como Q'Paso Ayer. La variedad es el punto fuerte: si un plan no te convence, el siguiente está a media cuadra." },
    { h2: "El punto de arranque", body: "Q'Paso Ayer funciona como base de operaciones: cena para compartir, juegos, listas gratis y fiesta. Llegas, comes, juegas y te quedas — o sales a explorar el resto de la calle con la noche ya empezada." },
  ],
  zonas: [
    { h2: "Las zonas de fiesta de Ciudad de Panamá", body: "Las principales son Calle Uruguay/Bella Vista (la más viva y variada), Casco Viejo (bonito y turístico, rooftops con vista, precios más altos), Marbella y Obarrio (bares de oficina y after office) y Amador (brisa y vista, más tranquilo). Para una primera noche, Calle Uruguay concentra lo mejor en menos espacio." },
    { h2: "Cómo elegir dónde salir", body: "Si quieres variedad y todo caminable, Calle Uruguay. Si buscas postal y rooftop, Casco Viejo. Si sales del trabajo, Marbella/Obarrio. Q'Paso Ayer, en Calle Uruguay, es la opción más versátil porque junta cena, juegos y fiesta en un solo sitio." },
    { h2: "Distancias y traslados", body: "Todo el centro nocturno está a 10-15 minutos en Uber entre sí. Calle Uruguay está pegada al Área Bancaria, así que desde la mayoría de hoteles llegas rapidísimo. Moverse a pie dentro de la calle es lo normal." },
  ],
  turismo: [
    { h2: "Guía rápida para el viajero", body: "Panamá usa el dólar estadounidense, así que no necesitas cambiar moneda. La noche se concentra en Bella Vista (Calle Uruguay), cerca de la mayoría de hoteles. Muévete en Uber, empieza con una cena para ubicarte y aprovecha las listas gratis para no gastar de más." },
    { h2: "Seguridad y sentido común", body: "Calle Uruguay es de las zonas más transitadas y con movimiento toda la noche. Como en cualquier ciudad grande: usa Uber para llegar y volver, no exhibas objetos de valor, cuida tu trago y vuelve con el grupo. Con eso, la noche es tranquila y muy divertida." },
    { h2: "Ideal para conocer gente", body: "El ambiente mezcla locales y viajeros de todo el mundo, así que es fácil hacer grupo aunque llegues solo. Los juegos (beer pong, dardos) rompen el hielo, y la cena para compartir ayuda a socializar antes de la pista." },
  ],
  temporada: [
    { h2: "La noche según la época del año", body: "La temporada alta va de diciembre a abril (menos lluvia, más ambiente). Fechas fuertes: Fin de Año, Carnaval (febrero/marzo) y las fiestas patrias de noviembre, cuando la ciudad se llena. En esas fechas conviene reservar mesa y llegar temprano." },
    { h2: "Reserva con antelación en fechas clave", body: "En Carnaval, Fin de Año y feriados largos, los sitios de Calle Uruguay se llenan pronto. Apúntate a la lista antes de salir y, si vas en grupo, reserva mesa por WhatsApp para asegurar tu espacio." },
    { h2: "Qué esperar en temporada alta", body: "Más gente, más energía y programación especial. Q'Paso Ayer suele montar temáticas para las fechas grandes, así que revisa la agenda de la semana antes de salir para no perderte la fiesta del día." },
  ],
  eventos: [
    { h2: "Celebra tu ocasión especial", body: "Cumpleaños, despedidas, graduaciones o after de empresa: Q'Paso Ayer está pensado para grupos. Reservas mesa, cenan para compartir, juegan una ronda y siguen de fiesta sin cambiar de sitio. La logística la resolvemos por WhatsApp." },
    { h2: "Grupos grandes, sin dramas", body: "Para grupos conviene reservar mesa con antelación: aseguras espacio, evitas fila y tienes una base para la noche. Escribe por WhatsApp (+507 6931-2305) con el número de personas y la fecha y lo dejamos listo." },
    { h2: "Fiestas temáticas cada semana", body: "Neón, blanco, throwback de los 2000, ladies night… La agenda cambia de martes a domingo. Si buscas una temática concreta, revisa el calendario de eventos y apúntate gratis a la lista del día." },
  ],
  juegos: [
    { h2: "Beer pong, dardos y más", body: "Q'Paso Ayer es de los pocos sitios de Ciudad de Panamá donde la diversión no es solo bailar: hay beer pong, dardos y planes para picarse en grupo. Perfecto para romper el hielo, para una cita distinta o para calentar antes de la pista." },
    { h2: "Un plan distinto de noche", body: "Si el grupo no se anima con solo discoteca, los juegos son la solución: competís, os reís y la noche fluye sola. Además está la cena para compartir, así que hay plan aunque no todos quieran bailar." },
    { h2: "Cómo organizar la partida", body: "Llega con tu grupo, pide algo para compartir y monta la ronda. En fechas fuertes conviene reservar mesa para tener base. Escríbenos por WhatsApp si sois muchos y queremos dejaros el espacio listo." },
  ],
  musica: [
    { h2: "Qué suena en la noche panameña", body: "El reggaetón y la música urbana mandan, pero la noche mezcla latino, afrobeats y throwbacks según el DJ y la temática. En Calle Uruguay encuentras de todo a pocas cuadras; en Q'Paso Ayer la selección va subiendo de intensidad conforme avanza la noche." },
    { h2: "DJ y ambiente que sube", body: "La música arranca suave para la cena y el after temprano y se pone fiestera para cerrar. Hay DJ en las noches fuertes del fin de semana y temáticas entre semana. Revisa la agenda para ver qué suena cada día." },
    { h2: "Para los que quieren bailar", body: "Si vienes a mover el esqueleto, cae de medianoche en adelante, cuando la pista se llena. Reggaetón, latino y urbano en su punto. Apúntate a la lista para entrar gratis hasta la hora indicada." },
  ],
  afterwork: [
    { h2: "El after office perfecto", body: "Al salir del trabajo, Calle Uruguay (junto al Área Bancaria) es la escapada más cómoda. En Q'Paso Ayer arrancas con happy hour, algo para picar y ambiente relajado que, si te animas, se convierte en fiesta sin moverte de sitio." },
    { h2: "Happy hour y algo para compartir", body: "El plan clásico de viernes: cerveza o coctel, alitas o nachos para la mesa, y conversación antes de que suba la noche. Ideal para grupos de oficina que quieren empezar temprano." },
    { h2: "De after a fiesta sin cambiar de sitio", body: "Lo bueno del formato: empiezas tranquilo y, cuando el grupo se anima, ya estás donde va a estar la fiesta. No hay que reubicarse ni pagar otro traslado — la noche sigue en el mismo lugar." },
  ],
  universitario: [
    { h2: "El plan para universitarios", body: "Jueves y fines de semana, Calle Uruguay se llena de gente joven. Q'Paso Ayer es un favorito universitario: entrada gratis por lista, juegos, cena económica para compartir y fiesta. Sales sin gastar una fortuna y con ambiente asegurado." },
    { h2: "Cómo salir gastando poco", body: "Apúntate a la lista para entrar gratis, comparte la cena entre el grupo y aprovecha las promos de la noche. Es la fórmula para una buena salida de estudiante sin vaciar la cartera." },
    { h2: "Jueves universitario", body: "El jueves es día grande para los universitarios en Ciudad de Panamá. Programación pensada para jóvenes, listas gratis y ambiente de campus. Llega con el grupo y apúntate antes por la web." },
  ],
  listas: [
    { h2: "Cómo funciona la lista gratis", body: "Es sencillo: entras a la web, eliges el evento, te apuntas a la lista de chicas o de chicos y dejas tu nombre. Con eso tienes entrada gratis hasta la hora indicada. Después de esa hora se cobra el cover normal, así que la clave es llegar temprano." },
    { h2: "Reservar mesa para tu grupo", body: "Si vais en grupo o queréis base para la noche, reservar mesa evita fila y asegura espacio. Se gestiona por WhatsApp (+507 6931-2305): dices fecha y número de personas y lo dejamos listo. Las mesas suelen incluir botella según el plan." },
    { h2: "Horarios y cover", body: "La entrada por lista es gratis hasta cierta hora (varía según el evento); después aplica el cover. La fiesta se anima de medianoche en adelante, pero si quieres mesa o cena conviene llegar antes. Revisa el evento del día para los horarios exactos." },
  ],
  "fin-de-semana": [
    { h2: "El mejor plan de fin de semana", body: "Viernes y sábado son los días grandes en Calle Uruguay. El plan que nunca falla: cena para compartir sobre las 8-9, juegos para calentar, y fiesta con DJ de medianoche en adelante — todo en Q'Paso Ayer, sin cambiar de sitio." },
    { h2: "Viernes vs sábado", body: "El viernes arranca con after office y buen ambiente temprano; el sábado es 100% fiesta y suele llenarse más. Domingo hay planes más relajados. Para cualquiera de los tres, apuntarte a la lista antes te asegura entrada gratis." },
    { h2: "Cómo empezar la noche", body: "Empieza temprano para agarrar mesa y aprovechar la lista gratis. Cena, juega una ronda y deja que la noche suba sola. Si sois grupo, reservad mesa por WhatsApp para no hacer fila el sábado." },
  ],
  restaurante: [
    { h2: "Cena para compartir antes de salir", body: "En Q'Paso Ayer la noche empieza en la mesa: alitas, burgers, nachos y más para compartir en grupo. Es la forma perfecta de arrancar — bajas revoluciones, socializas y aguantas mejor la fiesta que viene después." },
    { h2: "Cena y fiesta en el mismo lugar", body: "La gracia es no tener que moverte: cenas y, cuando el grupo se anima, ya estás donde va a estar la fiesta. Menos traslados, menos gasto y la noche fluida de principio a fin, todo en Calle Uruguay." },
    { h2: "Qué pedir", body: "Para grupo, lo ideal es varios platos para compartir y tragos para la mesa. Las alitas y las burgers son un clásico de la casa. Llega con hambre y con ganas de quedarte a la fiesta." },
  ],
};
const ES_FAQ_CLUSTER = {
  turismo: [
    ["¿Es seguro salir de noche en Ciudad de Panamá?", "Sí, con sentido común. Calle Uruguay es de las zonas más transitadas; usa Uber para llegar y volver, cuida tus cosas y tu trago, y vuelve con el grupo."],
    ["¿Necesito cambiar dinero?", "No. Panamá usa el dólar estadounidense. Lleva algo de efectivo en dólares para propinas."],
    ["¿Cómo llego a Calle Uruguay?", "En Uber desde cualquier hotel del centro llegas en 5-15 minutos. Está en Bella Vista, pegada al Área Bancaria."],
  ],
  listas: [
    ["¿Cómo entro gratis?", "Apúntate a la lista del evento (chicas o chicos) por la web. Tienes entrada gratis hasta la hora indicada; después aplica cover."],
    ["¿Hasta qué hora es gratis?", "Depende del evento del día. Revisa el evento en la web para ver la hora límite de la lista."],
    ["¿Cómo reservo mesa para mi grupo?", "Por WhatsApp (+507 6931-2305): dinos fecha y número de personas y lo dejamos listo."],
  ],
  juegos: [
    ["¿Qué juegos hay?", "Beer pong, dardos y planes para grupo. Perfecto para romper el hielo o calentar antes de la pista."],
    ["¿Puedo ir solo a comer o solo a jugar?", "Claro. El formato es flexible: cena, juegos, fiesta o todo junto, tú eliges."],
  ],
  eventos: [
    ["¿Puedo celebrar un cumpleaños o despedida?", "Sí, es ideal para grupos. Reserva mesa por WhatsApp y lo organizamos: cena, juegos y fiesta en un sitio."],
    ["¿Reservan para grupos grandes?", "Sí. Escríbenos por WhatsApp (+507 6931-2305) con fecha y número de personas."],
  ],
  afterwork: [
    ["¿A qué hora empieza el after office?", "Sobre las 6-7 pm. Es el plan perfecto al salir del trabajo, con happy hour y algo para compartir."],
    ["¿Se puede quedar en fiesta después?", "Sí, ese es el punto: empiezas tranquilo y la misma noche se convierte en fiesta sin moverte."],
  ],
};
const ES_FAQ_BASE = (kw) => [
  [`¿Dónde queda el mejor plan para ${lc(kw)}?`, "En Calle Uruguay, Bella Vista, Ciudad de Panamá. Q'Paso Ayer está en plena zona nocturna, a minutos del Área Bancaria."],
  ["¿Tienen comida?", "Sí. Cena informal para compartir antes de la fiesta: alitas, burgers, nachos y tragos."],
  ["¿Qué días abren?", "De martes a domingo, con programación distinta cada noche."],
  ["¿Cómo entro gratis?", "Apúntate a la lista del evento eligiendo chicas o chicos. Cada lista tiene entrada gratis hasta una hora distinta."],
];

// =================== CONTENIDO EN ===================
const EN_TITLES = [
  (kw) => `${cap(kw)}: 2026 guide`,
  (kw) => `${cap(kw)} — Calle Uruguay, Panama`,
  (kw) => `${cap(kw)}: the plan that works`,
  (kw) => `${cap(kw)} (2026) | Q'Paso Ayer`,
];
const EN_DESC = [
  (kw) => `${cap(kw)}: Calle Uruguay, Bella Vista. At Q'Paso Ayer you get shareable dinner, games, free guest lists and a DJ party Tuesday to Sunday. 2026 guide.`,
  (kw) => `Practical guide to ${lc(kw)}: hours, how to get in free on the list, what to expect and why Q'Paso Ayer (Calle Uruguay) is the best place to start the night.`,
  (kw) => `Everything about ${lc(kw)} in Panama City: area, vibe, prices, bookings and free lists. Start the night at Q'Paso Ayer, Calle Uruguay.`,
];
const EN_INTRO = [
  (kw) => `Looking for ${lc(kw)}? There's one clear starting point: Calle Uruguay, the golden mile of nightlife in Panama City. At its heart is Q'Paso Ayer, where the night begins with dinner, games and a party.`,
  (kw) => `Let's talk ${lc(kw)}, no fluff. Panama City's scene is concentrated in Bella Vista, and Q'Paso Ayer (Calle Uruguay) has become the place to kick off: eat something, play a round and stay for the best part.`,
  (kw) => `Planning ${lc(kw)}? This guide takes you straight to what matters: where to go, what time, how to get in free on the list and what to expect. Spoiler: it starts at Q'Paso Ayer, Calle Uruguay.`,
  (kw) => `${cap(kw)} comes down to choosing where to start. In Panama City that place is Calle Uruguay, and Q'Paso Ayer is the perfect launch — Tuesday to Sunday something is always on.`,
];
const EN_VENUE = [
  "Q'Paso Ayer isn't just another bar — it's a meeting point right on Calle Uruguay. Casual shareable food (wings, burgers, nachos), games like beer pong and darts, well-poured drinks and a different lineup every night, Tuesday to Sunday. Every night has a reason, so there's always a vibe.",
  "What makes Q'Paso Ayer special is the all-in-one format: eat, play and end up partying without changing venues. It's in Calle Uruguay (Bella Vista), with Latin and urban music and energy that builds as the night goes on. Great for groups, couples and solo travelers looking for atmosphere.",
  "At Q'Paso Ayer the night has a script: you arrive for dinner and the early after-work, move on to games and warm-up, and stay for the DJ. All on Calle Uruguay, the liveliest zone in Panama City. Shareable food, drinks and a good mix of locals and travelers.",
];
const EN_LISTS = [
  "Best part for your wallet: you can join the FREE guest list for each event. Pick your group (girls or guys), drop your name and get free entry until the listed time. No online payments, no hassle — just arrive before the list closes.",
  "Guest-list entry is free until a set time: sign up online, pick the girls' or guys' list, and get in with no cover if you arrive on time. It's the smartest way to go out without overspending in Panama City.",
  "Don't want to pay cover? Join the event's guest list before you head out. Each list (girls or guys) has free entry until a different time; after that the normal cover applies. Booking a table for groups also skips the line.",
];
const EN_TIPS = [
  "Come early: free guest-list entry has a cut-off time and the best tables go fast.",
  "Sign up online in advance to lock in your spot on the night's list.",
  "Coming with a group? Message us on WhatsApp (+507 6931-2305) to book a table and skip the line.",
  "Grab some food when you arrive: you pace yourself, share with the group and last longer.",
  "Check the week's schedule: every night has a different theme, Tuesday to Sunday.",
];
const EN_AREA = [
  "Calle Uruguay is in Bella Vista, minutes from the Banking Area and from Panama City's main hotels and hostels. It's the easiest zone for a night out with no long transfers — everything is walkable and Uber/taxi are right there.",
  "The advantage of Calle Uruguay is density: bars, kitchens and clubs within a few blocks, in Bella Vista. You arrive by Uber in minutes from almost any downtown hotel and walk from one spot to the next without losing the night.",
];
const EN_TOURIST = [
  "For travelers, Calle Uruguay is the safe bet: well-lit, busy all night and very close to the hotels of Bella Vista and Marbella. Use Uber to get there and back (more predictable than street taxis), carry some US-dollar cash for tips, and keep your phone secure on the dance floor. Panama uses the US dollar, so there's no need to change money.",
  "Traveler tip: arrive by Uber, start with dinner to get your bearings and form a group, and use the free list so you don't overspend. Panama runs on the US dollar and the Calle Uruguay crowd mixes locals and foreigners, so it's easy to socialize even if you come solo.",
];
const EN_CLUSTER = {
  nightlife: [
    { h2: "What a night in Panama City is like", body: "Panamanian nights start early and end late: after-work kicks off around 6-7 pm, things pick up after 10, and the real party runs from midnight onward. Bella Vista — especially Calle Uruguay — is the epicenter where it all comes together: bars, kitchens and clubs within a few blocks." },
    { h2: "What vibe are you after", body: "Chill drink and conversation, or dance floor and reggaeton? On Calle Uruguay you'll find both a couple of doors apart. Q'Paso Ayer settles it with a format that shifts by the hour: relaxed for dinner, lively for games, full party to close." },
    { h2: "Midweek has plans too", body: "No need to wait for Saturday. Tuesday to Sunday there's programming: college Thursdays, Friday after-work and weekend themes. Midweek usually means shorter lines and better tables." },
  ],
  "calle-uruguay": [
    { h2: "Why Calle Uruguay", body: "Calle Uruguay is Panama City's nightlife 'golden mile': a dense run of bars, restaurants and clubs in Bella Vista that makes it the most practical place to go out. Start on one end with dinner and finish on the other on the dance floor, all on foot." },
    { h2: "What you'll find in the area", body: "From rooftops and cocktails to reggaeton clubs, with games bars like Q'Paso Ayer in between. Variety is the strength: if one plan doesn't click, the next is half a block away." },
    { h2: "The launch point", body: "Q'Paso Ayer works as a base of operations: shareable dinner, games, free lists and a party. Arrive, eat, play and stay — or head out to explore the rest of the street with the night already rolling." },
  ],
  zonas: [
    { h2: "Panama City's nightlife zones", body: "The main ones are Calle Uruguay/Bella Vista (the liveliest and most varied), Casco Viejo (pretty and touristy, rooftops with views, higher prices), Marbella and Obarrio (office bars and after-work) and Amador (breeze and views, quieter). For a first night, Calle Uruguay packs the best into the smallest area." },
    { h2: "How to choose where to go", body: "Want variety and everything walkable? Calle Uruguay. Want postcard rooftops? Casco Viejo. Coming from work? Marbella/Obarrio. Q'Paso Ayer, on Calle Uruguay, is the most versatile because it combines dinner, games and party in one spot." },
    { h2: "Distances and transfers", body: "The whole downtown nightlife core is 10-15 minutes apart by Uber. Calle Uruguay sits next to the Banking Area, so from most hotels you get there fast. Walking within the street itself is the norm." },
  ],
  turismo: [
    { h2: "Quick guide for travelers", body: "Panama uses the US dollar, so no money exchange needed. Nightlife concentrates in Bella Vista (Calle Uruguay), close to most hotels. Get around by Uber, start with dinner to get oriented, and use the free lists so you don't overspend." },
    { h2: "Safety and common sense", body: "Calle Uruguay is one of the busiest zones, with movement all night. As in any big city: use Uber to arrive and leave, don't flash valuables, watch your drink and head back with your group. Do that and the night is easy and a lot of fun." },
    { h2: "Great for meeting people", body: "The crowd mixes locals and travelers from all over, so it's easy to form a group even if you arrive solo. Games (beer pong, darts) break the ice, and the shareable dinner helps you socialize before the dance floor." },
  ],
  temporada: [
    { h2: "Nightlife by season", body: "High season runs December to April (less rain, more buzz). Big dates: New Year's Eve, Carnival (February/March) and the November national holidays, when the city fills up. On those dates, book a table and arrive early." },
    { h2: "Book ahead on key dates", body: "During Carnival, New Year's and long holiday weekends, Calle Uruguay venues fill up fast. Join the list before heading out and, if you're in a group, book a table on WhatsApp to secure your spot." },
    { h2: "What to expect in high season", body: "More people, more energy and special programming. Q'Paso Ayer usually runs themes for the big dates, so check the week's schedule before you go so you don't miss the party of the day." },
  ],
  eventos: [
    { h2: "Celebrate your special occasion", body: "Birthdays, bachelor/bachelorette parties, graduations or company after-parties: Q'Paso Ayer is built for groups. Book a table, share dinner, play a round and keep the party going without changing venues. We sort the logistics on WhatsApp." },
    { h2: "Big groups, no drama", body: "For groups it's best to book a table ahead: you secure space, skip the line and have a base for the night. Message us on WhatsApp (+507 6931-2305) with the number of people and the date and we'll set it up." },
    { h2: "Themed parties every week", body: "Neon, white, 2000s throwback, ladies night… The schedule changes Tuesday to Sunday. If you're after a specific theme, check the events calendar and join the day's list for free." },
  ],
  juegos: [
    { h2: "Beer pong, darts and more", body: "Q'Paso Ayer is one of the few spots in Panama City where the fun isn't only dancing: there's beer pong, darts and plenty to compete over as a group. Perfect to break the ice, for a different date night, or to warm up before the dance floor." },
    { h2: "A different kind of night", body: "If the group isn't sold on a club alone, games are the fix: you compete, you laugh and the night flows on its own. Plus there's shareable dinner, so there's a plan even if not everyone wants to dance." },
    { h2: "How to set up your game", body: "Come with your group, order something to share and set up a round. On big dates it's worth booking a table for a base. Message us on WhatsApp if you're a big group and we'll get the space ready." },
  ],
  musica: [
    { h2: "What plays on a Panama night", body: "Reggaeton and urban music lead, but the night blends Latin, afrobeats and throwbacks depending on the DJ and theme. On Calle Uruguay you'll find it all within a few blocks; at Q'Paso Ayer the selection builds in intensity as the night goes on." },
    { h2: "DJ and rising energy", body: "Music starts soft for dinner and the early after-work and turns full party to close. There's a DJ on the big weekend nights and themes midweek. Check the schedule to see what's playing each day." },
    { h2: "For those who want to dance", body: "If you're here to move, drop by from midnight onward, when the floor fills. Reggaeton, Latin and urban at their peak. Join the list to get in free until the listed time." },
  ],
  afterwork: [
    { h2: "The perfect after-work", body: "Straight out of the office, Calle Uruguay (next to the Banking Area) is the easiest escape. At Q'Paso Ayer you start with happy hour, something to snack on and a relaxed vibe that — if you're up for it — turns into a party without moving." },
    { h2: "Happy hour and something to share", body: "The classic Friday plan: beer or a cocktail, wings or nachos for the table, and conversation before the night ramps up. Ideal for office groups who want to start early." },
    { h2: "From after-work to party in one place", body: "The beauty of the format: you start easy and, when the group gets going, you're already where the party will be. No relocating, no second transfer — the night continues in the same spot." },
  ],
  universitario: [
    { h2: "The plan for students", body: "Thursdays and weekends, Calle Uruguay fills with young crowds. Q'Paso Ayer is a student favorite: free guest-list entry, games, cheap shareable dinner and a party. You go out without spending a fortune and the atmosphere is guaranteed." },
    { h2: "How to go out for less", body: "Join the list to get in free, split the dinner across the group and take advantage of the night's deals. That's the formula for a solid student night out without emptying your wallet." },
    { h2: "College Thursday", body: "Thursday is the big student night in Panama City. Programming built for young crowds, free lists and a campus vibe. Come with your group and sign up online in advance." },
  ],
  listas: [
    { h2: "How the free list works", body: "It's simple: go to the website, pick the event, join the girls' or guys' list and drop your name. That gets you free entry until the listed time. After that time the normal cover applies, so the key is to arrive early." },
    { h2: "Booking a table for your group", body: "If you're in a group or want a base for the night, booking a table skips the line and secures space. It's handled on WhatsApp (+507 6931-2305): give the date and number of people and we'll set it up. Tables usually include a bottle depending on the plan." },
    { h2: "Hours and cover", body: "Guest-list entry is free until a certain time (varies by event); after that the cover applies. The party picks up from midnight, but if you want a table or dinner it's best to arrive earlier. Check the day's event for exact times." },
  ],
  "fin-de-semana": [
    { h2: "The best weekend plan", body: "Friday and Saturday are the big days on Calle Uruguay. The plan that never fails: shareable dinner around 8-9, games to warm up, and a DJ party from midnight onward — all at Q'Paso Ayer, without changing venues." },
    { h2: "Friday vs Saturday", body: "Friday kicks off with after-work and a good early vibe; Saturday is 100% party and usually busier. Sunday brings more relaxed plans. For any of the three, joining the list ahead gets you free entry." },
    { h2: "How to start the night", body: "Start early to grab a table and use the free list. Have dinner, play a round and let the night build on its own. If you're a group, book a table on WhatsApp so you skip the Saturday line." },
  ],
  restaurante: [
    { h2: "Shareable dinner before you go out", body: "At Q'Paso Ayer the night starts at the table: wings, burgers, nachos and more to share as a group. It's the perfect way to begin — you slow down, socialize and last longer for the party that follows." },
    { h2: "Dinner and party in one place", body: "The point is not having to move: you eat and, when the group gets going, you're already where the party will be. Fewer transfers, less spend and a smooth night start to finish, all on Calle Uruguay." },
    { h2: "What to order", body: "For a group, go for several shareable plates and drinks for the table. The wings and burgers are house classics. Come hungry and ready to stay for the party." },
  ],
};
const EN_FAQ_CLUSTER = {
  turismo: [
    ["Is it safe to go out at night in Panama City?", "Yes, with common sense. Calle Uruguay is one of the busiest zones; use Uber to arrive and leave, watch your things and your drink, and head back with your group."],
    ["Do I need to change money?", "No. Panama uses the US dollar. Carry some cash in dollars for tips."],
    ["How do I get to Calle Uruguay?", "By Uber from any downtown hotel it's 5-15 minutes. It's in Bella Vista, right next to the Banking Area."],
  ],
  listas: [
    ["How do I get in for free?", "Join the event's list (girls or guys) on the website. You get free entry until the listed time; after that a cover applies."],
    ["Until what time is it free?", "It depends on the day's event. Check the event on the website for the list cut-off time."],
    ["How do I book a table for my group?", "On WhatsApp (+507 6931-2305): tell us the date and number of people and we'll set it up."],
  ],
  juegos: [
    ["What games are there?", "Beer pong, darts and group plans. Perfect to break the ice or warm up before the dance floor."],
    ["Can I come just to eat or just to play?", "Of course. The format is flexible: dinner, games, party or all together — your call."],
  ],
  eventos: [
    ["Can I celebrate a birthday or bachelor party?", "Yes, it's ideal for groups. Book a table on WhatsApp and we'll organize it: dinner, games and party in one place."],
    ["Do you take bookings for big groups?", "Yes. Message us on WhatsApp (+507 6931-2305) with the date and number of people."],
  ],
  afterwork: [
    ["What time does after-work start?", "Around 6-7 pm. It's the perfect plan straight out of the office, with happy hour and something to share."],
    ["Can you stay for the party after?", "Yes, that's the point: you start easy and the same night turns into a party without moving."],
  ],
};
const EN_FAQ_BASE = (kw) => [
  [`Where is the best spot for ${lc(kw)}?`, "In Calle Uruguay, Bella Vista, Panama City. Q'Paso Ayer sits right in the nightlife zone, minutes from the Banking Area."],
  ["Do you have food?", "Yes. Casual shareable dinner before the party: wings, burgers, nachos and drinks."],
  ["What days are you open?", "Tuesday to Sunday, with different programming every night."],
  ["How do I get in for free?", "Join the event's list by choosing girls or guys. Each list has free entry until a different time."],
];

// =================== ENSAMBLADO ===================
function buildArticle(kw, cluster, lang) {
  const isEs = lang === "es";
  const seed = hash(kw + lang);
  const slug = slugify((isEs ? "" : "en-") + kw);

  const TITLES = isEs ? ES_TITLES : EN_TITLES;
  const DESCS = isEs ? ES_DESC : EN_DESC;
  const INTROS = isEs ? ES_INTRO : EN_INTRO;
  const CLUSTER = isEs ? ES_CLUSTER : EN_CLUSTER;
  const VENUE = isEs ? ES_VENUE : EN_VENUE;
  const LISTS = isEs ? ES_LISTS : EN_LISTS;
  const TIPS = isEs ? ES_TIPS : EN_TIPS;
  const AREA = isEs ? ES_AREA : EN_AREA;
  const TOURIST = isEs ? ES_TOURIST : EN_TOURIST;
  const FAQ_CLUSTER = isEs ? ES_FAQ_CLUSTER : EN_FAQ_CLUSTER;
  const FAQ_BASE = isEs ? ES_FAQ_BASE : EN_FAQ_BASE;

  const clusterSecs = CLUSTER[cluster] || CLUSTER.nightlife;
  const csel = picks(clusterSecs, seed, 2);

  const tipsH2 = isEs ? "Tips para tu noche" : "Tips for your night";
  const venueH2 = isEs ? "Por qué Q'Paso Ayer" : "Why Q'Paso Ayer";
  const listsH2 = isEs ? "Entra gratis a la lista" : "Get in free on the list";
  const areaH2 = isEs ? "La zona: Calle Uruguay" : "The area: Calle Uruguay";

  // secciones: 2 de cluster + venue + lists + (turista o zona/tips)
  const sections = [];
  sections.push(csel[0]);
  sections.push({ h2: venueH2, body: pick(VENUE, seed) });
  sections.push(csel[1] || csel[0]);
  sections.push({ h2: listsH2, body: pick(LISTS, seed + 1) });
  if (cluster === "turismo") {
    sections.push({ h2: isEs ? "Consejos de viajero" : "Traveler tips", body: pick(TOURIST, seed) });
  } else {
    sections.push({ h2: areaH2, body: pick(AREA, seed) });
  }
  sections.push({ h2: tipsH2, body: pick(TIPS, seed + 2) + " " + pick(TIPS, seed + 4) });

  // faqs: 1 base específica de keyword + 2-3 de cluster (o base)
  const baseFaqs = FAQ_BASE(kw);
  const clusterFaqs = FAQ_CLUSTER[cluster] || [];
  const chosen = [];
  chosen.push(baseFaqs[0]);
  const cf = picks(clusterFaqs.length ? clusterFaqs : baseFaqs.slice(1), seed, 2);
  chosen.push(...cf);
  chosen.push(baseFaqs[1]);
  // dedupe faqs por pregunta
  const seenQ = new Set();
  const faqs = chosen.filter(([q]) => (seenQ.has(q) ? false : (seenQ.add(q), true))).map(([q, a]) => ({ q, a }));

  return {
    slug,
    lang,
    cluster,
    keyword: kw,
    title: pick(TITLES, seed)(kw),
    description: pick(DESCS, seed + 1)(kw),
    h1: cap(kw),
    intro: pick(INTROS, seed)(kw),
    sections,
    faqs,
  };
}

const articles = [];
ES.forEach(([kw, c]) => articles.push(buildArticle(kw, c, "es")));
EN.forEach(([kw, c]) => articles.push(buildArticle(kw, c, "en")));

// dedupe slugs
const seen = new Set();
for (const a of articles) {
  let s = a.slug, n = 1;
  while (seen.has(s)) { n++; s = `${a.slug}-${n}`; }
  a.slug = s; seen.add(s);
}

// enlaces internos: 4 relacionados del mismo idioma y, si se puede, mismo cluster primero
for (const a of articles) {
  const sameLang = articles.filter((x) => x.lang === a.lang && x.slug !== a.slug);
  const sameCluster = sameLang.filter((x) => x.cluster === a.cluster);
  const pool = sameCluster.length >= 4 ? sameCluster : sameLang;
  const start = hash(a.slug) % pool.length;
  const rel = [];
  for (let k = 0; rel.length < 4 && k < pool.length; k++) {
    const cand = pool[(start + k) % pool.length].slug;
    if (cand !== a.slug && !rel.includes(cand)) rel.push(cand);
  }
  a.related = rel;
}

writeFileSync(join(OUT_DIR, "blog-articles.json"), JSON.stringify(articles, null, 2), "utf8");
const es = articles.filter((a) => a.lang === "es").length;
const en = articles.filter((a) => a.lang === "en").length;
console.log(`Generados ${articles.length} artículos (${es} ES + ${en} EN).`);
