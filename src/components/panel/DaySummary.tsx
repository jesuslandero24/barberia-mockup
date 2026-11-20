import { Banknote, CalendarDays, Clock } from "lucide-react";
import { panel } from "@/config/content";
import { formatPrice } from "@/lib/format";

type DaySummaryProps = {
  bookings: number;
  freeHours: number;
  income: number;
  loaded: boolean;
};

function formatHours(value: number): string {
  return Number.isInteger(value)
    ? `${value} h`
    : `${value.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} h`;
}

export function DaySummary({
  bookings,
  freeHours,
  income,
  loaded,
}: DaySummaryProps) {
  const items = [
    {
      key: "bookings",
      icon: CalendarDays,
      label: panel.summary.bookings,
      value: loaded ? String(bookings) : "—",
      accent: false,
    },
    {
      key: "free",
      icon: Clock,
      label: panel.summary.freeHours,
      value: loaded ? formatHours(freeHours) : "—",
      accent: false,
    },
    {
      key: "income",
      icon: Banknote,
      label: panel.summary.income,
      value: loaded ? formatPrice(income) : "—",
      accent: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ key, icon: Icon, label, value, accent }) => (
        <div
          key={key}
          className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
        >
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-xl border ${
              accent
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-border bg-background/40 text-muted"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {label}
            </p>
            <p
              className={`mt-0.5 truncate font-display text-2xl font-semibold leading-none ${
                accent ? "text-accent" : "text-foreground"
              }`}
            >
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
