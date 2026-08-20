import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

function genCode(len = 5): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos
  const bytes = randomBytes(len);
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

function at(dateISO: string, h: number, m = 0): Date {
  const d = new Date(dateISO + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return d;
}

async function main() {
  // ---- Admin ----
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "quepasoayer2026";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash, role: "ADMIN" },
    create: { username, passwordHash, role: "ADMIN" },
  });

  // ---- Portero (rol DOOR): solo accede al escáner de puerta ----
  const doorUser = process.env.DOOR_USERNAME || "portero";
  const doorPass = process.env.DOOR_PASSWORD || "puerta2026";
  const doorHash = await bcrypt.hash(doorPass, 10);
  await prisma.adminUser.upsert({
    where: { username: doorUser },
    update: { passwordHash: doorHash, role: "DOOR" },
    create: { username: doorUser, passwordHash: doorHash, role: "DOOR" },
  });

  // ---- Promotor de ejemplo ----
  const promoHash = await bcrypt.hash("carlos2026", 10);
  await prisma.promoter.upsert({
    where: { code: "CARLOS" },
    update: { name: "Carlos Promotor", passwordHash: promoHash, active: true },
    create: { code: "CARLOS", name: "Carlos Promotor", passwordHash: promoHash, active: true },
  });

  // ---- Códigos de "Mesa para chicas" (un solo uso) ----
  const existingCodes = await prisma.tableCode.count();
  if (existingCodes === 0) {
    const codes = new Set<string>();
    while (codes.size < 12) codes.add("QPA-" + genCode(4));
    await prisma.tableCode.createMany({
      data: [...codes].map((code) => ({ code })),
    });
  }

  // ---- Ajustes del sitio ----
  const settings: Record<string, string> = {
    whatsapp: "+507 6931-2305",
    instagram: "@qpasoayerpanama",
    address: "Calle Uruguay, Bella Vista — Ciudad de Panamá",
    hoursDinner: "Mar–Dom desde 6:00 PM",
    hoursParty: "Jue–Sáb hasta tarde",
    heroTagline: "Donde empieza la noche en Panamá",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Q%27Paso%20Ayer%20Calle%20Uruguay%2C%20Ciudad%20de%20Panam%C3%A1",
    aboutText:
      "En Calle Uruguay, Q'Paso Ayer es el punto donde empieza la noche: cena informal para compartir, juegos, tragos y la mejor fiesta. Cada noche pasa algo distinto.",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // ---- Eventos (limpios y recreados) ----
  await prisma.signup.deleteMany();
  await prisma.event.deleteMany();

  const events = [
    {
      slug: "lanzamiento-neon-party",
      title: "LANZAMIENTO · NEON PARTY",
      subtitle: "La gran noche de reapertura. Glow, DJ y sorpresas.",
      motor: "Lanzamiento",
      description:
        "El relanzamiento de Q'Paso Ayer. Neon Party con DJ, juegos, shots de bienvenida y la mejor energía de Calle Uruguay. Apúntate gratis a la lista.",
      date: at("2026-08-29", 22),
      startTime: "22:00",
      published: true,
      girlsFreeUntil: "01:00",
      guysFreeUntil: "23:00",
      girlsCap: null,
      guysCap: null,
    },
    {
      slug: "travelers-night",
      title: "TRAVELERS NIGHT",
      subtitle: "La noche de los viajeros: juegos, shots y gente de todo el mundo.",
      motor: "Turismo",
      description:
        "Beer pong, cup pong y shots de bienvenida. La noche para conocer gente y arrancar la fiesta. Lista gratis.",
      date: at("2026-08-25", 21),
      startTime: "21:00",
      published: true,
      girlsFreeUntil: "00:00",
      guysFreeUntil: "23:00",
    },
    {
      slug: "college-thursdays",
      title: "COLLEGE THURSDAYS",
      subtitle: "Jueves universitario. Cada semana una temática.",
      motor: "Universitario",
      description:
        "El jueves de salir. Juegos tipo fiesta gringa, retos y premios. Lista universitaria gratis.",
      date: at("2026-08-27", 21),
      startTime: "21:00",
      published: true,
      girlsFreeUntil: "00:00",
      guysFreeUntil: "23:00",
    },
    {
      slug: "panama-party",
      title: "PANAMA PARTY",
      subtitle: "Viernes de reggaetón y latin. Público mixto, DJ.",
      motor: "Fiesta",
      description:
        "El viernes de fiesta: reggaetón, latin y open format. Mesas y botellas por WhatsApp. Lista gratis hasta cierta hora.",
      date: at("2026-08-28", 22),
      startTime: "22:00",
      published: true,
      girlsFreeUntil: "00:00",
      guysFreeUntil: "23:00",
    },
    {
      slug: "sunday-social",
      title: "SUNDAY SOCIAL",
      subtitle: "Domingo relajado: música, juegos y buena comida.",
      motor: "Social",
      description:
        "El domingo para recuperarse con estilo: brunch tardío, trivia, karaoke y juegos.",
      date: at("2026-08-30", 17),
      startTime: "17:00",
      published: true,
      girlsFreeUntil: "20:00",
      guysFreeUntil: "20:00",
    },
    {
      slug: "main-event-black-party",
      title: "MAIN EVENT · BLACK PARTY",
      subtitle: "El sábado más importante de la semana.",
      motor: "Fiesta",
      description:
        "Cada sábado una temática. Esta semana: Black Party. Máxima producción, mesas y botellas.",
      date: at("2026-09-05", 22),
      startTime: "22:00",
      published: true,
      girlsFreeUntil: "01:00",
      guysFreeUntil: "23:00",
    },
  ];

  for (const e of events) {
    await prisma.event.create({
      data: { ...e, coverImage: `/brand/events/${e.slug}.svg` },
    });
  }

  // Traducciones al inglés de los eventos
  const eventsEn: Record<string, { subtitleEn: string; descriptionEn: string }> = {
    "lanzamiento-neon-party": {
      subtitleEn: "The big reopening night. Glow, DJ and surprises.",
      descriptionEn: "The relaunch of Q'Paso Ayer. Neon Party with a DJ, games, welcome shots and the best energy on Calle Uruguay. Join the free list.",
    },
    "travelers-night": {
      subtitleEn: "Travelers night: games, shots and people from all over the world.",
      descriptionEn: "Beer pong, cup pong and welcome shots. The night to meet people and kick off the party. Free list.",
    },
    "college-thursdays": {
      subtitleEn: "College Thursday. A new theme every week.",
      descriptionEn: "The night to go out. American-style party games, challenges and prizes. Free college list.",
    },
    "panama-party": {
      subtitleEn: "Friday reggaeton and Latin. Mixed crowd, DJ.",
      descriptionEn: "Friday party night: reggaeton, Latin and open format. Tables and bottles by WhatsApp. Free list until a set time.",
    },
    "sunday-social": {
      subtitleEn: "Chill Sunday: music, games and good food.",
      descriptionEn: "The Sunday to recover in style: late brunch, trivia, karaoke and games.",
    },
    "main-event-black-party": {
      subtitleEn: "The most important Saturday of the week.",
      descriptionEn: "A theme every Saturday. This week: Black Party. Full production, tables and bottles.",
    },
  };
  for (const [slug, en] of Object.entries(eventsEn)) {
    await prisma.event.update({ where: { slug }, data: en });
  }

  // ---- Carta real (desde src/content/menu.json, ES + EN + destacados) ----
  await prisma.menuItem.deleteMany();
  await prisma.menuSection.deleteMany();
  interface MItem { name_es: string; name_en: string; desc_es: string; desc_en: string; price: string; featured: boolean; image?: string }
  interface MSection { title_es: string; title_en: string; items: MItem[] }
  const menu = JSON.parse(readFileSync(join(process.cwd(), "src", "content", "menu.json"), "utf8")) as { sections: MSection[] };
  let sOrder = 0;
  for (const sec of menu.sections) {
    sOrder += 1;
    const section = await prisma.menuSection.create({
      data: { title: sec.title_es, titleEn: sec.title_en, order: sOrder },
    });
    let iOrder = 0;
    for (const it of sec.items) {
      iOrder += 1;
      await prisma.menuItem.create({
        data: {
          sectionId: section.id,
          name: it.name_es,
          nameEn: it.name_en || null,
          description: it.desc_es || null,
          descriptionEn: it.desc_en || null,
          price: it.price || null,
          featured: !!it.featured,
          image: it.image || null,
          order: iOrder,
        },
      });
    }
  }

  console.log(`Seed completado: admin, ajustes, eventos y carta real (${menu.sections.length} secciones).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
