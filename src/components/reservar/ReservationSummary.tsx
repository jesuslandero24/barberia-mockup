import type { Service } from "@/lib/types";
import { reservation } from "@/config/content";
import {
  formatLongDate,
  formatTime12,
} from "@/lib/availability";
import { formatPrice } from "@/lib/format";

type ReservationSummaryProps = {
  service: Service | null;
  date: string | null;
  time: string | null;
};

export function ReservationSummary({
  service,
  date,
  time,
}: ReservationSummaryProps) {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl lg:sticky lg:inset-auto lg:top-24 lg:z-0 lg:rounded-2xl lg:border lg:bg-surface lg:p-6">
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 font-display text-xl font-semibold uppercase leading-none text-foreground">
            {reservation.summaryTitle}
          </h2>
          <span className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold leading-none text-accent">
            {service ? formatPrice(service.price) : "—"}
          </span>
        </div>

        <dl className="grid gap-1 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted">{reservation.serviceLabel}</dt>
            <dd className="min-w-0 break-words text-right font-medium text-foreground">
              {service ? service.name : reservation.notChosen}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted">
              {reservation.dateLabel}:
            </dt>
            <dd className="min-w-0 break-words text-right font-medium text-foreground">
              {date ? formatLongDate(date) : reservation.notChosen}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted">
              {reservation.timeLabel}:
            </dt>
            <dd className="min-w-0 whitespace-nowrap text-right font-medium text-foreground">
              {time ? formatTime12(time) : reservation.notChosen}
            </dd>
          </div>
        </dl>

        <p className="hidden text-sm leading-relaxed text-muted lg:block">
          {service && date
            ? reservation.summaryNote
            : reservation.summaryEmpty}
        </p>
      </div>
    </aside>
  );
}
