import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "qpa_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET no configurada o demasiado corta");
  }
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  sub: string;
  username: string;
}

export async function createSessionToken(p: SessionPayload): Promise<string> {
  return await new SignJWT({ username: p.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return { sub: String(payload.sub), username: String(payload.username ?? "") };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
