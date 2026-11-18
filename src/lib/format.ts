import type { DaySchedule, TimeRange } from "@/lib/types";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatRanges(ranges: TimeRange[]): string {
  return ranges.map((range) => `${range.open} – ${range.close}`).join(" · ");
}

export function getScheduleForDay(
  schedule: DaySchedule[],
  dayIndex: number,
): DaySchedule | undefined {
  return schedule.find((day) => day.dayIndex === dayIndex);
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    return values[key] ?? "";
  });
}
