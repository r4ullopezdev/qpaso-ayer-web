import nodemailer from "nodemailer";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export interface TicketEmailData {
  to: string;
  name: string;
  eventTitle: string;
  dateStr: string;
  entryLabel: string;
  freeUntil?: string | null;
  ticketUrl: string;
  qrDataUrl: string; // data:image/png;base64,...
}

function buildHtml(d: TicketEmailData, qrSrc: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0b0a0d;font-family:Arial,Helvetica,sans-serif;color:#f4f1ea">
  <div style="max-width:480px;margin:0 auto;padding:24px">
    <div style="text-align:center;color:#f5c542;font-size:26px;font-weight:900;letter-spacing:1px">Q'PASO AYER</div>
    <div style="text-align:center;color:#a49db0;font-size:12px;margin-top:2px">Calle Uruguay · Ciudad de Panamá</div>
    <div style="background:#17141c;border:1px solid #2a2531;border-radius:16px;padding:22px;margin-top:18px;text-align:center">
      <div style="color:#a49db0;font-size:13px">Tu entrada para</div>
      <div style="font-size:22px;font-weight:800;margin:6px 0 2px">${d.eventTitle}</div>
      <div style="color:#a49db0;font-size:13px">${d.dateStr}</div>
      <div style="display:inline-block;margin-top:10px;padding:5px 12px;border-radius:999px;background:rgba(245,197,66,.12);color:#f5c542;font-size:12px;font-weight:700">${d.entryLabel}</div>
      <div style="background:#fff;border-radius:12px;padding:14px;margin:18px auto 8px;width:220px">
        <img src="${qrSrc}" alt="QR" width="220" height="220" style="display:block;width:220px;height:220px"/>
      </div>
      <div style="color:#a49db0;font-size:12px">Muestra este QR en la puerta.${d.freeUntil ? ` Entrada gratis hasta las ${d.freeUntil}.` : ""}</div>
      <a href="${d.ticketUrl}" style="display:inline-block;margin-top:16px;background:#f5c542;color:#1a1300;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">Ver mi entrada</a>
    </div>
    <div style="text-align:center;color:#6b6577;font-size:11px;margin-top:16px">Hola ${d.name}, ¡nos vemos en la pista! No compartas tu QR.</div>
  </div></body></html>`;
}

function transportFromEnv() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendTicketEmail(
  d: TicketEmailData
): Promise<{ sent: boolean; previewPath?: string }> {
  const transport = transportFromEnv();
  const from = process.env.EMAIL_FROM || "Q'Paso Ayer <no-reply@qpasoayer.com>";

  if (transport) {
    const base64 = d.qrDataUrl.split(",")[1] ?? "";
    await transport.sendMail({
      from,
      to: d.to,
      subject: `Tu entrada · ${d.eventTitle}`,
      html: buildHtml(d, "cid:qrcode"),
      attachments: [
        {
          filename: "entrada-qr.png",
          content: Buffer.from(base64, "base64"),
          cid: "qrcode",
        },
      ],
    });
    return { sent: true };
  }

  // Fallback de desarrollo: guardar el email como archivo HTML visible
  try {
    const dir = join(process.cwd(), "emails");
    await mkdir(dir, { recursive: true });
    const file = `ticket_${Date.now()}.html`;
    await writeFile(join(dir, file), buildHtml(d, d.qrDataUrl), "utf8");
    console.log(`[email:dev] Correo de entrada guardado en emails/${file} (SMTP no configurado)`);
    return { sent: false, previewPath: `emails/${file}` };
  } catch {
    return { sent: false };
  }
}
