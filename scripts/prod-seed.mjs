// Siembra la BD SOLO la primera vez (si no hay AdminUser). En reinability posteriores no toca nada.
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const prisma = new PrismaClient();

async function main() {
  let count = 0;
  try {
    count = await prisma.adminUser.count();
  } catch (e) {
    console.error("[prod-seed] no se pudo consultar AdminUser (¿schema sin aplicar?):", e.message);
    return;
  }
  if (count > 0) {
    console.log(`[prod-seed] ya hay ${count} admin(s); no se siembra.`);
    return;
  }
  console.log("[prod-seed] BD vacía: sembrando datos iniciales...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  console.log("[prod-seed] siembra completada.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("[prod-seed] error:", e);
    await prisma.$disconnect();
    // no bloquear el arranque de la app
  });
