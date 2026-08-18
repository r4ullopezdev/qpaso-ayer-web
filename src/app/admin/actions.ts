"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

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
  const allowed = ["published", "closed", "girlsListOpen", "guysListOpen"];
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
