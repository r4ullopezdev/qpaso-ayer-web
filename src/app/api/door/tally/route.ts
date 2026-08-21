import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

async function requireStaff(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

/** Devuelve el acumulado por promotor y tipo de entrada (solo registros de puerta) para un evento. */
export async function GET(req: NextRequest) {
  const session = await requireStaff(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const eventId = req.nextUrl.searchParams.get("eventId") || "";
  if (!eventId) return NextResponse.json({ error: "Falta el evento" }, { status: 400 });

  const rows = await prisma.signup.groupBy({
    by: ["promoterId", "entryType"],
    where: { eventId, manual: true },
    _count: { _all: true },
  });

  // { promoterId: { FREE: n, PAID: n } }  (promoterId "" = sin promotor)
  const tallies: Record<string, { FREE: number; PAID: number }> = {};
  for (const r of rows) {
    const key = r.promoterId ?? "";
    if (!tallies[key]) tallies[key] = { FREE: 0, PAID: 0 };
    if (r.entryType === "FREE" || r.entryType === "PAID") {
      tallies[key][r.entryType] = r._count._all;
    }
  }
  return NextResponse.json({ tallies });
}

/** Aplica un delta (+/-) de personas para (evento, tipo, promotor). */
export async function POST(req: NextRequest) {
  const session = await requireStaff(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { eventId?: string; entryType?: string; promoterId?: string | null; delta?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const eventId = body.eventId || "";
  const entryType = body.entryType === "PAID" ? "PAID" : "FREE";
  let delta = Math.trunc(Number(body.delta) || 0);
  if (!eventId) return NextResponse.json({ error: "Falta el evento" }, { status: 400 });
  // límite de seguridad por click
  if (delta > 50) delta = 50;
  if (delta < -50) delta = -50;
  if (delta === 0) return NextResponse.json({ error: "Sin cambios" }, { status: 400 });

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  let promoterId: string | null = null;
  if (body.promoterId) {
    const p = await prisma.promoter.findUnique({ where: { id: body.promoterId } });
    if (p) promoterId = p.id;
  }

  const now = new Date();
  if (delta > 0) {
    await prisma.signup.createMany({
      data: Array.from({ length: delta }, () => ({
        eventId,
        entryType,
        list: "MANUAL",
        name: "(puerta)",
        email: "",
        guests: 1,
        promoterId,
        token: randomUUID().replace(/-/g, ""),
        manual: true,
        checkedIn: true,
        checkedInAt: now,
        checkedInBy: session.username,
      })),
    });
  } else {
    // borrar hasta |delta| registros de puerta de ese promotor/tipo
    const toDelete = await prisma.signup.findMany({
      where: { eventId, entryType, manual: true, promoterId: promoterId ?? null },
      orderBy: { createdAt: "desc" },
      take: -delta,
      select: { id: true },
    });
    if (toDelete.length) {
      await prisma.signup.deleteMany({ where: { id: { in: toDelete.map((s) => s.id) } } });
    }
  }

  const count = await prisma.signup.count({
    where: { eventId, entryType, manual: true, promoterId: promoterId ?? null },
  });
  return NextResponse.json({ ok: true, entryType, promoterId: promoterId ?? "", count });
}
