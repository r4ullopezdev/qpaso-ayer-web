import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatLongDate } from "@/lib/format";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBody {
  messages?: ChatMessage[];
  lang?: string;
}

async function buildContext(): Promise<string> {
  const settings = await getSettings();
  const events = await prisma.event.findMany({
    where: { published: true, closed: false, date: { gte: new Date(Date.now() - 6 * 3600 * 1000) } },
    orderBy: { date: "asc" },
    take: 8,
  });
  const evLines = events
    .map((e) => {
      const lists: string[] = [];
      if (e.girlsListOpen) lists.push(`chicas gratis hasta ${e.girlsFreeUntil}`);
      if (e.guysListOpen) lists.push(`chicos gratis hasta ${e.guysFreeUntil}`);
      return `- ${e.title} — ${formatLongDate(e.date)} a las ${e.startTime}. ${
        e.subtitle ?? ""
      } Lista gratis: ${lists.join("; ") || "cerrada"}. Link: /eventos/${e.slug}`;
    })
    .join("\n");
  return `NEGOCIO: Q'Paso Ayer, bar de eventos y restaurante en ${settings.address}.
Tagline: ${settings.heroTagline}.
Horario cena: ${settings.hoursDinner}. Fiesta: ${settings.hoursParty}.
WhatsApp: ${settings.whatsapp}. Instagram: ${settings.instagram}.
Cómo funciona: se puede apuntar GRATIS a la lista de cada evento eligiendo CHICAS o CHICOS; cada lista tiene entrada gratis hasta una hora distinta. No se cobra online.
PRÓXIMOS EVENTOS:
${evLines || "(sin eventos publicados ahora mismo)"}`;
}

function fallbackAnswer(message: string, context: string): string {
  const m = message.toLowerCase();
  const line = (kw: string) =>
    context.split("\n").filter((l) => l.toLowerCase().includes(kw)).join("\n");
  if (/(evento|fiesta|hoy|finde|programaci|agenda|sábado|viernes|jueves)/.test(m)) {
    const ev = context.split("PRÓXIMOS EVENTOS:")[1] ?? "";
    return `Estos son los próximos eventos:\n${ev.trim()}\n\nEntra a /eventos para apuntarte gratis.`;
  }
  if (/(apunt|lista|entrada|gratis|chic)/.test(m)) {
    return "Puedes apuntarte GRATIS a la lista de cualquier evento: elige CHICAS o CHICOS (cada lista tiene entrada gratis hasta una hora distinta) y deja tu nombre. Entra a /eventos y elige el evento.";
  }
  if (/(carta|men[uú]|comer|cena|restaurante|comida)/.test(m)) {
    return "Sí, tenemos restaurante para cenar antes de la fiesta: cosas para compartir, burgers y tragos. Mira la carta en /restaurante.";
  }
  if (/(horario|hora|abren|cierran)/.test(m)) {
    return line("horario") || "Cena: Mar–Dom desde las 6:00 PM. Fiesta: Jue–Sáb hasta tarde.";
  }
  if (/(donde|dónde|ubicaci|direcci|calle)/.test(m)) {
    return line("negocio") || "Estamos en Calle Uruguay, Bella Vista, Ciudad de Panamá.";
  }
  if (/(reserv|mesa|botella|cumple|despedida)/.test(m)) {
    return "Para reservas de mesa, botellas o eventos privados (cumpleaños, despedidas) escríbenos por WhatsApp desde el botón 'Reservar'.";
  }
  return "¡Hola! Soy el asistente de Q'Paso Ayer. Puedo ayudarte con los eventos, cómo apuntarte gratis a la lista, la carta, horarios y reservas. ¿Qué quieres saber?";
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const lang = body.lang === "en" ? "en" : "es";
  const messages = (body.messages ?? []).slice(-10);
  const last = messages[messages.length - 1]?.content ?? "";
  const context = await buildContext();

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";

  // Fallback (sin Azure configurado)
  if (!endpoint || !apiKey || !deployment) {
    return NextResponse.json({
      reply: fallbackAnswer(last, context),
      mode: "fallback",
    });
  }

  const system = `Eres el asistente virtual de Q'Paso Ayer, un bar de eventos y restaurante en Calle Uruguay, Panamá.
Hablas en español panameño, cercano, breve y con buena energía (sin exagerar). Ayudas a la gente a descubrir eventos, apuntarse GRATIS a la lista (CHICAS o CHICOS), conocer la carta, horarios y reservas.
Usa SOLO la información de contexto siguiente. Si no sabes algo, invita a escribir por WhatsApp. No inventes precios ni fechas.
Cuando menciones un evento, incluye su link (/eventos/slug). Respuestas cortas.
${lang === "en" ? "IMPORTANT: Answer in ENGLISH (the user is browsing the English site). Use /en/eventos/slug links." : "Responde en español."}

CONTEXTO ACTUALIZADO:
${context}`;

  const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        // model-router: usa max_completion_tokens (NO max_tokens) y NO acepta temperature.
        messages: [{ role: "system", content: system }, ...messages],
        max_completion_tokens: 800,
      }),
    });
    if (!r.ok) {
      return NextResponse.json({ reply: fallbackAnswer(last, context), mode: "fallback" });
    }
    const data = await r.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() || fallbackAnswer(last, context);
    return NextResponse.json({ reply, mode: "azure" });
  } catch {
    return NextResponse.json({ reply: fallbackAnswer(last, context), mode: "fallback" });
  }
}
