"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { barbers } from "@/config/barbers";
import { services } from "@/config/services";
import { reservation } from "@/config/content";
import { bookingWindowDays } from "@/config/schedule";
import { getBlockedSlots, getBookings } from "@/lib/db";
import type { DayRecord } from "@/lib/availability";
import { getUpcomingDates } from "@/lib/availability";
import { useBogotaToday } from "@/lib/useTodayIndex";
import type { Booking, Client } from "@/lib/types";
import { StepProgress } from "@/components/reservar/StepProgress";
import { ReservationSummary } from "@/components/reservar/ReservationSummary";
import { ServiceStep } from "@/components/reservar/ServiceStep";
import { ScheduleStep } from "@/components/reservar/ScheduleStep";
import { ClientStep } from "@/components/reservar/ClientStep";
import { SuccessScreen } from "@/components/reservar/SuccessScreen";

export function ReservationFlow() {
  const searchParams = useSearchParams();
  const today = useBogotaToday();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [serviceId, setServiceId] = useState<string | null>(() => {
    const value = searchParams.get("servicio");
    return value && services.some((service) => service.id === value)
      ? value
      : null;
  });
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [records, setRecords] = useState<Record<string, DayRecord>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [success, setSuccess] = useState<{
    booking: Booking;
    client: Client;
  } | null>(null);

  const dates = useMemo(
    () => (today ? getUpcomingDates(bookingWindowDays, today) : []),
    [today],
  );

  const service = services.find((item) => item.id === serviceId) ?? null;
  const barber = barbers[0] ?? null;
  const barberId = barber?.id ?? null;

  const loadKey =
    barberId && dates.length > 0
      ? `${barberId}:${dates[0]}:${availabilityVersion}`
      : null;
  const loaded = loadKey !== null && loadedKey === loadKey;

  useEffect(() => {
    if (!barberId || dates.length === 0) return;

    let cancelled = false;
    const targetKey = loadKey;

    Promise.all(
      dates.map(async (day) => {
        const [bookings, blocks] = await Promise.all([
          getBookings({ date: day, barberId }),
          getBlockedSlots({ date: day, barberId }),
        ]);
        return [day, { bookings, blocks }] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      setRecords(Object.fromEntries(entries));
      setLoadedKey(targetKey);
      setAvailabilityError(false);
    }).catch(() => {
      if (cancelled) return;
      setAvailabilityError(true);
      setLoadedKey(targetKey);
    });

    return () => {
      cancelled = true;
    };
  }, [barberId, dates, loadKey]);

  function moveToStep(target: number) {
    setDirection(target < step ? "back" : "forward");
    setStep(target);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function selectService(id: string) {
    if (id === serviceId) return;
    setServiceId(id);
    setDate(null);
    setTime(null);
  }

  function selectDate(next: string) {
    setDate(next);
    setTime(null);
  }

  function goNext() {
    if (step === 1 && !serviceId) return;
    if (step === 2 && (!date || !time)) return;
    if (step < 3) moveToStep(step + 1);
  }

  function resetFlow() {
    setSuccess(null);
    setStep(1);
    setDirection("forward");
    setServiceId(null);
    setDate(null);
    setTime(null);
    setRecords({});
    setLoadedKey(null);
    setAvailabilityVersion((version) => version + 1);
    setAvailabilityError(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function retryAvailability() {
    setLoadedKey(null);
    setAvailabilityVersion((version) => version + 1);
    setAvailabilityError(false);
  }

  const canContinue =
    step === 1
      ? Boolean(serviceId)
      : step === 2
        ? Boolean(date && time)
        : false;

  if (success && service && barber) {
    return (
      <SuccessScreen
        booking={success.booking}
        client={success.client}
        service={service}
        barber={barber}
        onReset={resetFlow}
      />
    );
  }

  return (
    <div className="site-container pb-48 pt-24 lg:pb-16 lg:pt-28">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
          {reservation.eyebrow}
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-[0.92] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {reservation.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {reservation.intro}
        </p>
      </header>

      <div className="mt-8 max-w-3xl">
        <StepProgress current={step} onStepClick={moveToStep} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0">
          <div className="min-h-[380px] rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div
              key={step}
              data-direction={direction}
              className="step-content"
            >
              {step === 1 ? (
                <ServiceStep selectedId={serviceId} onSelect={selectService} />
              ) : null}

              {step === 2 && service && barber ? (
                <ScheduleStep
                  barberId={barber.id}
                  service={service}
                  dates={dates}
                  records={records}
                  loaded={loaded}
                  availabilityError={availabilityError}
                  selectedDate={date}
                  selectedTime={time}
                  onSelectDate={selectDate}
                  onSelectTime={setTime}
                  onRetryAvailability={retryAvailability}
                />
              ) : null}

              {step === 3 && service && barber && date && time ? (
                <ClientStep
                  service={service}
                  barber={barber}
                  date={date}
                  time={time}
                  onConfirmed={(booking, client) =>
                    setSuccess({ booking, client })
                  }
                />
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => moveToStep(step - 1)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 text-[1.0625rem] font-semibold text-foreground transition duration-200 hover:border-accent/60 hover:text-accent"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                {reservation.back}
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="btn-shine inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[1.0625rem] font-semibold text-background hover:bg-[#e2bb72] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {reservation.continue}
                <ArrowRight
                  size={16}
                  className="motion-arrow"
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>
        </div>

        <ReservationSummary service={service} date={date} time={time} />
      </div>
    </div>
  );
}
