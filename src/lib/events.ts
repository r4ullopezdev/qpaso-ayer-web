import { prisma } from "./db";

export interface ListCounts {
  chicas: number;
  chicos: number;
  chicasGuests: number;
  chicosGuests: number;
  total: number;
}

export async function countsForEvent(eventId: string): Promise<ListCounts> {
  const rows = await prisma.signup.groupBy({
    by: ["list"],
    where: { eventId },
    _count: { _all: true },
    _sum: { guests: true },
  });
  const get = (l: string) => rows.find((r) => r.list === l);
  const chicas = get("CHICAS");
  const chicos = get("CHICOS");
  return {
    chicas: chicas?._count._all ?? 0,
    chicos: chicos?._count._all ?? 0,
    chicasGuests: chicas?._sum.guests ?? 0,
    chicosGuests: chicos?._sum.guests ?? 0,
    total: (chicas?._sum.guests ?? 0) + (chicos?._sum.guests ?? 0),
  };
}

/** Devuelve el estado de cada lista para la parte pública. */
export function listStatus(
  event: {
    girlsListOpen: boolean;
    guysListOpen: boolean;
    girlsCap: number | null;
    guysCap: number | null;
    closed: boolean;
  },
  counts: ListCounts
) {
  const chicasFull =
    event.girlsCap != null && counts.chicasGuests >= event.girlsCap;
  const chicosFull = event.guysCap != null && counts.chicosGuests >= event.guysCap;
  return {
    chicasOpen: !event.closed && event.girlsListOpen && !chicasFull,
    chicosOpen: !event.closed && event.guysListOpen && !chicosFull,
    chicasFull,
    chicosFull,
  };
}
