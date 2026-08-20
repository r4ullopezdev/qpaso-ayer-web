import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";

function extractToken(raw: string): string {
  const s = (raw || "").trim();
  const m = s.match(/\/entrada\/([a-f0-9]{16,})/i);
  if (m) return m[1];
  // por si escanean solo el token
  const t = s.replace(/[^a-f0-9]/gi, "");
  return t;
}

export async function POST(req: NextRequest) {
  // Solo staff con sesión (admin o portero)
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }
  const ticketToken = extractToken(body.code || "");
  if (!ticketToken) {
    return NextResponse.json({ status: "invalid", message: "QR no reconocido" });
  }

  const signup = await prisma.signup.findUnique({
    where: { token: ticketToken },
    include: { event: true, promoter: true },
  });
  if (!signup) {
    return NextResponse.json({ status: "invalid", message: "Entrada no encontrada" });
  }

  const info = {
    name: signup.name,
    list: signup.list,
    entryType: signup.entryType,
    guests: signup.guests,
    event: signup.event.title,
    eventDate: formatLongDate(signup.event.date),
    promoter: signup.promoter?.name ?? null,
  };

  if (signup.checkedIn) {
    return NextResponse.json({
      status: "already",
      message: "Esta entrada YA fue usada",
      at: signup.checkedInAt,
      by: signup.checkedInBy,
      ...info,
    });
  }

  const updated = await prisma.signup.update({
    where: { id: signup.id },
    data: { checkedIn: true, checkedInAt: new Date(), checkedInBy: session.username },
  });

  return NextResponse.json({
    status: "ok",
    message: "ENTRADA VÁLIDA · deja pasar",
    at: updated.checkedInAt,
    ...info,
  });
}
