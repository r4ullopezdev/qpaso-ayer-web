import type { Lang } from "./i18n";

const DAYS = {
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
const MONTHS = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

// Panamá está en UTC-5 todo el año (no tiene horario de verano). Las fechas se guardan en UTC;
// para MOSTRARLAS en hora de Panamá restamos 5 h y leemos los componentes con getUTC*.
const PA_OFFSET_MS = 5 * 3600 * 1000;
function paView(d: Date): Date {
  return new Date(d.getTime() - PA_OFFSET_MS);
}

export function formatEventDate(d: Date, lang: Lang = "es"): string {
  const x = paView(d);
  return `${DAYS[lang][x.getUTCDay()]} ${x.getUTCDate()} ${MONTHS[lang][x.getUTCMonth()]}`;
}

export function formatLongDate(d: Date, lang: Lang = "es"): string {
  const x = paView(d);
  const day = DAYS[lang][x.getUTCDay()];
  const cap = day.charAt(0).toUpperCase() + day.slice(1);
  if (lang === "en") return `${cap}, ${MONTHS.en[x.getUTCMonth()]} ${x.getUTCDate()}, ${x.getUTCFullYear()}`;
  return `${cap} ${x.getUTCDate()} de ${MONTHS.es[x.getUTCMonth()]}. ${x.getUTCFullYear()}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Formatea una fecha (guardada en UTC) para un <input type="datetime-local">, en hora de Panamá. */
export function toLocalInput(d: Date): string {
  const x = paView(d);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${x.getUTCFullYear()}-${p(x.getUTCMonth() + 1)}-${p(x.getUTCDate())}T${p(x.getUTCHours())}:${p(x.getUTCMinutes())}`;
}

/** Interpreta el valor de un <input type="datetime-local"> (sin zona) COMO hora de Panamá y devuelve el instante UTC. */
export function parsePanamaInput(s: string): Date {
  // s = "YYYY-MM-DDTHH:mm"  ->  añadimos segundos y el offset de Panamá (-05:00)
  const withOffset = /\d{2}:\d{2}$/.test(s) ? `${s}:00-05:00` : `${s}-05:00`;
  return new Date(withOffset);
}

export function formatDateTime(d: Date, lang: Lang = "es"): string {
  const x = paView(d);
  return `${formatEventDate(d, lang)} · ${String(x.getUTCHours()).padStart(2, "0")}:${String(x.getUTCMinutes()).padStart(2, "0")}`;
}
