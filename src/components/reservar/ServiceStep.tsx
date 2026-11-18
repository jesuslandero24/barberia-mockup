"use client";

import { Check, Clock } from "lucide-react";
import { services } from "@/config/services";
import { reservation, servicesSection } from "@/config/content";
import { formatPrice } from "@/lib/format";

type ServiceStepProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ServiceStep({ selectedId, onSelect }: ServiceStepProps) {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold uppercase leading-none text-foreground">
        {reservation.serviceTitle}
      </h2>
      <p className="mt-2 text-sm text-muted">{reservation.serviceIntro}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const selected = selectedId === service.id;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              aria-pressed={selected}
              className={`service-option flex flex-col rounded-2xl border p-5 text-left ${
                selected
                  ? "border-accent bg-accent/5 ring-1 ring-accent"
                  : "border-border bg-surface hover:border-accent/50"
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-display text-2xl font-semibold uppercase leading-none text-foreground">
                  {service.name}
                </span>
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                    selected
                      ? "border-accent bg-accent text-background"
                      : "border-border text-transparent"
                  }`}
                >
                  <Check
                    size={14}
                    className={selected ? "selection-check" : undefined}
                  />
                </span>
              </span>

              <span className="mt-3 flex items-center gap-2 text-sm text-muted">
                <Clock size={15} aria-hidden="true" />
                {service.durationMin} {servicesSection.durationLabel}
              </span>

              <span className="mt-4 font-display text-2xl font-semibold text-accent">
                {formatPrice(service.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
