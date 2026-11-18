"use client";

import { useState } from "react";
import { Ban, Lock, MessageCircle, Unlock } from "lucide-react";
import { panel } from "@/config/content";
import { services } from "@/config/services";
import type { Client } from "@/lib/types";
import type { TimelineSlot } from "@/lib/availability";
import { formatTime12 } from "@/lib/availability";
import { fillTemplate, formatPrice, getWhatsAppUrl } from "@/lib/format";

type TimelineProps = {
  slots: TimelineSlot[];
  clients: Record<string, Client>;
  busyId: string | null;
  onCancel: (id: string) => void;
  onBlock: (time: string) => void;
  onUnblock: (id: string) => void;
};

export function Timeline({
  slots,
  clients,
  busyId,
  onCancel,
  onBlock,
  onUnblock,
}: TimelineProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
        {panel.noSchedule}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <ol className="space-y-1.5">
        {slots.map((slot, index) => {
          const showPeriod =
            index === 0 || slots[index - 1].period !== slot.period;

          return (
            <li key={slot.time}>
              {showPeriod ? (
                <div className="flex items-center gap-3 pb-1 pt-3 first:pt-0">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {slot.period === "morning" ? panel.morning : panel.afternoon}
                  </span>
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                </div>
              ) : null}

              <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3">
                <div className="pt-2.5 text-right text-sm font-medium tabular-nums text-muted">
                  {slot.time}
                </div>
                <TimelineRow
                  slot={slot}
                  clients={clients}
                  busyId={busyId}
                  confirmId={confirmId}
                  onConfirmChange={setConfirmId}
                  onCancel={onCancel}
                  onBlock={onBlock}
                  onUnblock={onUnblock}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type TimelineRowProps = {
  slot: TimelineSlot;
  clients: Record<string, Client>;
  busyId: string | null;
  confirmId: string | null;
  onConfirmChange: (id: string | null) => void;
  onCancel: (id: string) => void;
  onBlock: (time: string) => void;
  onUnblock: (id: string) => void;
};

function TimelineRow({
  slot,
  clients,
  busyId,
  confirmId,
  onConfirmChange,
  onCancel,
  onBlock,
  onUnblock,
}: TimelineRowProps) {
  if (slot.status === "booked" && slot.booking) {
    const booking = slot.booking;
    const client = clients[booking.clientId];
    const service = services.find((item) => item.id === booking.serviceId);
    const busy = busyId === booking.id;
    const confirming = confirmId === booking.id;

    return (
      <div className="rounded-xl border border-accent/30 bg-background/40 p-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {client?.name ?? panel.clientFallback}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {service?.name ?? ""}
              {service ? ` · ${formatPrice(service.price)}` : ""}
            </p>
          </div>
          <span className="rounded-lg border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            {formatTime12(booking.time)}
          </span>
        </div>

        {client?.phone ? (
          <p className="mt-1.5 text-sm text-muted">{client.phone}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {client?.phone ? (
            <a
              href={getWhatsAppUrl(`57${client.phone}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-[1rem] font-semibold text-foreground transition duration-200 hover:border-accent/60 hover:text-accent"
            >
              <MessageCircle size={17} aria-hidden="true" />
              {panel.writeWhatsapp}
            </a>
          ) : null}

          {confirming ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
              <span className="text-sm text-muted">{panel.cancelConfirm}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  onConfirmChange(null);
                  onCancel(booking.id);
                }}
                className="inline-flex min-h-12 items-center rounded-lg border border-red-500/40 bg-red-500/10 px-3 text-[1rem] font-semibold text-red-300 transition duration-200 hover:bg-red-500/20 disabled:opacity-40"
              >
                {panel.cancelYes}
              </button>
              <button
                type="button"
                onClick={() => onConfirmChange(null)}
                className="inline-flex min-h-12 items-center rounded-lg border border-border px-3 text-[1rem] font-semibold text-muted transition duration-200 hover:text-foreground"
              >
                {panel.cancelNo}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => onConfirmChange(booking.id)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-[1rem] font-semibold text-foreground transition duration-200 hover:border-red-500/50 hover:text-red-300 disabled:opacity-40"
            >
              <Ban size={17} aria-hidden="true" />
              {panel.cancel}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (slot.status === "continuation" && slot.booking) {
    const service = services.find(
      (item) => item.id === slot.booking?.serviceId,
    );

    return (
      <div className="rounded-xl border border-border/70 bg-background/20 px-3.5 py-2.5 text-sm text-muted">
        {fillTemplate(panel.continuation, {
          servicio: service?.name ?? "",
        })}
      </div>
    );
  }

  if (slot.status === "blocked" && slot.block) {
    const block = slot.block;
    const busy = busyId === block.id;

    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-background/30 px-3.5 py-2.5">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-muted">
          <Lock size={16} aria-hidden="true" />
          {panel.blocked}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => onUnblock(block.id)}
          className="inline-flex min-h-12 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[1rem] font-semibold text-foreground transition duration-200 hover:border-accent/60 hover:text-accent disabled:opacity-40"
        >
          <Unlock size={16} aria-hidden="true" />
          {panel.unblock}
        </button>
      </div>
    );
  }

  const busy = busyId === `block-${slot.time}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-background/20 px-3.5 py-2.5">
      <span className="text-sm font-medium text-muted">{panel.free}</span>
      <button
        type="button"
        disabled={busy}
        onClick={() => onBlock(slot.time)}
        className="inline-flex min-h-12 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[1rem] font-semibold text-foreground transition duration-200 hover:border-accent/60 hover:text-accent disabled:opacity-40"
      >
        <Lock size={16} aria-hidden="true" />
        {panel.block}
      </button>
    </div>
  );
}
