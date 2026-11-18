"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { barbers } from "@/config/barbers";
import { panel } from "@/config/content";
import { bookingWindowDays, slotMinutes } from "@/config/schedule";
import { services } from "@/config/services";
import type { BlockedSlot, Booking, Client } from "@/lib/types";
import {
  getFreeMinutes,
  getTimelineSlots,
  getUpcomingDates,
  toMinutes,
} from "@/lib/availability";
import {
  blockSlot,
  cancelBooking,
  DATABASE_CHANGE_EVENT,
  getBlockedSlots,
  getBookings,
  getClient,
  STORAGE_KEY,
  unblockSlot,
} from "@/lib/db";
import {
  useBogotaNowMinutes,
  useBogotaToday,
} from "@/lib/useTodayIndex";
import { DayStrip } from "@/components/panel/DayStrip";
import { DaySummary } from "@/components/panel/DaySummary";
import { Timeline } from "@/components/panel/Timeline";

type DayData = {
  date: string;
  barberId: string;
  bookings: Booking[];
  blocks: BlockedSlot[];
  clients: Record<string, Client>;
};

function getStoredBookings(value: string | null): Booking[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || !("bookings" in parsed)) {
      return [];
    }

    const bookings = parsed.bookings;
    return Array.isArray(bookings)
      ? bookings.filter(
          (booking): booking is Booking =>
            typeof booking === "object" &&
            booking !== null &&
            "id" in booking &&
            typeof booking.id === "string" &&
            "date" in booking &&
            typeof booking.date === "string" &&
            "createdAt" in booking &&
            typeof booking.createdAt === "string" &&
            "status" in booking &&
            (booking.status === "active" || booking.status === "cancelled"),
        )
      : [];
  } catch {
    return [];
  }
}

export function PanelView() {
  const today = useBogotaToday();
  const nowMinutes = useBogotaNowMinutes();
  const dates = useMemo(
    () => (today ? getUpcomingDates(bookingWindowDays, today) : []),
    [today],
  );

  const barber = barbers[0] ?? null;
  const barberId = barber?.id ?? "";
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const activeDate = selectedDate ?? today;
  const [data, setData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    if (!today || !barberId || dates.length === 0 || dateInitialized) return;

    let cancelled = false;

    Promise.all(
      dates.map(async (date) => ({
        date,
        bookings: await getBookings({ date, barberId }),
      })),
    )
      .then((days) => {
        if (cancelled) return;

        const latestBooking = days
          .flatMap((day) => day.bookings)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

        setSelectedDate(latestBooking?.date ?? today);
        setDateInitialized(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedDate(today);
        setDateInitialized(true);
        setError(panel.error);
      });

    return () => {
      cancelled = true;
    };
  }, [barberId, dateInitialized, dates, today]);

  useEffect(() => {
    function handleDatabaseChange(event: Event) {
      const bookingDate =
        event instanceof CustomEvent &&
        typeof event.detail?.bookingDate === "string"
          ? event.detail.bookingDate
          : null;

      if (bookingDate && dates.includes(bookingDate)) {
        setSelectedDate(bookingDate);
        setDateInitialized(true);
      }
      setRefreshVersion((version) => version + 1);
    }

    function handleStorageChange(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;

      const previousIds = new Set(
        getStoredBookings(event.oldValue).map((booking) => booking.id),
      );
      const latestNewBooking = getStoredBookings(event.newValue)
        .filter(
          (booking) =>
            booking.status === "active" &&
            !previousIds.has(booking.id) &&
            dates.includes(booking.date),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

      if (latestNewBooking) {
        setSelectedDate(latestNewBooking.date);
        setDateInitialized(true);
      }
      setRefreshVersion((version) => version + 1);
    }

    window.addEventListener(DATABASE_CHANGE_EVENT, handleDatabaseChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(DATABASE_CHANGE_EVENT, handleDatabaseChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dates]);

  useEffect(() => {
    if (!activeDate || !barberId || !dateInitialized) return;

    let cancelled = false;

    Promise.all([
      getBookings({ date: activeDate, barberId }),
      getBlockedSlots({ date: activeDate, barberId }),
    ])
      .then(async ([bookings, blocks]) => {
        const ids = Array.from(
          new Set(bookings.map((booking) => booking.clientId)),
        );
        const entries = await Promise.all(
          ids.map(async (id) => [id, await getClient(id)] as const),
        );
        const clients: Record<string, Client> = {};

        for (const [id, client] of entries) {
          if (client) clients[id] = client;
        }

        if (cancelled) return;
        setData({
          date: activeDate,
          barberId,
          bookings,
          blocks,
          clients,
        });
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(panel.error);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeDate, barberId, dateInitialized, refreshVersion]);

  const matches =
    data !== null && data.date === activeDate && data.barberId === barberId;
  const viewData = matches ? data : null;
  const timeline =
    activeDate && viewData
      ? getTimelineSlots({
          date: activeDate,
          barberId,
          bookings: viewData.bookings,
          blocks: viewData.blocks,
        })
      : [];
  const isToday = activeDate === today;
  const firstUpcomingSlot = Math.ceil(nowMinutes / slotMinutes) * slotMinutes;
  const visibleTimeline = isToday
    ? timeline.filter(
        (slot) =>
          slot.status !== "free" || toMinutes(slot.time) >= firstUpcomingSlot,
      )
    : timeline;
  const freeMinutes =
    activeDate && viewData
      ? getFreeMinutes({
          date: activeDate,
          barberId,
          bookings: viewData.bookings,
          blocks: viewData.blocks,
          fromMinutes: isToday ? nowMinutes : 0,
        })
      : 0;
  const income =
    viewData?.bookings.reduce((total, booking) => {
      const service = services.find((item) => item.id === booking.serviceId);
      return total + (service?.price ?? 0);
    }, 0) ?? 0;
  const showLoading =
    loading || !dateInitialized || !activeDate || (!matches && !error);

  function handleSelectDate(date: string) {
    setError(null);
    setSelectedDate(date);
    setDateInitialized(true);
  }

  async function handleCancel(bookingId: string) {
    setBusyId(bookingId);
    setError(null);

    try {
      await cancelBooking(bookingId);
      setData((current) =>
        current
          ? {
              ...current,
              bookings: current.bookings.filter((item) => item.id !== bookingId),
            }
          : current,
      );
    } catch {
      setError(panel.error);
    } finally {
      setBusyId(null);
    }
  }

  async function handleBlock(time: string) {
    if (!activeDate) return;

    setBusyId(`block-${time}`);
    setError(null);

    try {
      const block = await blockSlot({ barberId, date: activeDate, time });
      setData((current) => {
        if (!current) return current;
        if (current.blocks.some((item) => item.id === block.id)) return current;
        return { ...current, blocks: [...current.blocks, block] };
      });
    } catch {
      setError(panel.error);
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnblock(blockId: string) {
    setBusyId(blockId);
    setError(null);

    try {
      await unblockSlot(blockId);
      setData((current) =>
        current
          ? {
              ...current,
              blocks: current.blocks.filter((item) => item.id !== blockId),
            }
          : current,
      );
    } catch {
      setError(panel.error);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="site-container pb-16 pt-24 lg:pt-28">
      <header>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
              {panel.eyebrow}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-[0.92] tracking-tight text-foreground sm:text-5xl">
              {panel.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              {panel.intro}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-[1.0625rem] font-semibold text-foreground transition duration-200 hover:border-accent/60 hover:text-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {panel.backHome}
          </Link>
        </div>

        {barber ? (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3 sm:w-fit sm:pr-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 font-display text-xl font-semibold text-accent">
              {barber.name.trim().charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {panel.barberLabel}
              </p>
              <p className="font-display text-2xl font-semibold uppercase leading-none text-foreground">
                {barber.name}
              </p>
              <p className="mt-1 text-sm text-muted">{barber.role}</p>
            </div>
          </div>
        ) : null}
      </header>

      <section className="mt-6 space-y-5">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {panel.dateLabel}
          </p>
          {today ? (
            <DayStrip
              dates={dates}
              selectedDate={activeDate}
              onSelect={handleSelectDate}
            />
          ) : null}
        </div>

        <DaySummary
          bookings={viewData?.bookings.length ?? 0}
          freeHours={freeMinutes / 60}
          income={income}
          loaded={!showLoading && viewData !== null}
        />

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}

        {showLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
            {panel.loading}
          </div>
        ) : error ? null : (
          <>
            {viewData && viewData.bookings.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface p-5 text-center text-base text-muted">
                {panel.emptyDay}
              </p>
            ) : null}
            <Timeline
              slots={visibleTimeline}
              clients={viewData?.clients ?? {}}
              busyId={busyId}
              onCancel={handleCancel}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
            />
          </>
        )}
      </section>
    </div>
  );
}
