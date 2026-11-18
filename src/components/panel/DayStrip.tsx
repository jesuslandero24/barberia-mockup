"use client";

import { panel } from "@/config/content";
import { formatDateShort, formatLongDate } from "@/lib/availability";

type DayStripProps = {
  dates: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
};

export function DayStrip({ dates, selectedDate, onSelect }: DayStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {dates.map((date, index) => {
        const parts = formatDateShort(date);
        const selected = selectedDate === date;

        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            aria-pressed={selected}
            aria-label={formatLongDate(date)}
            className={`flex min-w-[72px] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition duration-200 ${
              selected
                ? "border-accent bg-accent text-background"
                : "border-border bg-background/40 text-foreground hover:border-accent/50"
            }`}
          >
            <span
              className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                selected ? "text-background/70" : "text-muted"
              }`}
            >
              {index === 0 ? panel.todayShort : parts.weekday}
            </span>
            <span className="font-display text-2xl font-semibold leading-tight">
              {parts.day}
            </span>
            <span
              className={`text-xs font-medium uppercase tracking-[0.1em] ${
                selected ? "text-background/70" : "text-muted"
              }`}
            >
              {parts.month}
            </span>
          </button>
        );
      })}
    </div>
  );
}
