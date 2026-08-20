import { EventsView } from "@/components/pages/EventsView";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Eventos · Q'Paso Ayer",
  alternates: { canonical: "/eventos", languages: { es: "/eventos", en: "/en/eventos" } },
};

export default function EventosPage() {
  return <EventsView lang="es" />;
}
