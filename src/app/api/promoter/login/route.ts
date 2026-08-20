import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createPromoterToken, PROMOTER_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  let body: { code?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }
  const code = (body.code ?? "").trim().toUpperCase();
  const password = body.password ?? "";
  if (!code || !password) {
    return NextResponse.json({ error: "Código y contraseña requeridos" }, { status: 400 });
  }

  const promoter = await prisma.promoter.findUnique({ where: { code } });
  if (!promoter || !promoter.active || !(await bcrypt.compare(password, promoter.passwordHash))) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const token = await createPromoterToken({ sub: promoter.id, code: promoter.code, name: promoter.name });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PROMOTER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
