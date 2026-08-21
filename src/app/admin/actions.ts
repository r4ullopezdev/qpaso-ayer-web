"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function genCode(len = 4): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(len);
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function str(fd: FormData, k: string): string {
  return (fd.get(k) as string | null)?.trim() ?? "";
}
function bool(fd: FormData, k: string): boolean {
  return fd.get(k) === "on" || fd.get(k) === "true";
}
function intOrNull(fd: FormData, k: string): number | null {
  const v = str(fd, k);
  if (v === "") return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || "evento";
  let n = 1;
  while (true) {
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function createEvent(fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  const slug = await uniqueSlug(slugify(title));
  const dateStr = str(fd, "date");
  await prisma.event.create({
    data: {
      slug,
      title,
      subtitle: str(fd, "subtitle") || null,
      description: str(fd, "description") || null,
      motor: str(fd, "motor") || null,
      coverImage: str(fd, "coverImage") || null,
      date: dateStr ? new Date(dateStr) : new Date(),
      startTime: str(fd, "startTime") || "22:00",
      published: bool(fd, "published"),
      girlsListOpen: bool(fd, "girlsListOpen"),
      guysListOpen: bool(fd, "guysListOpen"),
      girlsFreeUntil: str(fd, "girlsFreeUntil") || "00:00",
      guysFreeUntil: str(fd, "guysFreeUntil") || "23:00",
      girlsCap: intOrNull(fd, "girlsCap"),
      guysCap: intOrNull(fd, "guysCap"),
      paidEntryOpen: bool(fd, "paidEntryOpen"),
      paidPrice: str(fd, "paidPrice") || "$10",
      girlsTableOpen: bool(fd, "girlsTableOpen"),
      girlsTableMin: intOrNull(fd, "girlsTableMin") ?? 4,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/eventos");
  redirect("/admin");
}

export async function saveEvent(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  const slug = await uniqueSlug(slugify(title), id);
  const dateStr = str(fd, "date");
  await prisma.event.update({
    where: { id },
    data: {
      slug,
      title,
      subtitle: str(fd, "subtitle") || null,
      description: str(fd, "description") || null,
      motor: str(fd, "motor") || null,
      coverImage: str(fd, "coverImage") || null,
      date: dateStr ? new Date(dateStr) : undefined,
      startTime: str(fd, "startTime") || "22:00",
      published: bool(fd, "published"),
      closed: bool(fd, "closed"),
      girlsListOpen: bool(fd, "girlsListOpen"),
      guysListOpen: bool(fd, "guysListOpen"),
      girlsFreeUntil: str(fd, "girlsFreeUntil") || "00:00",
      guysFreeUntil: str(fd, "guysFreeUntil") || "23:00",
      girlsCap: intOrNull(fd, "girlsCap"),
      guysCap: intOrNull(fd, "guysCap"),
      paidEntryOpen: bool(fd, "paidEntryOpen"),
      paidPrice: str(fd, "paidPrice") || "$10",
      girlsTableOpen: bool(fd, "girlsTableOpen"),
      girlsTableMin: intOrNull(fd, "girlsTableMin") ?? 4,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/eventos");
  revalidatePath(`/eventos/${slug}`);
  redirect(`/admin/eventos/${id}`);
}

/** Toggle rápido de un booleano del evento (bloquear listas, publicar, cerrar). */
export async function setEventFlag(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const field = str(fd, "field");
  const value = str(fd, "value") === "true";
  const allowed = ["published", "closed", "girlsListOpen", "guysListOpen", "paidEntryOpen", "girlsTableOpen"];
  if (!allowed.includes(field)) return;
  await prisma.event.update({ where: { id }, data: { [field]: value } });
  revalidatePath("/admin");
  revalidatePath("/admin/eventos/" + id);
  revalidatePath("/eventos");
}

export async function deleteEvent(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/eventos");
  redirect("/admin");
}

/** Borra de golpe todos los eventos NO publicados (borradores/desactivados). */
export async function deleteUnpublishedEvents() {
  await requireAdmin();
  await prisma.event.deleteMany({ where: { published: false } });
  revalidatePath("/admin");
  revalidatePath("/eventos");
  redirect("/admin");
}

export async function toggleCheckIn(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const current = await prisma.signup.findUnique({ where: { id } });
  if (!current) return;
  await prisma.signup.update({ where: { id }, data: { checkedIn: !current.checkedIn } });
  revalidatePath("/admin/eventos/" + str(fd, "eventId"));
}

export async function deleteSignup(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await prisma.signup.delete({ where: { id } });
  revalidatePath("/admin/eventos/" + str(fd, "eventId"));
}

// ---------- Promotores ----------
export async function createPromoter(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  let code = (str(fd, "code") || name)
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20);
  if (!code) code = "PROMO" + genCode(3);
  // unicidad
  let final = code;
  let n = 1;
  while (await prisma.promoter.findUnique({ where: { code: final } })) {
    n += 1;
    final = `${code}${n}`;
  }
  const password = str(fd, "password") || genCode(6);
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.promoter.create({ data: { code: final, name, passwordHash, active: true } });
  revalidatePath("/admin/promotores");
}

export async function togglePromoter(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const p = await prisma.promoter.findUnique({ where: { id } });
  if (!p) return;
  await prisma.promoter.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/admin/promotores");
}

export async function deletePromoter(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  // Los signups quedan con promoterId = null (onDelete: SetNull en el schema).
  await prisma.promoter.delete({ where: { id } });
  revalidatePath("/admin/promotores");
}

export async function resetPromoterPassword(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const password = str(fd, "password");
  if (!password) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.promoter.update({ where: { id }, data: { passwordHash } });
  revalidatePath("/admin/promotores");
}

// ---------- Códigos de mesa ----------
export async function generateTableCodes(fd: FormData) {
  await requireAdmin();
  const count = Math.min(Math.max(parseInt(str(fd, "count") || "10", 10) || 10, 1), 100);
  const codes = new Set<string>();
  while (codes.size < count) codes.add("QPA-" + genCode(4));
  // filtrar los que ya existan
  const arr = [...codes];
  const existing = await prisma.tableCode.findMany({ where: { code: { in: arr } }, select: { code: true } });
  const existingSet = new Set(existing.map((e) => e.code));
  const fresh = arr.filter((c) => !existingSet.has(c));
  if (fresh.length) {
    await prisma.tableCode.createMany({ data: fresh.map((code) => ({ code })) });
  }
  revalidatePath("/admin/codigos");
}

export async function deleteTableCode(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await prisma.tableCode.delete({ where: { id } });
  revalidatePath("/admin/codigos");
}

// ---------- Carta (menú) ----------
function revalidateMenu() {
  revalidatePath("/admin/carta");
  revalidatePath("/restaurante");
  revalidatePath("/en/restaurante");
}

export async function createSection(fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  if (!title) return;
  const max = await prisma.menuSection.aggregate({ _max: { order: true } });
  await prisma.menuSection.create({
    data: { title, titleEn: str(fd, "titleEn") || null, order: (max._max.order ?? 0) + 1 },
  });
  revalidateMenu();
}

export async function saveSection(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await prisma.menuSection.update({
    where: { id },
    data: { title: str(fd, "title"), titleEn: str(fd, "titleEn") || null, order: intOrNull(fd, "order") ?? 0 },
  });
  revalidateMenu();
}

export async function deleteSection(fd: FormData) {
  await requireAdmin();
  await prisma.menuSection.delete({ where: { id: str(fd, "id") } });
  revalidateMenu();
}

export async function createMenuItem(fd: FormData) {
  await requireAdmin();
  const sectionId = str(fd, "sectionId");
  const name = str(fd, "name");
  if (!sectionId || !name) return;
  const max = await prisma.menuItem.aggregate({ where: { sectionId }, _max: { order: true } });
  await prisma.menuItem.create({
    data: {
      sectionId,
      name,
      nameEn: str(fd, "nameEn") || null,
      description: str(fd, "description") || null,
      descriptionEn: str(fd, "descriptionEn") || null,
      price: str(fd, "price") || null,
      featured: bool(fd, "featured"),
      image: str(fd, "image") || null,
      order: (max._max.order ?? 0) + 1,
    },
  });
  revalidateMenu();
}

export async function saveMenuItem(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await prisma.menuItem.update({
    where: { id },
    data: {
      sectionId: str(fd, "sectionId") || undefined,
      name: str(fd, "name"),
      nameEn: str(fd, "nameEn") || null,
      description: str(fd, "description") || null,
      descriptionEn: str(fd, "descriptionEn") || null,
      price: str(fd, "price") || null,
      featured: bool(fd, "featured"),
      image: str(fd, "image") || null,
      order: intOrNull(fd, "order") ?? 0,
    },
  });
  revalidateMenu();
}

export async function deleteMenuItem(fd: FormData) {
  await requireAdmin();
  await prisma.menuItem.delete({ where: { id: str(fd, "id") } });
  revalidateMenu();
}

// ---------- Usuarios de puerta ----------
export async function createDoorUser(fd: FormData) {
  await requireAdmin();
  const username = str(fd, "username").toLowerCase().replace(/\s+/g, "");
  const password = str(fd, "password");
  if (!username || !password) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash, role: "DOOR" },
    create: { username, passwordHash, role: "DOOR" },
  });
  revalidatePath("/admin/promotores");
}
