import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { EventForm } from "@/components/admin/EventForm";
import { createEvent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <div className="container-x" style={{ paddingTop: 28, maxWidth: 800 }}>
      <Link href="/admin" style={{ color: "var(--muted)", fontSize: 13 }}>← Panel</Link>
      <h1 className="font-display" style={{ fontSize: 38, color: "var(--gold)", marginTop: 10 }}>
        Nuevo evento
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
        Configura la noche y sus listas gratuitas.
      </p>
      <EventForm action={createEvent} />
    </div>
  );
}
