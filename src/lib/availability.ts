import type {
  BlockedSlot,
  Booking,
  DaySchedule,
  Service,
} from "@/lib/types";
import { services } from "@/config/services";
import { slotMinutes, timezone, weekSchedule } from "@/config/schedule";

export type SlotPeriod = "morning" | "afternoon";

export type AvailableSlot = {
  time: string;
  period: SlotPeriod;
};

export type DayRecord = {
  bookings: Booking[];
  blocks: BlockedSlot[];
};

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getBogotaToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getBogotaNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hours = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minutes = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );

  return (hours % 24) * 60 + minutes;
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function getUpcomingDates(count: number, from?: string): string[] {
  const start = from ?? getBogotaToday();
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

export function getWeekdayIndex(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function dateAtNoon(date: string): Date {
  return new Date(`${date}T12:00:00.000Z`);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatDateShort(date: string): {
  weekday: string;
  day: string;
  month: string;
} {
  const value = dateAtNoon(date);
  const weekday = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    weekday: "short",
  })
    .format(value)
    .replace(".", "");
  const day = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    day: "numeric",
  }).format(value);
  const month = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    month: "short",
  })
    .format(value)
    .replace(".", "");

  return {
    weekday: capitalize(weekday),
    day,
    month: capitalize(month),
  };
}

export function formatLongDate(date: string): string {
  const formatted = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dateAtNoon(date));

  return capitalize(formatted.replace(",", ""));
}

export function formatTime12(time: string): string {
  const total = toMinutes(time);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours < 12 ? "a. m." : "p. m.";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatBogotaTimeFromIso(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(iso))
    .replace(/\s?([ap])\.?\s?m\.?/i, (_match, period: string) =>
      period.toLowerCase() === "a" ? " a. m." : " p. m.",
    );
}

export function getScheduleForDate(date: string): DaySchedule | undefined {
  const weekday = getWeekdayIndex(date);
  return weekSchedule.find((day) => day.dayIndex === weekday);
}

function getServiceDuration(serviceId: string): number {
  return (
    services.find((service) => service.id === serviceId)?.durationMin ??
    slotMinutes
  );
}

type OccupiedRange = { start: number; end: number };

function buildOccupiedRanges(
  date: string,
  barberId: string,
  bookings: Booking[],
  blocks: BlockedSlot[],
): OccupiedRange[] {
  const fromBookings = bookings
    .filter(
      (booking) =>
        booking.date === date &&
        booking.barberId === barberId &&
        booking.status === "active",
    )
    .map((booking) => {
      const start = toMinutes(booking.time);
      return { start, end: start + getServiceDuration(booking.serviceId) };
    });

  const fromBlocks = blocks
    .filter((block) => block.date === date && block.barberId === barberId)
    .map((block) => {
      const start = toMinutes(block.time);
      return { start, end: start + slotMinutes };
    });

  return [...fromBookings, ...fromBlocks];
}

function overlaps(
  start: number,
  end: number,
  occupied: OccupiedRange[],
): boolean {
  return occupied.some(
    (range) => start < range.end && range.start < end,
  );
}

export function getFreeMinutes(params: {
  date: string;
  barberId: string;
  bookings: Booking[];
  blocks: BlockedSlot[];
  fromMinutes: number;
}): number {
  const { date, barberId, bookings, blocks, fromMinutes } = params;
  const day = getScheduleForDate(date);

  if (!day || day.ranges.length === 0) return 0;

  const occupied = buildOccupiedRanges(date, barberId, bookings, blocks).sort(
    (a, b) => a.start - b.start,
  );
  let freeMinutes = 0;

  for (const range of day.ranges) {
    const start = Math.max(toMinutes(range.open), fromMinutes);
    const end = toMinutes(range.close);
    if (start >= end) continue;

    let cursor = start;

    for (const interval of occupied) {
      if (interval.end <= cursor || interval.start >= end) continue;
      if (interval.start > cursor) {
        freeMinutes += interval.start - cursor;
      }
      cursor = Math.max(cursor, interval.end);
      if (cursor >= end) break;
    }

    if (cursor < end) freeMinutes += end - cursor;
  }

  return freeMinutes;
}

export function getAvailableSlots(params: {
  date: string;
  barberId: string;
  service: Service;
  bookings: Booking[];
  blocks: BlockedSlot[];
}): AvailableSlot[] {
  const { date, barberId, service, bookings, blocks } = params;
  const day = getScheduleForDate(date);
  const duration = service.durationMin;

  if (!day || day.ranges.length === 0) return [];

  const occupied = buildOccupiedRanges(date, barberId, bookings, blocks);
  const today = getBogotaToday();
  const nowMinutes = getBogotaNowMinutes();
  const slots: AvailableSlot[] = [];

  for (const range of day.ranges) {
    const open = toMinutes(range.open);
    const close = toMinutes(range.close);

    for (let start = open; start + duration <= close; start += slotMinutes) {
      if (date === today && start <= nowMinutes + slotMinutes) continue;
      if (overlaps(start, start + duration, occupied)) continue;

      slots.push({
        time: minutesToTime(start),
        period: start < 12 * 60 ? "morning" : "afternoon",
      });
    }
  }

  return slots;
}

export function splitSlots(slots: AvailableSlot[]): {
  morning: AvailableSlot[];
  afternoon: AvailableSlot[];
} {
  return {
    morning: slots.filter((slot) => slot.period === "morning"),
    afternoon: slots.filter((slot) => slot.period === "afternoon"),
  };
}

export type TimelineStatus = "free" | "booked" | "continuation" | "blocked";

export type TimelineSlot = {
  time: string;
  period: SlotPeriod;
  status: TimelineStatus;
  booking?: Booking;
  block?: BlockedSlot;
};

export function getTimelineSlots(params: {
  date: string;
  barberId: string;
  bookings: Booking[];
  blocks: BlockedSlot[];
}): TimelineSlot[] {
  const { date, barberId, bookings, blocks } = params;
  const day = getScheduleForDate(date);

  if (!day || day.ranges.length === 0) return [];

  const activeBookings = bookings.filter(
    (booking) =>
      booking.date === date &&
      booking.barberId === barberId &&
      booking.status === "active",
  );
  const dayBlocks = blocks.filter(
    (block) => block.date === date && block.barberId === barberId,
  );
  const slots: TimelineSlot[] = [];

  for (const range of day.ranges) {
    const open = toMinutes(range.open);
    const close = toMinutes(range.close);

    for (let start = open; start < close; start += slotMinutes) {
      const time = minutesToTime(start);
      const period = start < 12 * 60 ? "morning" : "afternoon";
      const booking = activeBookings.find((item) => {
        const bookingStart = toMinutes(item.time);
        return (
          start >= bookingStart &&
          start < bookingStart + getServiceDuration(item.serviceId)
        );
      });

      if (booking) {
        slots.push({
          time,
          period,
          status: booking.time === time ? "booked" : "continuation",
          booking,
        });
        continue;
      }

      const block = dayBlocks.find((item) => item.time === time);

      if (block) {
        slots.push({ time, period, status: "blocked", block });
        continue;
      }

      slots.push({ time, period, status: "free" });
    }
  }

  return slots;
}

export function countAvailableSlots(params: {
  date: string;
  barberId: string;
  service: Service;
  record: DayRecord | undefined;
}): number {
  const { date, barberId, service, record } = params;

  if (!record) return 0;

  return getAvailableSlots({
    date,
    barberId,
    service,
    bookings: record.bookings,
    blocks: record.blocks,
  }).length;
}
