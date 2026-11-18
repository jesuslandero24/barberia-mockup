"use client";

import type { Service } from "@/lib/types";
import { reservation } from "@/config/content";
import type { DayRecord } from "@/lib/availability";
import {
  countAvailableSlots,
  formatDateShort,
  formatLongDate,
  formatTime12,
  getAvailableSlots,
  splitSlots,
} from "@/lib/availability";

type ScheduleStepProps = {
  barberId: string;
  service: Service;
  dates: string[];
  records: Record<string, DayRecord>;
  loaded: boolean;
  availabilityError: boolean;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onRetryAvailability: () => void;
};

export function ScheduleStep({
  barberId,
  service,
  dates,
  records,
  loaded,
  availabilityError,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onRetryAvailability,
}: ScheduleStepProps) {
  const counts = dates.map((date) =>
    countAvailableSlots({
      date,
      barberId,
      service,
      record: records[date],
    }),
  );
  const totalAvailable = counts.reduce((total, count) => total + count, 0);

  const record = selectedDate ? records[selectedDate] : undefined;
  const slots =
    selectedDate && record
      ? getAvailableSlots({
          date: selectedDate,
          barberId,
          service,
          bookings: record.bookings,
          blocks: record.blocks,
        })
      : [];
  const { morning, afternoon } = splitSlots(slots);

  return (
    <div>
      <h2 className="font-display text-3xl font-semibold uppercase leading-none text-foreground">
        {reservation.scheduleTitle}
      </h2>
      <p className="mt-2 text-sm text-muted">{reservation.scheduleIntro}</p>

      {availabilityError ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-foreground"
        >
          <p>{reservation.availabilityError}</p>
          <button
            type="button"
            onClick={onRetryAvailability}
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-base font-semibold transition-colors hover:border-accent/60 hover:text-accent"
          >
            {reservation.retryAvailability}
          </button>
        </div>
      ) : !loaded ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          {reservation.loadingAvailability}
        </div>
      ) : totalAvailable === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          {reservation.noSlotsLeft}
        </div>
      ) : (
        <>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {dates.map((date, index) => {
              const parts = formatDateShort(date);
              const disabled = counts[index] === 0;
              const selected = selectedDate === date;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => onSelectDate(date)}
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={formatLongDate(date)}
                  className={`flex min-w-[74px] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition duration-200 ${
                    selected
                      ? "border-accent bg-accent text-background"
                      : disabled
                        ? "cursor-not-allowed border-border bg-surface/50 text-muted opacity-40"
                        : "border-border bg-surface text-foreground hover:border-accent/50"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    {index === 0 ? reservation.todayShort : parts.weekday}
                  </span>
                  <span className="font-display text-2xl font-semibold leading-tight">
                    {parts.day}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.1em]">
                    {parts.month}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            {!selectedDate ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
                {reservation.pickDate}
              </p>
            ) : slots.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
                {reservation.noSlots}
              </p>
            ) : (
              <div className="space-y-6">
                {[
                  { key: "morning", label: reservation.morning, items: morning },
                  {
                    key: "afternoon",
                    label: reservation.afternoon,
                    items: afternoon,
                  },
                ].map((group) =>
                  group.items.length === 0 ? null : (
                    <div key={group.key}>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        {group.label}
                      </h3>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {group.items.map((slot) => {
                          const selected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => onSelectTime(slot.time)}
                              aria-pressed={selected}
                              className={`time-slot min-h-12 rounded-lg border px-2 text-[1rem] font-medium ${
                                selected
                                  ? "border-accent bg-accent text-background"
                                  : "border-border bg-surface text-foreground hover:border-accent/60 hover:bg-accent/10 hover:text-accent"
                              }`}
                            >
                              {formatTime12(slot.time)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
