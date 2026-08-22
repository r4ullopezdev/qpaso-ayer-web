// Tareas puntuales de datos que se ejecutan UNA sola vez en producción.
// Cada tanda se protege con su propio Setting para no repetirse en cada arranque.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function alreadyDone(flag) {
  try {
    const s = await prisma.setting.findUnique({ where: { key: flag } });
    return !!s;
  } catch (e) {
    console.error(`[one-time] no se pudo leer Setting ${flag}:`, e.message);
    return true; // ante la duda, no ejecutar
  }
}
async function markDone(flag) {
  try {
    await prisma.setting.upsert({
      where: { key: flag },
      update: { value: new Date().toISOString() },
      create: { key: flag, value: new Date().toISOString() },
    });
    console.log(`[one-time] ${flag} marcado como completado.`);
  } catch (e) {
    console.error(`[one-time] no se pudo marcar ${flag}:`, e.message);
  }
}

// ---------- Tanda 1: limpieza + arte ----------
async function runV1() {
  const FLAG = "ops_2026_08_21_v1";
  if (await alreadyDone(FLAG)) { console.log(`[one-time] ${FLAG} ya hecho.`); return; }
  console.log(`[one-time] ejecutando ${FLAG}...`);

  try {
    const r = await prisma.event.deleteMany({ where: { published: false } });
    console.log(`[one-time] eventos desactivados borrados: ${r.count}`);
  } catch (e) { console.error("[one-time] error borrando eventos:", e.message); }

  try {
    const r = await prisma.promoter.deleteMany({ where: { active: false } });
    console.log(`[one-time] promotores inactivos borrados: ${r.count}`);
  } catch (e) { console.error("[one-time] error borrando promotores:", e.message); }

  try {
    const now = new Date(Date.now() - 8 * 3600 * 1000);
    const ev =
      (await prisma.event.findFirst({ where: { published: true, date: { gte: now } }, orderBy: { date: "asc" } })) ||
      (await prisma.event.findFirst({ where: { published: true }, orderBy: { date: "desc" } }));
    if (ev) {
      await prisma.event.update({ where: { id: ev.id }, data: { coverImage: "/events/arte.jpg" } });
      console.log(`[one-time] arte puesto en evento "${ev.title}".`);
    }
  } catch (e) { console.error("[one-time] error poniendo el arte:", e.message); }

  await markDone(FLAG);
}

// ---------- Tanda 2: evento "Puro Perreo" (esta noche) + ocultar el resto ----------
async function runV2() {
  const FLAG = "ops_2026_08_21_v2_puroperreo";
  if (await alreadyDone(FLAG)) { console.log(`[one-time] ${FLAG} ya hecho.`); return; }
  console.log(`[one-time] ejecutando ${FLAG}...`);

  const slug = "puro-perreo";
  const data = {
    slug,
    title: "Puro Perreo",
    subtitle: "Reggaetón · Trap · Dembow",
    subtitleEn: "Reggaeton · Trap · Dembow",
    description:
      "Puro Perreo en Q'Paso Ayer, Calle Uruguay. Reggaetón, trap y dembow toda la noche. Entrada GRATIS para todos hasta la 1:00 AM, y gin tonic gratis para las mujeres. Desde las 10:00 PM.",
    descriptionEn:
      "Puro Perreo at Q'Paso Ayer, Calle Uruguay. Reggaeton, trap and dembow all night. FREE entry for everyone until 1:00 AM, and a free gin & tonic for the ladies. From 10:00 PM.",
    motor: "Fiesta",
    date: new Date("2026-08-22T03:00:00.000Z"), // 22:00 hora de Panamá (UTC-5) del 21 de agosto
    startTime: "22:00",
    coverImage: "/events/flyernoche.jpg",
    cardImage: "/events/flyernoche.jpg",
    published: true,
    closed: false,
    girlsListOpen: true,
    guysListOpen: true,
    girlsFreeUntil: "01:00",
    guysFreeUntil: "01:00",
    girlsListNote: "Gin tonic gratis para las mujeres 🍸 · Entrada gratis hasta la 1:00 AM",
    guysListNote: "Entrada gratis hasta la 1:00 AM",
    paidEntryOpen: true,
    paidPrice: "$10",
    paidNote: "Después de la 1:00 AM",
    girlsTableOpen: true,
    girlsTableMin: 4,
  };

  try {
    const ev = await prisma.event.upsert({ where: { slug }, update: data, create: data });
    console.log(`[one-time] evento "${ev.title}" creado/actualizado (${ev.id}).`);
    // Ocultar el resto: cerrar todos los demás eventos publicados (no se borran, se pueden reabrir).
    const r = await prisma.event.updateMany({
      where: { slug: { not: slug }, published: true, closed: false },
      data: { closed: true },
    });
    console.log(`[one-time] otros eventos cerrados (ocultados): ${r.count}`);
  } catch (e) {
    console.error("[one-time] error creando Puro Perreo:", e.message);
    return; // no marcar como hecho si falló
  }

  await markDone(FLAG);
}

// ---------- Tanda 3: corregir — reabrir lo que cerré de más + Puro Perreo en las DOS noches ----------
function puroPerreoData(slug, date) {
  return {
    slug,
    title: "Puro Perreo",
    subtitle: "Reggaetón · Trap · Dembow",
    subtitleEn: "Reggaeton · Trap · Dembow",
    description:
      "Puro Perreo en Q'Paso Ayer, Calle Uruguay. Reggaetón, trap y dembow toda la noche. Entrada GRATIS para todos hasta la 1:00 AM, y gin tonic gratis para las mujeres. Desde las 10:00 PM.",
    descriptionEn:
      "Puro Perreo at Q'Paso Ayer, Calle Uruguay. Reggaeton, trap and dembow all night. FREE entry for everyone until 1:00 AM, and a free gin & tonic for the ladies. From 10:00 PM.",
    motor: "Fiesta",
    date,
    startTime: "22:00",
    coverImage: "/events/flyernoche.jpg",
    cardImage: "/events/flyernoche.jpg",
    published: true,
    closed: false,
    girlsListOpen: true,
    guysListOpen: true,
    girlsFreeUntil: "01:00",
    guysFreeUntil: "01:00",
    girlsListNote: "Gin tonic gratis para las mujeres 🍸 · Entrada gratis hasta la 1:00 AM",
    guysListNote: "Entrada gratis hasta la 1:00 AM",
    paidEntryOpen: true,
    paidPrice: "$10",
    paidNote: "Después de la 1:00 AM",
    girlsTableOpen: true,
    girlsTableMin: 4,
  };
}

async function runV3() {
  const FLAG = "ops_2026_08_21_v3_fix";
  if (await alreadyDone(FLAG)) { console.log(`[one-time] ${FLAG} ya hecho.`); return; }
  console.log(`[one-time] ejecutando ${FLAG}...`);

  // 1) Reabrir TODO lo que cerré de más (deshace el cierre masivo de la v2).
  try {
    const r = await prisma.event.updateMany({ where: { published: true, closed: true }, data: { closed: false } });
    console.log(`[one-time] eventos reabiertos: ${r.count}`);
  } catch (e) { console.error("[one-time] error reabriendo eventos:", e.message); }

  // 2) Puro Perreo en las dos noches: Viernes 21 y Sábado 22 (22:00 hora de Panamá).
  try {
    const vie = puroPerreoData("puro-perreo", new Date("2026-08-22T03:00:00.000Z")); // 21-ago 22:00 PA
    const sab = puroPerreoData("puro-perreo-sabado", new Date("2026-08-23T03:00:00.000Z")); // 22-ago 22:00 PA
    await prisma.event.upsert({ where: { slug: vie.slug }, update: vie, create: vie });
    await prisma.event.upsert({ where: { slug: sab.slug }, update: sab, create: sab });
    console.log("[one-time] Puro Perreo (viernes + sábado) listos.");
  } catch (e) {
    console.error("[one-time] error con Puro Perreo x2:", e.message);
    return;
  }

  await markDone(FLAG);
}

// ---------- Tanda 4: dejar visibles SOLO los eventos reales; ocultar los demos del seed ----------
async function runV4() {
  const FLAG = "ops_2026_08_21_v4_only_real";
  if (await alreadyDone(FLAG)) { console.log(`[one-time] ${FLAG} ya hecho.`); return; }
  console.log(`[one-time] ejecutando ${FLAG}...`);
  const KEEP = ["puro-perreo", "puro-perreo-sabado", "1ra-batalla-de-aura-oficial"];
  try {
    const open = await prisma.event.updateMany({ where: { slug: { in: KEEP } }, data: { closed: false, published: true } });
    const close = await prisma.event.updateMany({ where: { slug: { notIn: KEEP }, published: true, closed: false }, data: { closed: true } });
    console.log(`[one-time] keepers abiertos=${open.count}, demos cerrados=${close.count}`);
  } catch (e) { console.error("[one-time] error v4:", e.message); return; }
  await markDone(FLAG);
}

// ---------- Tanda 5: ocultar lo pasado + programación semanal (martes a domingo) ----------
async function runV5() {
  const FLAG = "ops_2026_08_22_v5_weekly";
  if (await alreadyDone(FLAG)) { console.log(`[one-time] ${FLAG} ya hecho.`); return; }
  console.log(`[one-time] ejecutando ${FLAG}...`);

  // 1) Ocultar lo que ya pasó: batalla de aura (viernes) y Puro Perreo del viernes.
  try {
    const r = await prisma.event.updateMany({
      where: { slug: { in: ["1ra-batalla-de-aura-oficial", "puro-perreo"] } },
      data: { closed: true },
    });
    console.log(`[one-time] eventos pasados ocultados: ${r.count}`);
  } catch (e) { console.error("[one-time] error ocultando pasados:", e.message); }

  // 2) Reabrir/fechar la programación de la semana entrante (hora de Panamá, UTC-5).
  //    UTC = hora Panamá + 5h.
  const week = [
    { slug: "travelers-night", date: "2026-08-26T02:00:00.000Z", startTime: "21:00" },     // Martes 25, 21:00 PA
    { slug: "college-thursdays", date: "2026-08-28T02:00:00.000Z", startTime: "21:00" },   // Jueves 27, 21:00 PA
    { slug: "panama-party", date: "2026-08-29T03:00:00.000Z", startTime: "22:00" },        // Viernes 28, 22:00 PA
    { slug: "main-event-black-party", date: "2026-08-30T03:00:00.000Z", startTime: "22:00" }, // Sábado 29, 22:00 PA
    { slug: "sunday-social", date: "2026-08-30T22:00:00.000Z", startTime: "17:00" },       // Domingo 30, 17:00 PA
  ];
  try {
    for (const w of week) {
      await prisma.event.updateMany({
        where: { slug: w.slug },
        data: { date: new Date(w.date), startTime: w.startTime, published: true, closed: false },
      });
    }
    console.log(`[one-time] programación semanal reabierta: ${week.length} eventos.`);
  } catch (e) { console.error("[one-time] error programación semanal:", e.message); }

  // 3) Miércoles (nuevo): Ladies Night.
  const ladies = {
    slug: "ladies-night",
    title: "LADIES NIGHT",
    subtitle: "Miércoles de chicas: copa de bienvenida y música.",
    subtitleEn: "Ladies night: welcome drink and music.",
    description: "Miércoles de Ladies Night en Q'Paso Ayer, Calle Uruguay. Copa de bienvenida para las chicas, música variada, juegos y buen ambiente. Apúntate gratis a la lista.",
    descriptionEn: "Wednesday Ladies Night at Q'Paso Ayer, Calle Uruguay. Welcome drink for the ladies, mixed music, games and a great vibe. Join the free list.",
    motor: "Social",
    date: new Date("2026-08-27T02:00:00.000Z"), // Miércoles 26, 21:00 PA
    startTime: "21:00",
    published: true,
    closed: false,
    girlsListOpen: true,
    guysListOpen: true,
    girlsFreeUntil: "00:00",
    guysFreeUntil: "23:00",
    girlsListNote: "Copa de bienvenida gratis para las chicas 🍸",
    paidEntryOpen: true,
    paidPrice: "$10",
    girlsTableOpen: true,
    girlsTableMin: 4,
  };
  try {
    await prisma.event.upsert({ where: { slug: ladies.slug }, update: ladies, create: ladies });
    console.log("[one-time] Ladies Night (miércoles) lista.");
  } catch (e) { console.error("[one-time] error Ladies Night:", e.message); return; }

  await markDone(FLAG);
}

async function main() {
  await runV1();
  await runV2();
  await runV3();
  await runV4();
  await runV5();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("[one-time] error general:", e);
    await prisma.$disconnect();
  });
