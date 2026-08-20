import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  PROMOTER_COOKIE,
  verifySessionToken,
  verifyPromoterToken,
  type SessionPayload,
  type PromoterPayload,
} from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Solo ADMIN. Un portero (DOOR) es enviado a su escáner. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/puerta");
  return session;
}

/** ADMIN o DOOR (para el escáner de puerta). */
export async function requireDoor(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login?next=/puerta");
  return session;
}

export async function getPromoter(): Promise<PromoterPayload | null> {
  const jar = await cookies();
  const token = jar.get(PROMOTER_COOKIE)?.value;
  if (!token) return null;
  return verifyPromoterToken(token);
}

export async function requirePromoter(): Promise<PromoterPayload> {
  const p = await getPromoter();
  if (!p) redirect("/promotor/login");
  return p;
}
