"use client";

import { useSyncExternalStore } from "react";
import { timezone } from "@/config/schedule";
import { getBogotaNowMinutes } from "@/lib/availability";

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function subscribe() {
  return () => {};
}

function subscribeToClock(onChange: () => void): () => void {
  const interval = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(interval);
}

function getTodayIndex(): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(new Date());
  return weekdayIndex[weekday] ?? new Date().getDay();
}

function getTodayDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function useTodayIndex(): number | null {
  return useSyncExternalStore(subscribe, getTodayIndex, () => null);
}

export function useBogotaToday(): string | null {
  return useSyncExternalStore(subscribe, getTodayDate, () => null);
}

export function useBogotaNowMinutes(): number {
  return useSyncExternalStore(
    subscribeToClock,
    getBogotaNowMinutes,
    () => 0,
  );
}
