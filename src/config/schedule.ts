import type { DaySchedule } from "@/lib/types";

export const timezone = "America/Bogota";
export const slotMinutes = 30;
export const bookingWindowDays = 14;

export const weekSchedule: DaySchedule[] = [
  {
    dayIndex: 1,
    label: "Lunes",
    ranges: [
      { open: "09:00", close: "12:00" },
      { open: "14:00", close: "20:00" },
    ],
  },
  {
    dayIndex: 2,
    label: "Martes",
    ranges: [
      { open: "09:00", close: "12:00" },
      { open: "14:00", close: "20:00" },
    ],
  },
  {
    dayIndex: 3,
    label: "Miércoles",
    ranges: [
      { open: "09:00", close: "12:00" },
      { open: "14:00", close: "20:00" },
    ],
  },
  {
    dayIndex: 4,
    label: "Jueves",
    ranges: [
      { open: "09:00", close: "12:00" },
      { open: "14:00", close: "20:00" },
    ],
  },
  {
    dayIndex: 5,
    label: "Viernes",
    ranges: [
      { open: "09:00", close: "12:00" },
      { open: "14:00", close: "20:00" },
    ],
  },
  {
    dayIndex: 6,
    label: "Sábado",
    ranges: [{ open: "09:00", close: "21:00" }],
  },
  {
    dayIndex: 0,
    label: "Domingo",
    ranges: [{ open: "09:00", close: "19:00" }],
  },
];
