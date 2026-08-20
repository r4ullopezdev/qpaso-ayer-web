import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "qpa_session"; // admin / portero
export const PROMOTER_COOKIE = "qpa_promoter"; // promotor
export const REF_COOKIE = "qpa_ref"; // código de promotor referido
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET no configurada o demasiado corta");
  }
  return new TextEncoder().encode(s);
}

export type Role = "ADMIN" | "DOOR";

export interface SessionPayload {
  sub: string;
  username: string;
  role: Role;
}

export interface PromoterPayload {
  sub: string;
  code: string;
  name: string;
}

export async function createSessionToken(p: SessionPayload): Promise<string> {
  return await new SignJWT({ username: p.username, role: p.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const role = (payload.role === "DOOR" ? "DOOR" : "ADMIN") as Role;
    return { sub: String(payload.sub), username: String(payload.username ?? ""), role };
  } catch {
    return null;
  }
}

export async function createPromoterToken(p: PromoterPayload): Promise<string> {
  return await new SignJWT({ code: p.code, name: p.name, kind: "promoter" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifyPromoterToken(token: string): Promise<PromoterPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || payload.kind !== "promoter") return null;
    return { sub: String(payload.sub), code: String(payload.code ?? ""), name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
