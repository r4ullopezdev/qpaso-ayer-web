import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validation";
import { countsForEvent, listStatus } from "@/lib/events";
import { REF_COOKIE } from "@/lib/auth/session";
import { qrDataUrl } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/email";
import { formatLongDate } from "@/lib/format";

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
  const input = parsed.data;
  const lang = (json as { lang?: string })?.lang === "en" ? "en" : "es";
  const entryType = input.entryType;
  let list = input.list;
  const guests = input.guests || 1;

  const event = await prisma.event.findUnique({ where: { id: input.eventId } });
  if (!event || !event.published) {
    return NextResponse.json({ error: "Evento no disponible" }, { status: 404 });
  }
  if (event.closed) {
    return NextResponse.json({ error: "Este evento está cerrado" }, { status: 409 });
  }

  // Promotor referido (del formulario o de la cookie ?ref=)
  const refCode = (input.promoterCode || req.cookies.get(REF_COOKIE)?.value || "").toUpperCase();
  let promoterId: string | null = null;
  if (refCode) {
    const promoter = await prisma.promoter.findUnique({ where: { code: refCode } });
    if (promoter && promoter.active) promoterId = promoter.id;
  }

  // Validación por tipo de entrada
  let entryLabel = "";
  let freeUntil: string | null = null;

  if (entryType === "FREE") {
    const counts = await countsForEvent(event.id);
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
    freeUntil = list === "CHICAS" ? event.girlsFreeUntil : event.guysFreeUntil;
    entryLabel = `Lista gratis · ${list}`;
  } else if (entryType === "PAID") {
    if (!event.paidEntryOpen) {
      return NextResponse.json({ error: "La entrada de pago no está disponible" }, { status: 409 });
    }
    entryLabel = `Entrada de pago (${event.paidPrice}) · se paga en puerta`;
  } else if (entryType === "TABLE_GIRLS") {
    if (!event.girlsTableOpen) {
      return NextResponse.json({ error: "Las mesas para chicas no están disponibles" }, { status: 409 });
    }
    if (guests < event.girlsTableMin) {
      return NextResponse.json(
        { error: `La mesa para chicas es para grupos de ${event.girlsTableMin} o más` },
        { status: 400 }
      );
    }
    const code = (input.tableCode || "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Necesitas un código de mesa" }, { status: 400 });
    }
    // Consumir el código de forma atómica (si otro lo usó, count=0)
    const consumed = await prisma.tableCode.updateMany({
      where: { code, used: false },
      data: { used: true, usedAt: new Date() },
    });
    if (consumed.count === 0) {
      return NextResponse.json({ error: "Código de mesa inválido o ya usado" }, { status: 409 });
    }
    list = "CHICAS";
    entryLabel = `Mesa para chicas · grupo de ${guests}`;
    input.tableCode = code;
  }

  const token = randomUUID().replace(/-/g, "");

  const signup = await prisma.signup.create({
    data: {
      eventId: event.id,
      entryType,
      list,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      guests,
      promoterId,
      token,
      tableCode: entryType === "TABLE_GIRLS" ? input.tableCode || null : null,
    },
  });

  // Enlazar el código de mesa consumido con el signup
  if (entryType === "TABLE_GIRLS" && input.tableCode) {
    await prisma.tableCode.updateMany({
      where: { code: input.tableCode },
      data: { usedBySignup: signup.id },
    });
  }

  // Ticket + QR + email
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || req.nextUrl.origin;
  const ticketUrl = `${origin}/entrada/${token}`;
  const qr = await qrDataUrl(ticketUrl);

  let emailSent = false;
  try {
    const r = await sendTicketEmail({
      to: input.email,
      name: input.name,
      eventTitle: event.title,
      dateStr: `${formatLongDate(event.date)} · ${event.startTime}`,
      entryLabel,
      freeUntil,
      ticketUrl,
      qrDataUrl: qr,
    });
    emailSent = r.sent;
  } catch (e) {
    console.error("Error enviando email de entrada:", e);
  }

  return NextResponse.json({
    ok: true,
    token,
    ticketUrl,
    qrDataUrl: qr,
    emailSent,
    message:
      lang === "en"
        ? emailSent
          ? `You're in, ${input.name}! We emailed your QR ticket to ${input.email}.`
          : `You're in, ${input.name}! Here's your QR ticket. Save it or take a screenshot.`
        : emailSent
          ? `¡Listo, ${input.name}! Te enviamos tu entrada con QR a ${input.email}.`
          : `¡Listo, ${input.name}! Aquí está tu entrada con QR. Guárdala o toma captura.`,
  });
}
