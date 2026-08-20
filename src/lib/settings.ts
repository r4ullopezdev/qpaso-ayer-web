import { prisma } from "./db";

export type SiteSettings = Record<string, string>;

const DEFAULTS: SiteSettings = {
  whatsapp: "+507 0000-0000",
  instagram: "@qpasoayerpanama",
  address: "Calle Uruguay, Bella Vista — Ciudad de Panamá",
  hoursDinner: "Mar–Dom desde 6:00 PM",
  hoursParty: "Jue–Sáb hasta tarde",
  heroTagline: "Donde empieza la noche en Panamá",
  aboutText:
    "En Calle Uruguay, Q'Paso Ayer es el punto donde empieza la noche.",
  mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Q%27Paso%20Ayer%20Calle%20Uruguay%2C%20Ciudad%20de%20Panam%C3%A1",
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.setting.findMany();
    const map: SiteSettings = { ...DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return { ...DEFAULTS };
  }
}

export function whatsappLink(number: string, text?: string): string {
  const digits = number.replace(/[^0-9]/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
