"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  CheckCheck,
  MoreVertical,
  Phone,
  Send,
  Video,
} from "lucide-react";
import { brand } from "@/config/brand";
import { barbers } from "@/config/barbers";
import { bot } from "@/config/content";
import { services } from "@/config/services";
import type { BlockedSlot, Booking, Client } from "@/lib/types";
import {
  formatLongDate,
  formatTime12,
  getAvailableSlots,
  getBogotaNowMinutes,
  getBogotaToday,
  getUpcomingDates,
  toMinutes,
} from "@/lib/availability";
import { useBogotaToday } from "@/lib/useTodayIndex";
import {
  ClientConflictError,
  cancelBooking,
  createBooking,
  createClient,
  findClient,
  findClientsByName,
  getBlockedSlots,
  getBookings,
  getClientBookings,
} from "@/lib/db";
import { fillTemplate, formatPrice } from "@/lib/format";
import {
  isValidEmail,
  isValidPhone,
  looksLikeEmail,
  normalizePhone,
} from "@/lib/validation";

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
  time: string;
};

type Draft = {
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
};

type Step =
  | { name: "menu" }
  | { name: "service" }
  | { name: "date"; serviceId: string }
  | { name: "time"; draft: Draft; slots: string[] }
  | { name: "name"; draft: Draft }
  | {
      name: "lookupClient";
      draft: Draft;
      nameValue: string;
      clients: Client[];
    }
  | {
      name: "contact";
      draft: Draft;
      clientId?: string;
      verifiedField?: "phone" | "email";
      profile: { name: string; phone: string; email: string };
    }
  | { name: "lookupNext" }
  | { name: "lookupCancel" }
  | { name: "cancelList"; bookings: Booking[] };

const greetingPattern =
  /\b(hola|buenas|buen día|buen dia|buenos días|buenos dias|buenas tardes|buenas noches|saludos)\b/i;

function nowTime(): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

function parseOption(text: string, max: number): number | null {
  const match = text.trim().match(/^(\d+)[.)]?$/);

  if (!match) return null;

  const value = Number(match[1]);

  if (!Number.isInteger(value) || value < 1 || value > max) return null;

  return value;
}

function getService(id: string) {
  return services.find((service) => service.id === id);
}

function getBarber(id: string) {
  return barbers.find((barber) => barber.id === id);
}

function serviceList(): string {
  return services
    .map((service, index) =>
      fillTemplate(bot.serviceLine, {
        numero: String(index + 1),
        servicio: service.name,
        duracion: String(service.durationMin),
        precio: formatPrice(service.price),
      }),
    )
    .join("\n");
}

function servicePrompt(): string {
  return fillTemplate(bot.serviceTitle, { lista: serviceList() });
}

function datePrompt(dates: string[]): string {
  const lista = dates
    .map((date, index) =>
      fillTemplate(index === 0 ? bot.dateLineToday : bot.dateLine, {
        numero: String(index + 1),
        dia: formatLongDate(date),
      }),
    )
    .join("\n");

  return fillTemplate(bot.dateTitle, { lista });
}

function timePrompt(slots: string[]): string {
  const lista = slots
    .map((time, index) =>
      fillTemplate(bot.timeLine, {
        numero: String(index + 1),
        hora: formatTime12(time),
      }),
    )
    .join("\n");

  return fillTemplate(bot.timeTitle, { lista });
}

function summaryMessage(draft: Draft): string {
  const service = getService(draft.serviceId);
  const barber = getBarber(draft.barberId);

  return [
    bot.summaryTitle,
    fillTemplate(bot.summaryLine, {
      servicio: service?.name ?? "",
      barbero: barber?.name ?? "",
      dia: formatLongDate(draft.date),
      hora: formatTime12(draft.time),
    }),
    fillTemplate(bot.summaryPrice, {
      precio: service ? formatPrice(service.price) : "",
    }),
  ].join("\n");
}

function bookingLine(booking: Booking): string {
  const service = getService(booking.serviceId);
  const barber = getBarber(booking.barberId);

  return fillTemplate(bot.nextLine, {
    servicio: service?.name ?? "",
    barbero: barber?.name ?? "",
    dia: formatLongDate(booking.date),
    hora: formatTime12(booking.time),
  });
}

function cancelPrompt(bookings: Booking[]): string {
  const lista = bookings
    .map((booking, index) =>
      fillTemplate(bot.cancelLine, {
        numero: String(index + 1),
        servicio: getService(booking.serviceId)?.name ?? "",
        barbero: getBarber(booking.barberId)?.name ?? "",
        dia: formatLongDate(booking.date),
        hora: formatTime12(booking.time),
      }),
    )
    .join("\n");

  return fillTemplate(bot.cancelListTitle, { lista });
}

function upcomingBookings(bookings: Booking[]): Booking[] {
  const today = getBogotaToday();
  const now = getBogotaNowMinutes();

  return bookings.filter(
    (booking) =>
      booking.date > today ||
      (booking.date === today && toMinutes(booking.time) >= now),
  );
}

export function BotSimulator() {
  const today = useBogotaToday();
  const dates = useMemo(
    () => (today ? getUpcomingDates(7, today) : []),
    [today],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [working, setWorking] = useState(false);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>({ name: "menu" });

  const idRef = useRef(0);
  const busyRef = useRef(false);
  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const busy = typing || working || pending.length > 0;
  const initial = brand.name.trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setPending([
      fillTemplate(bot.welcome, { negocio: brand.name }),
      bot.menu,
    ]);
  }, []);

  useEffect(() => {
    if (pending.length === 0) return;

    const typingTimer = window.setTimeout(() => setTyping(true), 0);
    const timer = window.setTimeout(() => {
      const [next, ...rest] = pending;
      setTyping(false);
      setPending(rest);
      setMessages((current) => [
        ...current,
        {
          id: idRef.current++,
          from: "bot",
          text: next,
          time: nowTime(),
        },
      ]);
    }, 700);

    return () => {
      window.clearTimeout(typingTimer);
      window.clearTimeout(timer);
    };
  }, [pending]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, typing, working]);

  function reply(texts: string[]) {
    setPending((current) => [...current, ...texts]);
  }

  function contactPrompt(phone: string): string {
    return phone ? bot.askEmail : bot.askPhone;
  }

  async function saveProfileAndBook(
    profile: { name: string; phone: string; email: string },
    draft: Draft,
    clientId?: string,
    verifiedField?: "phone" | "email",
  ) {
    try {
      const client = await createClient(profile);
      await finalizeBooking(client, draft);
    } catch (error) {
      if (error instanceof ClientConflictError) {
        const nextProfile = {
          ...profile,
          phone:
            error.field === "phone" ||
            (error.field === "both" && verifiedField !== "phone")
              ? ""
              : profile.phone,
          email:
            error.field === "email" ||
            (error.field === "both" && verifiedField !== "email")
              ? ""
              : profile.email,
        };
        setStep({
          name: "contact",
          draft,
          clientId,
          verifiedField,
          profile: nextProfile,
        });
        const message =
          error.field === "both"
            ? bot.duplicateContacts
            : error.field === "phone"
              ? bot.duplicatePhone
              : bot.duplicateEmail;
        reply([message, contactPrompt(nextProfile.phone)]);
        return;
      }

      setStep({ name: "menu" });
      reply([bot.bookingError, bot.menu]);
    }
  }

  async function finalizeBooking(client: Client, draft: Draft) {
    try {
      const booking = await createBooking({
        clientId: client.id,
        barberId: draft.barberId,
        serviceId: draft.serviceId,
        date: draft.date,
        time: draft.time,
      });

      setStep({ name: "menu" });
      reply([
        summaryMessage(draft),
        fillTemplate(bot.confirmed, { codigo: booking.code }),
        bot.menu,
      ]);
    } catch {
      setStep({ name: "menu" });
      reply([bot.bookingError, bot.menu]);
    }
  }

  async function handleUserText(raw: string) {
    const text = raw.trim();
    setWorking(true);

    try {
      if (greetingPattern.test(text)) {
        setStep({ name: "menu" });
        reply([bot.greeting, bot.menu]);
        return;
      }

      switch (step.name) {
        case "menu": {
          const option = parseOption(text, 4);

          if (option === 1) {
            setStep({ name: "service" });
            reply([servicePrompt()]);
          } else if (option === 2) {
            const lista = services
              .map((service) =>
                fillTemplate(bot.priceLine, {
                  servicio: service.name,
                  duracion: String(service.durationMin),
                  precio: formatPrice(service.price),
                }),
              )
              .join("\n");
            reply([`${bot.pricesTitle}\n${lista}`, bot.menu]);
          } else if (option === 3) {
            setStep({ name: "lookupNext" });
            reply([bot.askIdentifierNext]);
          } else if (option === 4) {
            setStep({ name: "lookupCancel" });
            reply([bot.askIdentifierCancel]);
          } else {
            reply([bot.unknown, bot.menu]);
          }
          return;
        }

        case "service": {
          const option = parseOption(text, services.length);
          const service = option ? services[option - 1] : null;

          if (!service) {
            reply([bot.unknown, servicePrompt()]);
            return;
          }

          setStep({ name: "date", serviceId: service.id });
          reply([datePrompt(dates)]);
          return;
        }

        case "date": {
          const option = parseOption(text, dates.length);
          const date = option ? dates[option - 1] : null;
          const service = getService(step.serviceId);
          const barber = barbers[0];

          if (!date || !service || !barber) {
            reply([bot.unknown, datePrompt(dates)]);
            return;
          }

          let bookings: Booking[];
          let blocks: BlockedSlot[];
          try {
            [bookings, blocks] = await Promise.all([
              getBookings({ date, barberId: barber.id }),
              getBlockedSlots({ date, barberId: barber.id }),
            ]);
          } catch {
            reply([bot.availabilityError, datePrompt(dates)]);
            return;
          }

          const slots = getAvailableSlots({
            date,
            barberId: barber.id,
            service,
            bookings,
            blocks,
          }).map((slot) => slot.time);

          if (slots.length === 0) {
            reply([bot.noTimes, datePrompt(dates)]);
            return;
          }

          setStep({
            name: "time",
            draft: {
              serviceId: step.serviceId,
              barberId: barber.id,
              date,
              time: "",
            },
            slots,
          });
          reply([timePrompt(slots)]);
          return;
        }

        case "time": {
          const option = parseOption(text, step.slots.length);
          const time = option ? step.slots[option - 1] : null;

          if (!time) {
            reply([bot.unknown, timePrompt(step.slots)]);
            return;
          }

          setStep({
            name: "name",
            draft: { ...step.draft, time },
          });
          reply([bot.askName]);
          return;
        }

        case "name": {
          if (text.length < 3) {
            reply([bot.invalidName, bot.askName]);
            return;
          }

          const matches = await findClientsByName(text);

          if (matches.length > 0) {
            setStep({
              name: "lookupClient",
              draft: step.draft,
              nameValue: text,
              clients: matches,
            });
            reply([
              matches.length === 1
                ? bot.askMatchingClientIdentifier
                : bot.askMultipleClientIdentifiers,
            ]);
            return;
          }

          const profile = { name: text, phone: "", email: "" };
          setStep({ name: "contact", draft: step.draft, profile });
          reply([bot.askPhone]);
          return;
        }

        case "lookupClient": {
          const valid = looksLikeEmail(text)
            ? isValidEmail(text)
            : isValidPhone(text);
          if (!valid) {
            reply([bot.invalidIdentifier, bot.askMatchingClientIdentifier]);
            return;
          }

          const client = await findClient(text);
          const verifiedField = looksLikeEmail(text) ? "email" : "phone";

          if (client && !step.clients.some((item) => item.id === client.id)) {
            reply([
              verifiedField === "phone"
                ? bot.duplicatePhone
                : bot.duplicateEmail,
              step.clients.length === 1
                ? bot.askMatchingClientIdentifier
                : bot.askMultipleClientIdentifiers,
            ]);
            return;
          }

          if (!client) {
            const profile = {
              name: step.nameValue,
              phone: verifiedField === "phone" ? normalizePhone(text) : "",
              email: verifiedField === "email" ? text.trim().toLowerCase() : "",
            };
            setStep({ name: "contact", draft: step.draft, profile });
            reply([contactPrompt(profile.phone)]);
            return;
          }

          if (!client.phone || !client.email) {
            const profile = {
              name: client.name,
              phone: client.phone,
              email: client.email,
            };
            setStep({
              name: "contact",
              draft: step.draft,
              clientId: client.id,
              verifiedField,
              profile,
            });
            reply([contactPrompt(profile.phone)]);
            return;
          }

          await finalizeBooking(client, step.draft);
          return;
        }

        case "contact": {
          let profile = step.profile;

          if (!profile.phone) {
            if (!isValidPhone(text)) {
              reply([bot.invalidPhone, bot.askPhone]);
              return;
            }
            profile = { ...profile, phone: normalizePhone(text) };
          } else if (!profile.email) {
            if (!isValidEmail(text)) {
              reply([bot.invalidEmail, bot.askEmail]);
              return;
            }
            profile = { ...profile, email: text.trim().toLowerCase() };
          }

          if (!profile.phone || !profile.email) {
            setStep({ ...step, profile });
            reply([contactPrompt(profile.phone)]);
            return;
          }

          await saveProfileAndBook(
            profile,
            step.draft,
            step.clientId,
            step.verifiedField,
          );
          return;
        }

        case "lookupNext": {
          const valid = looksLikeEmail(text)
            ? isValidEmail(text)
            : isValidPhone(text);

          if (!valid) {
            reply([bot.invalidIdentifier, bot.askIdentifierNext]);
            return;
          }

          const client = await findClient(text);

          if (!client) {
            setStep({ name: "menu" });
            reply([bot.clientNotFound, bot.menu]);
            return;
          }

          const next = upcomingBookings(await getClientBookings(client.id))[0];

          if (!next) {
            setStep({ name: "menu" });
            reply([bot.noUpcoming, bot.menu]);
            return;
          }

          setStep({ name: "menu" });
          reply([bot.nextTitle, bookingLine(next), bot.menu]);
          return;
        }

        case "lookupCancel": {
          const valid = looksLikeEmail(text)
            ? isValidEmail(text)
            : isValidPhone(text);

          if (!valid) {
            reply([bot.invalidIdentifier, bot.askIdentifierCancel]);
            return;
          }

          const client = await findClient(text);

          if (!client) {
            setStep({ name: "menu" });
            reply([bot.clientNotFound, bot.menu]);
            return;
          }

          const bookings = upcomingBookings(
            await getClientBookings(client.id),
          );

          if (bookings.length === 0) {
            setStep({ name: "menu" });
            reply([bot.noBookings, bot.menu]);
            return;
          }

          setStep({ name: "cancelList", bookings });
          reply([cancelPrompt(bookings)]);
          return;
        }

        case "cancelList": {
          const option = parseOption(text, step.bookings.length);
          const booking = option ? step.bookings[option - 1] : null;

          if (!booking) {
            reply([bot.unknown, cancelPrompt(step.bookings)]);
            return;
          }

          await cancelBooking(booking.id);
          setStep({ name: "menu" });
          reply([
            fillTemplate(bot.cancelled, {
              servicio: getService(booking.serviceId)?.name ?? "",
              dia: formatLongDate(booking.date),
              hora: formatTime12(booking.time),
            }),
            bot.menu,
          ]);
          return;
        }
      }
    } finally {
      setWorking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();

    if (!text || busy || busyRef.current) return;

    busyRef.current = true;
    setInput("");
    setMessages((current) => [
      ...current,
      {
        id: idRef.current++,
        from: "user",
        text,
        time: nowTime(),
      },
    ]);

    void handleUserText(text).finally(() => {
      busyRef.current = false;
    });
  }

  return (
    <div className="mx-auto w-full max-w-[380px] rounded-[2.5rem] border border-border bg-[#0b141a] p-2 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.95)]">
      <div className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10">
        <div className="flex items-center gap-2.5 bg-[#1f2c34] px-3 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#2a3942] font-display text-sm font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {brand.name}
            </p>
            <p className="text-xs text-white/60">
              {busy ? bot.typing : bot.online}
            </p>
          </div>
          <Phone size={14} className="text-white/70" aria-hidden="true" />
          <Video size={14} className="text-white/70" aria-hidden="true" />
          <MoreVertical
            size={14}
            className="text-white/70"
            aria-hidden="true"
          />
        </div>

        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          className="h-[460px] space-y-2 overflow-y-auto bg-[#0b141a] bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.04),transparent_45%),radial-gradient(circle_at_78%_82%,rgba(255,255,255,0.03),transparent_42%)] px-3 py-4 sm:h-[520px]"
        >
          {messages.map((message) => {
            const outgoing = message.from === "user";

            return (
              <div
                key={message.id}
                className={`flex ${outgoing ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] px-3 py-2 text-[15px] leading-snug text-white/95 shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${
                    outgoing
                      ? "rounded-lg rounded-tr-none bg-[#005c4b]"
                      : "rounded-lg rounded-tl-none bg-[#202c33]"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-xs text-white/60">
                    {message.time}
                    {outgoing ? (
                      <CheckCheck
                        size={13}
                        className="text-[#53bdeb]"
                        aria-hidden="true"
                      />
                    ) : null}
                  </p>
                </div>
              </div>
            );
          })}

          {typing || working ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2.5">
                <span className="sr-only">{bot.typing}</span>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    style={{ animationDelay: `${delay}ms` }}
                    className="size-1.5 animate-bounce rounded-full bg-white/60"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-white/10 bg-[#1f2c34] px-2 py-2"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={bot.inputPlaceholder}
            aria-label={bot.inputPlaceholder}
            className="min-h-12 min-w-0 flex-1 rounded-full border border-transparent bg-[#2a3942] px-4 text-base text-white placeholder:text-white/50 focus:border-[#00a884] focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            aria-label={bot.send}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-[#00a884] text-white transition duration-200 hover:bg-[#06cf9c] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
