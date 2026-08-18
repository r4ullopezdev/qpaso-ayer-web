import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
    update: { passwordHash },
    create: { username, passwordHash },
  });

  // ---- Ajustes del sitio ----
  const settings: Record<string, string> = {
    whatsapp: "+507 0000-0000",
    instagram: "@qpasoayerpanama",
    address: "Calle Uruguay, Bella Vista — Ciudad de Panamá",
    hoursDinner: "Mar–Dom desde 6:00 PM",
    hoursParty: "Jue–Sáb hasta tarde",
    heroTagline: "Donde empieza la noche en Panamá",
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

  // ---- Carta (placeholder editable, se reemplazará con el PDF oficial) ----
  await prisma.menuItem.deleteMany();
  await prisma.menuSection.deleteMany();
  const compartir = await prisma.menuSection.create({
    data: { title: "Para compartir", order: 1 },
  });
  const burgers = await prisma.menuSection.create({
    data: { title: "Burgers y platos", order: 2 },
  });
  const tragos = await prisma.menuSection.create({
    data: { title: "Tragos y cervezas", order: 3 },
  });
  await prisma.menuItem.createMany({
    data: [
      { sectionId: compartir.id, name: "Alitas (x10)", description: "BBQ, buffalo o picantes", price: "$9", order: 1 },
      { sectionId: compartir.id, name: "Nachos QPA", description: "Para la mesa", price: "$8", order: 2 },
      { sectionId: compartir.id, name: "Papas cargadas", description: "Queso y tocino", price: "$7", order: 3 },
      { sectionId: burgers.id, name: "QPA Burger", description: "Doble carne, cheddar", price: "$10", order: 1 },
      { sectionId: burgers.id, name: "Sliders (x3)", description: "Mini burgers para compartir", price: "$9", order: 2 },
      { sectionId: tragos.id, name: "Cerveza nacional", description: "Bien fría", price: "$3", order: 1 },
      { sectionId: tragos.id, name: "Torre de cerveza 3L", description: "Para el grupo", price: "$18", order: 2 },
      { sectionId: tragos.id, name: "Coctel de la casa", description: "Pregunta al bartender", price: "$9", order: 3 },
    ],
  });

  console.log("Seed completado: admin, ajustes, eventos y carta placeholder.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
