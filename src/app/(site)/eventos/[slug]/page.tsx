import { EventDetailView } from "@/components/pages/EventDetailView";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventDetailView lang="es" slug={slug} />;
}
