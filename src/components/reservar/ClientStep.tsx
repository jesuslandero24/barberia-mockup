"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Phone, Search, UserRound } from "lucide-react";
import type { Barber, Booking, Client, Service } from "@/lib/types";
import { reservation } from "@/config/content";
import {
  ClientConflictError,
  createBooking,
  createClient,
  findClient,
} from "@/lib/db";
import {
  isValidEmail,
  isValidPhone,
  looksLikeEmail,
  normalizePhone,
} from "@/lib/validation";

type ClientStepProps = {
  service: Service;
  barber: Barber;
  date: string;
  time: string;
  onConfirmed: (booking: Booking, client: Client) => void;
};

type Lookup =
  | { status: "idle" }
  | { status: "found"; client: Client }
  | { status: "new" };

type FormErrors = {
  identifier?: string;
  name?: string;
  phone?: string;
  email?: string;
};

const inputClass =
  "min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass =
  "text-xs font-semibold uppercase tracking-[0.16em] text-muted";

export function ClientStep({
  service,
  barber,
  date,
  time,
  onConfirmed,
}: ClientStepProps) {
  const [identifier, setIdentifier] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<"idle" | "searching" | "saving">("idle");

  const busy = status !== "idle";

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const value = identifier.trim();

    if (!value) {
      setErrors({ identifier: reservation.errors.identifier });
      return;
    }

    if (looksLikeEmail(value)) {
      if (!isValidEmail(value)) {
        setErrors({ identifier: reservation.errors.email });
        return;
      }
    } else if (!isValidPhone(value)) {
      setErrors({ identifier: reservation.errors.phone });
      return;
    }

    setErrors({});
    setStatus("searching");

    try {
      const client = await findClient(value);

      if (client) {
        setLookup({ status: "found", client });
      } else {
        setLookup({ status: "new" });
        setForm({
          name: "",
          phone: looksLikeEmail(value) ? "" : normalizePhone(value),
          email: looksLikeEmail(value) ? value.trim().toLowerCase() : "",
        });
      }
    } finally {
      setStatus("idle");
    }
  }

  async function handleConfirmExisting() {
    if (lookup.status !== "found") return;

    setSubmitError("");
    setStatus("saving");

    try {
      const booking = await createBooking({
        clientId: lookup.client.id,
        barberId: barber.id,
        serviceId: service.id,
        date,
        time,
      });
      onConfirmed(booking, lookup.client);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : reservation.errors.generic,
      );
      setStatus("idle");
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const nextErrors: FormErrors = {};

    if (form.name.trim().length < 3) {
      nextErrors.name = reservation.errors.name;
    }
    if (!isValidPhone(form.phone)) {
      nextErrors.phone = reservation.errors.phone;
    }
    if (!isValidEmail(form.email)) {
      nextErrors.email = reservation.errors.email;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("saving");

    try {
      const client = await createClient({
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
        email: form.email.trim().toLowerCase(),
      });
      const booking = await createBooking({
        clientId: client.id,
        barberId: barber.id,
        serviceId: service.id,
        date,
        time,
      });
      onConfirmed(booking, client);
    } catch (error) {
      if (error instanceof ClientConflictError) {
        setErrors(
          error.field === "both"
            ? {
                phone: reservation.errors.contactsTaken,
                email: reservation.errors.contactsTaken,
              }
            : {
                [error.field]:
                  error.field === "phone"
                    ? reservation.errors.phoneTaken
                    : reservation.errors.emailTaken,
              },
        );
        setStatus("idle");
        return;
      }

      setSubmitError(
        error instanceof Error ? error.message : reservation.errors.generic,
      );
      setStatus("idle");
    }
  }

  function resetLookup() {
    setLookup({ status: "idle" });
    setIdentifier("");
    setErrors({});
    setSubmitError("");
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-semibold uppercase leading-none text-foreground">
        {reservation.detailsTitle}
      </h2>
      <p className="mt-2 text-sm text-muted">{reservation.detailsIntro}</p>

      <form onSubmit={handleSearch} noValidate className="mt-6">
        <label htmlFor="identifier" className={labelClass}>
          {reservation.identifierLabel}
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="identifier"
            name="identifier"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setErrors({});
              setSubmitError("");
              if (lookup.status !== "idle") setLookup({ status: "idle" });
            }}
            placeholder={reservation.identifierPlaceholder}
            autoComplete="username"
            aria-invalid={Boolean(errors.identifier)}
            className={`${inputClass} ${
              errors.identifier ? "border-red-500/60" : ""
            }`}
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-shine inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[1.0625rem] font-semibold text-background hover:bg-[#e2bb72] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={16} aria-hidden="true" />
            {status === "searching" ? reservation.searching : reservation.search}
          </button>
        </div>
        {errors.identifier ? (
          <p role="alert" className="mt-2 text-sm text-red-400">
            {errors.identifier}
          </p>
        ) : null}
      </form>

      {lookup.status === "found" ? (
        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <p className="font-display text-2xl font-semibold uppercase leading-none text-foreground">
            {reservation.welcomeBack}, {lookup.client.name}
          </p>
          <p className="mt-2 text-sm text-muted">
            {reservation.welcomeBackHint}
          </p>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-accent" aria-hidden="true" />
              <dt className="sr-only">{reservation.phoneLabel}</dt>
              <dd className="text-foreground">{lookup.client.phone}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleConfirmExisting}
            disabled={busy}
            className="btn-shine mt-5 min-h-12 w-full rounded-xl bg-accent px-6 text-[1.0625rem] font-semibold text-background hover:bg-[#e2bb72] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "saving" ? reservation.confirming : reservation.confirm}
          </button>
          <button
            type="button"
            onClick={resetLookup}
            disabled={busy}
            className="mt-3 w-full text-center text-sm text-muted underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
          >
            {reservation.notMe}
          </button>
        </div>
      ) : null}

      {lookup.status === "new" ? (
        <form
          onSubmit={handleRegister}
          noValidate
          className="mt-6 rounded-2xl border border-border bg-surface p-5"
        >
          <h3 className="flex items-center gap-2 font-display text-2xl font-semibold uppercase leading-none text-foreground">
            <UserRound size={18} className="text-accent" aria-hidden="true" />
            {reservation.registerTitle}
          </h3>
          <p className="mt-2 text-sm text-muted">{reservation.registerIntro}</p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                {reservation.nameLabel}
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder={reservation.namePlaceholder}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                className={`mt-2 ${inputClass} ${
                  errors.name ? "border-red-500/60" : ""
                }`}
              />
              {errors.name ? (
                <p role="alert" className="mt-1.5 text-sm text-red-400">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                {reservation.phoneLabel}
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder={reservation.phonePlaceholder}
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                className={`mt-2 ${inputClass} ${
                  errors.phone ? "border-red-500/60" : ""
                }`}
              />
              {errors.phone ? (
                <p role="alert" className="mt-1.5 text-sm text-red-400">
                  {errors.phone}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                {reservation.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder={reservation.emailPlaceholder}
                inputMode="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                className={`mt-2 ${inputClass} ${
                  errors.email ? "border-red-500/60" : ""
                }`}
              />
              {errors.email ? (
                <p role="alert" className="mt-1.5 text-sm text-red-400">
                  {errors.email}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn-shine mt-5 min-h-12 w-full rounded-xl bg-accent px-6 text-[1.0625rem] font-semibold text-background hover:bg-[#e2bb72] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "saving" ? reservation.confirming : reservation.register}
          </button>
        </form>
      ) : null}

      {submitError ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {submitError}
        </p>
      ) : null}
    </div>
  );
}
