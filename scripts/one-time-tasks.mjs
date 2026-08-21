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

async function main() {
  await runV1();
  await runV2();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("[one-time] error general:", e);
    await prisma.$disconnect();
  });
