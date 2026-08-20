import type { Lang } from "./i18n";

const DAYS = {
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
const MONTHS = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export function formatEventDate(d: Date, lang: Lang = "es"): string {
  const day = DAYS[lang][d.getDay()];
  return `${day} ${d.getDate()} ${MONTHS[lang][d.getMonth()]}`;
}

export function formatLongDate(d: Date, lang: Lang = "es"): string {
  const day = DAYS[lang][d.getDay()];
  const cap = day.charAt(0).toUpperCase() + day.slice(1);
  if (lang === "en") return `${cap}, ${MONTHS.en[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  return `${cap} ${d.getDate()} de ${MONTHS.es[d.getMonth()]}. ${d.getFullYear()}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Formatea una fecha para un <input type="datetime-local"> (YYYY-MM-DDTHH:mm). */
export function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function formatDateTime(d: Date, lang: Lang = "es"): string {
  return `${formatEventDate(d, lang)} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
