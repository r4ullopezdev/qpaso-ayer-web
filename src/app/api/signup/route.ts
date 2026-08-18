import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validation";
import { countsForEvent, listStatus } from "@/lib/events";

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { eventId, list, name, phone, email, guests } = parsed.data;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.published) {
    return NextResponse.json({ error: "Evento no disponible" }, { status: 404 });
  }

  const counts = await countsForEvent(eventId);
  const status = listStatus(event, counts);
  if (list === "CHICAS" && !status.chicasOpen) {
    return NextResponse.json(
      { error: status.chicasFull ? "La lista de chicas está llena" : "La lista de chicas está cerrada" },
      { status: 409 }
    );
  }
  if (list === "CHICOS" && !status.chicosOpen) {
    return NextResponse.json(
      { error: status.chicosFull ? "La lista de chicos está llena" : "La lista de chicos está cerrada" },
      { status: 409 }
    );
  }

  await prisma.signup.create({
    data: {
      eventId,
      list,
      name,
      phone: phone || null,
      email: email || null,
      guests: guests || 1,
    },
  });

  const freeUntil = list === "CHICAS" ? event.girlsFreeUntil : event.guysFreeUntil;
  return NextResponse.json({
    ok: true,
    message: `¡Listo, ${name}! Estás en la lista ${list.toLowerCase()} de "${event.title}". Entrada gratis hasta las ${freeUntil}. Llega con tiempo y muestra tu nombre en la puerta.`,
  });
}
