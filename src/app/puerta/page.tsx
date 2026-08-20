import { requireDoor } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DoorScanner } from "@/components/DoorScanner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Puerta · Q'Paso Ayer" };

export default async function PuertaPage() {
  const session = await requireDoor();
  const now = new Date(Date.now() - 8 * 3600 * 1000);
  const events = await prisma.event.findMany({
    where: { published: true, date: { gte: now } },
    orderBy: { date: "asc" },
    take: 10,
    select: { id: true, title: true },
  });
  const promoters = await prisma.promoter.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });

  return <DoorScanner username={session.username} events={events} promoters={promoters} />;
}
