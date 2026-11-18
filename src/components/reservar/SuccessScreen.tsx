"use client";

import Link from "next/link";
import type { Barber, Booking, Client, Service } from "@/lib/types";
import { brand } from "@/config/brand";
import { reservation } from "@/config/content";
import {
  formatBogotaTimeFromIso,
  formatLongDate,
  formatTime12,
  minutesToTime,
  toMinutes,
} from "@/lib/availability";
import { fillTemplate, formatPrice } from "@/lib/format";
import { WhatsAppPreview } from "@/components/reservar/WhatsAppPreview";

type SuccessScreenProps = {
  booking: Booking;
  client: Client;
  service: Service;
  barber: Barber;
  onReset: () => void;
};

export function SuccessScreen({
  booking,
  client,
  service,
  barber,
  onReset,
}: SuccessScreenProps) {
  const reminderTime = formatTime12(
    minutesToTime(Math.max(0, toMinutes(booking.time) - 60)),
  );
  const appointmentTime = formatTime12(booking.time);
  const longDate = formatLongDate(booking.date);

  const clientMessage = fillTemplate(reservation.success.clientMessage, {
    cliente: client.name,
    hora: appointmentTime,
    barbero: barber.name,
    servicio: service.name,
    negocio: brand.name,
  });

  const barberMessage = fillTemplate(reservation.success.barberMessage, {
    cliente: client.name,
    celular: client.phone,
    servicio: service.name,
    dia: longDate,
    hora: appointmentTime,
  });

  const clientTitle = fillTemplate(
    reservation.success.clientWhatsappTitle,
    { cliente: client.name },
  );
  const barberTitle = fillTemplate(
    reservation.success.barberWhatsappTitle,
    { barbero: barber.name },
  );

  const rows = [
    { label: reservation.serviceLabel, value: service.name },
    { label: reservation.dateLabel, value: longDate },
    { label: reservation.timeLabel, value: appointmentTime },
  ];

  return (
    <div className="site-container pb-16 pt-24 lg:pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
          <svg
            viewBox="0 0 24 24"
            className="size-7"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 12.5l4.5 4.5L19 6.5"
              pathLength={1}
              className="success-check-path"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          {reservation.success.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[0.95] text-foreground sm:text-5xl">
          {reservation.success.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
          {reservation.success.intro}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {reservation.success.codeLabel}
          </span>
          <span className="font-display text-3xl font-semibold tracking-[0.12em] text-accent sm:text-4xl">
            {booking.code}
          </span>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted">
                {row.label}
              </dt>
              <dd className="mt-1 text-base font-medium text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">
              {reservation.totalLabel}
            </dt>
            <dd className="mt-1 font-display text-2xl font-semibold text-accent">
              {formatPrice(service.price)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <WhatsAppPreview
          title={clientTitle}
          message={clientMessage}
          time={reminderTime}
          direction="outgoing"
          delay={150}
        />
        <WhatsAppPreview
          title={barberTitle}
          message={barberMessage}
          time={formatBogotaTimeFromIso(booking.createdAt)}
          direction="incoming"
          delay={650}
        />
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        {reservation.success.note}
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="btn-shine inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 text-[1.0625rem] font-semibold text-background hover:bg-[#e2bb72]"
        >
          {reservation.success.another}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-[1.0625rem] font-semibold text-foreground transition duration-200 hover:border-accent/60 hover:text-accent"
        >
          {reservation.success.home}
        </Link>
      </div>
    </div>
  );
}
