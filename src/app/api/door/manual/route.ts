import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { eventId?: string; promoterId?: string; entryType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }
  const entryType = body.entryType === "PAID" ? "PAID" : "FREE";
  const eventId = body.eventId || "";
  if (!eventId) return NextResponse.json({ error: "Falta el evento" }, { status: 400 });

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  let promoterId: string | null = null;
  if (body.promoterId) {
    const promoter = await prisma.promoter.findUnique({ where: { id: body.promoterId } });
    if (promoter) promoterId = promoter.id;
  }

  const now = new Date();
  await prisma.signup.create({
    data: {
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
    },
  });

  // Conteos rápidos para este evento (entradas manuales registradas)
  const [freeCount, paidCount] = await Promise.all([
    prisma.signup.count({ where: { eventId, manual: true, entryType: "FREE" } }),
    prisma.signup.count({ where: { eventId, manual: true, entryType: "PAID" } }),
  ]);

  return NextResponse.json({ ok: true, freeCount, paidCount });
}
