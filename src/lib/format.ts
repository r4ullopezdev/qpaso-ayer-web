const DAYS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];
const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function formatEventDate(d: Date): string {
  const day = DAYS[d.getDay()];
  return `${day} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatLongDate(d: Date): string {
  const day = DAYS[d.getDay()];
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} ${d.getDate()} de ${
    MONTHS[d.getMonth()]
  }. ${d.getFullYear()}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Formatea una fecha para un <input type="datetime-local"> (YYYY-MM-DDTHH:mm). */
export function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
}

export function formatDateTime(d: Date): string {
  return `${formatEventDate(d)} · ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}
