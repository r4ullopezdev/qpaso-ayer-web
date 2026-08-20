import { EventsView } from "@/components/pages/EventsView";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Events · Q'Paso Ayer Panama",
  description: "This week's events at Q'Paso Ayer, Calle Uruguay, Panama City. Join the free guest list.",
  alternates: { canonical: "/en/eventos", languages: { es: "/eventos", en: "/en/eventos" } },
};

export default function EnEvents() {
  return <EventsView lang="en" />;
}
