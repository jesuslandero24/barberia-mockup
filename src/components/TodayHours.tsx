"use client";

import { hero } from "@/config/content";
import { weekSchedule } from "@/config/schedule";
import { formatRanges, getScheduleForDay } from "@/lib/format";
import { useTodayIndex } from "@/lib/useTodayIndex";

export function TodayHours() {
  const today = useTodayIndex();

  if (today === null) {
    return <span className="text-muted">{hero.todayLabel}</span>;
  }

  const day = getScheduleForDay(weekSchedule, today);

  if (!day || day.ranges.length === 0) {
    return <span className="text-muted">{hero.closedToday}</span>;
  }

  return <span className="text-foreground">{formatRanges(day.ranges)}</span>;
}
