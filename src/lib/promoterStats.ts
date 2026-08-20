// Comisiones del promotor
export const COMMISSION = {
  FREE: 1, // $1 por persona que entra GRATIS
  PAID: 2, // $2 por entrada de PAGO
  TABLE_GIRLS: 0, // mesas no comisionan
} as const;

export interface SignupLite {
  entryType: string;
  guests: number;
  checkedIn: boolean;
  checkedInAt: Date | null;
  createdAt: Date;
}

export interface PromoterTotals {
  signups: number;
  entered: number; // personas que entraron
  freeEntered: number;
  paidEntered: number;
  tableEntered: number;
  earnings: number; // USD
}

function personCount(s: SignupLite): number {
  return s.entryType === "TABLE_GIRLS" ? s.guests : 1;
}

export function totals(list: SignupLite[]): PromoterTotals {
  let entered = 0,
    freeEntered = 0,
    paidEntered = 0,
    tableEntered = 0,
    earnings = 0;
  for (const s of list) {
    if (!s.checkedIn) continue;
    const p = personCount(s);
    entered += p;
    if (s.entryType === "FREE") {
      freeEntered += p;
      earnings += COMMISSION.FREE * p;
    } else if (s.entryType === "PAID") {
      paidEntered += p;
      earnings += COMMISSION.PAID * p;
    } else if (s.entryType === "TABLE_GIRLS") {
      tableEntered += p;
      earnings += COMMISSION.TABLE_GIRLS * p;
    }
  }
  return { signups: list.length, entered, freeEntered, paidEntered, tableEntered, earnings };
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface DayRow {
  day: string;
  entered: number;
  earnings: number;
}

/** Entradas y ganancias por día (según hora de check-in). */
export function byDay(list: SignupLite[]): DayRow[] {
  const map = new Map<string, DayRow>();
  for (const s of list) {
    if (!s.checkedIn || !s.checkedInAt) continue;
    const key = dayKey(new Date(s.checkedInAt));
    const row = map.get(key) ?? { day: key, entered: 0, earnings: 0 };
    const p = personCount(s);
    row.entered += p;
    row.earnings +=
      (s.entryType === "FREE" ? COMMISSION.FREE : s.entryType === "PAID" ? COMMISSION.PAID : COMMISSION.TABLE_GIRLS) * p;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
}

/** Distribución por hora (0-23) del total de entradas — para ver horas pico. */
export function byHour(list: SignupLite[]): number[] {
  const hours = new Array(24).fill(0);
  for (const s of list) {
    if (!s.checkedIn || !s.checkedInAt) continue;
    hours[new Date(s.checkedInAt).getHours()] += personCount(s);
  }
  return hours;
}
