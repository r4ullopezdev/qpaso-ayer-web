import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { qrDataUrl } from "@/lib/qr";
import { formatLongDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tu entrada · Q'Paso Ayer", robots: { index: false } };

const ENTRY_LABEL: Record<string, string> = {
  FREE: "Lista gratis",
  PAID: "Entrada de pago (se paga en puerta)",
  TABLE_GIRLS: "Mesa para chicas",
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const signup = await prisma.signup.findUnique({
    where: { token },
    include: { event: true, promoter: true },
  });
  if (!signup) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const ticketUrl = `${proto}://${host}/entrada/${token}`;
  const qr = await qrDataUrl(ticketUrl);

  const freeUntil = signup.list === "CHICAS" ? signup.event.girlsFreeUntil : signup.event.guysFreeUntil;

  return (
    <div className="container-x" style={{ maxWidth: 460, paddingBlock: 40 }}>
      <div style={{ textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 28, color: "var(--gold)" }}>Q&apos;PASO AYER</div>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>Calle Uruguay · Ciudad de Panamá</div>
      </div>

      <div className="card" style={{ padding: 24, marginTop: 18, textAlign: "center", borderColor: "var(--gold)" }}>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>Tu entrada para</div>
        <div className="font-display" style={{ fontSize: 28, marginTop: 4, lineHeight: 1 }}>{signup.event.title}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
          {formatLongDate(signup.event.date)} · {signup.event.startTime}
        </div>
        <div className="chip" style={{ marginTop: 10 }}>{ENTRY_LABEL[signup.entryType] ?? "Entrada"}</div>

        <div style={{ background: "#fff", borderRadius: 14, padding: 16, width: 240, margin: "18px auto 6px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR de tu entrada" style={{ width: "100%", display: "block" }} />
        </div>

        {signup.checkedIn ? (
          <div style={{ color: "var(--red-2)", fontWeight: 700, fontSize: 14, marginTop: 6 }}>
            Ya usada · entró {signup.checkedInAt ? new Date(signup.checkedInAt).toLocaleString("es-PA") : ""}
          </div>
        ) : (
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
            Muestra este QR en la puerta.{signup.entryType === "FREE" ? ` Gratis hasta las ${freeUntil}.` : ""}
          </div>
        )}

        <div style={{ marginTop: 14, textAlign: "left", background: "var(--bg-2)", borderRadius: 10, padding: 12, fontSize: 13 }}>
          <div><b>Nombre:</b> {signup.name}</div>
          {signup.entryType === "TABLE_GIRLS" && <div><b>Grupo:</b> {signup.guests} personas</div>}
          {signup.promoter && <div><b>Invita:</b> {signup.promoter.name}</div>}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link href="/eventos" className="btn btn-ghost" style={{ fontSize: 13 }}>Ver más eventos</Link>
      </div>
    </div>
  );
}
