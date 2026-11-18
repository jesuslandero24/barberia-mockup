"use client";

import { scheduleSection } from "@/config/content";
import { weekSchedule } from "@/config/schedule";
import { formatRanges } from "@/lib/format";
import { useTodayIndex } from "@/lib/useTodayIndex";

export function ScheduleTable() {
  const today = useTodayIndex();

  return (
    <ul className="divide-y divide-border">
      {weekSchedule.map((day) => {
        const isToday = today === day.dayIndex;
        return (
          <li
            key={day.dayIndex}
            className={`flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
              isToday ? "text-foreground" : "text-muted"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              {day.label}
              {isToday ? (
                <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                  {scheduleSection.todayLabel}
                </span>
              ) : null}
            </span>
            <span className="text-sm tabular-nums">
              {day.ranges.length > 0
                ? formatRanges(day.ranges)
                : scheduleSection.closedLabel}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
