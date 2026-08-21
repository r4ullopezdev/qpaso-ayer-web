// Tareas puntuales de datos que se ejecutan UNA sola vez en producción.
// Se protege con un Setting para no repetirse en cada arranque.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const FLAG = "ops_2026_08_21_v1"; // cambia el sufijo para forzar una nueva tanda

async function main() {
  let done = false;
  try {
    const s = await prisma.setting.findUnique({ where: { key: FLAG } });
    done = !!s;
  } catch (e) {
    console.error("[one-time] no se pudo leer Setting (¿schema sin aplicar?):", e.message);
    return;
  }
  if (done) {
    console.log(`[one-time] ${FLAG} ya ejecutado; nada que hacer.`);
    return;
  }
  console.log(`[one-time] ejecutando tareas ${FLAG}...`);

  // 1) Borrar eventos NO publicados (desactivados/borradores)
  try {
    const r = await prisma.event.deleteMany({ where: { published: false } });
    console.log(`[one-time] eventos desactivados borrados: ${r.count}`);
  } catch (e) {
    console.error("[one-time] error borrando eventos:", e.message);
  }

  // 2) Borrar promotores inactivos (el de prueba desactivado). signups -> promoterId null
  try {
    const r = await prisma.promoter.deleteMany({ where: { active: false } });
    console.log(`[one-time] promotores inactivos borrados: ${r.count}`);
  } catch (e) {
    console.error("[one-time] error borrando promotores:", e.message);
  }

  // 3) Poner el arte (arte.jpg) en el evento actualmente disponible (publicado y próximo)
  try {
    const now = new Date(Date.now() - 8 * 3600 * 1000);
    const ev =
      (await prisma.event.findFirst({
        where: { published: true, date: { gte: now } },
        orderBy: { date: "asc" },
      })) ||
      (await prisma.event.findFirst({ where: { published: true }, orderBy: { date: "desc" } }));
    if (ev) {
      await prisma.event.update({ where: { id: ev.id }, data: { coverImage: "/events/arte.jpg" } });
      console.log(`[one-time] arte puesto en evento "${ev.title}".`);
    } else {
      console.log("[one-time] no hay evento publicado para el arte.");
    }
  } catch (e) {
    console.error("[one-time] error poniendo el arte:", e.message);
  }

  // Marcar como hecho
  try {
    await prisma.setting.upsert({
      where: { key: FLAG },
      update: { value: new Date().toISOString() },
      create: { key: FLAG, value: new Date().toISOString() },
    });
    console.log(`[one-time] ${FLAG} marcado como completado.`);
  } catch (e) {
    console.error("[one-time] no se pudo marcar el flag:", e.message);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("[one-time] error general:", e);
    await prisma.$disconnect();
  });
