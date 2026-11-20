import type { LucideIcon } from "lucide-react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { metricasTexto } from "@/config/metricas";

type KpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  goal: string;
  met: boolean | null;
  progress?: number;
  goalMark?: number;
  neutral?: boolean;
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  goal,
  met,
  progress,
  goalMark,
  neutral = false,
}: KpiCardProps) {
  const tone = neutral
    ? "text-foreground"
    : met === null ? "text-muted" : met ? "text-success" : "text-danger";

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-accent/40 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
          <Icon size={19} aria-hidden="true" />
        </span>
        {met !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
              met
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger"
            }`}
          >
            {met ? (
              <CircleCheck size={13} aria-hidden="true" />
            ) : (
              <CircleAlert size={13} aria-hidden="true" />
            )}
            {met ? metricasTexto.kpis.met : metricasTexto.kpis.notMet}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className={`mt-1 font-display text-4xl font-semibold leading-none ${tone}`}>
        {value}
      </p>
      <p className="mt-2 text-sm text-muted">{hint}</p>
      {progress !== undefined && (
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-background">
          <div
            className={`progress-fill h-full rounded-full ${
              met === false ? "bg-danger" : "bg-success"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
          {goalMark !== undefined && (
            <span
              className="absolute inset-y-0 w-0.5 bg-foreground/80"
              style={{ left: `${goalMark}%` }}
              aria-hidden="true"
            />
          )}
        </div>
      )}
      <p className="mt-auto pt-3 text-xs font-medium text-accent">{goal}</p>
    </article>
  );
}
