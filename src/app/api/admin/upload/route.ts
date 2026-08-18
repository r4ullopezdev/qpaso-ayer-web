import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getSession } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Formato no permitido (usa JPG, PNG, WEBP, GIF o SVG)" }, { status: 400 });
  }
  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "Imagen demasiado grande (máx. 6 MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `evt_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${EXT[file.type]}`;
  await writeFile(join(dir, name), bytes);

  return NextResponse.json({ url: `/uploads/${name}` });
}
