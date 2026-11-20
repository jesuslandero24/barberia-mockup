"use client";

import { ArrowUpRight } from "lucide-react";
import type { Defecto, Prioridad, Severidad } from "@/config/metricas-data";
import { metricasTexto } from "@/config/metricas";

const SEVERIDADES: Severidad[] = ["Crítica", "Alta", "Media", "Baja"];
const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];

export const colorSeveridad: Record<Severidad, string> = {
  Crítica: "border-danger/50 bg-danger/20 text-danger",
  Alta: "border-danger/30 bg-danger/10 text-danger",
  Media: "border-accent/30 bg-accent/10 text-accent",
  Baja: "border-border bg-background/60 text-muted",
};

type PanelDefectosProps = {
  defectos: Defecto[];
  onVerCaso: (casoId: string) => void;
};

export function PanelDefectos({ defectos, onVerCaso }: PanelDefectosProps) {
  const texto = metricasTexto.defects;
  const maximo = Math.max(
    1,
    ...SEVERIDADES.flatMap((sev) =>
      PRIORIDADES.map(
        (pri) =>
          defectos.filter((d) => d.severidad === sev && d.prioridad === pri)
            .length,
      ),
    ),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div>
        <table className="w-full table-fixed border-separate border-spacing-1.5 text-center">
          <caption className="sr-only">
            {texto.severity} / {texto.priority}
          </caption>
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                <span className="sr-only">{texto.severity}</span>
              </th>
              {PRIORIDADES.map((pri) => (
                <th
                  key={pri}
                  scope="col"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-muted"
                >
                  {pri}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEVERIDADES.map((sev) => (
              <tr key={sev}>
                <th
                  scope="row"
                  className="text-left text-xs font-semibold text-muted"
                >
                  {sev}
                </th>
                {PRIORIDADES.map((pri) => {
                  const n = defectos.filter(
                    (d) => d.severidad === sev && d.prioridad === pri,
                  ).length;
                  const peligro = sev === "Crítica" || sev === "Alta";
                  return (
                    <td
                      key={pri}
                      className="h-12 rounded-lg border border-border font-display text-xl font-semibold"
                      style={{
                        backgroundColor:
                          n === 0
                            ? "transparent"
                            : `color-mix(in srgb, var(${peligro ? "--danger" : "--accent"}) ${15 + (n / maximo) * 45}%, transparent)`,
                        color: n === 0 ? "var(--border)" : "var(--foreground)",
                      }}
                    >
                      {n}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">
          {texto.severity} ↓ · {texto.priority} →
        </p>
      </div>

      {defectos.length === 0 ? (
        <p className="self-center text-sm text-muted">{texto.empty}</p>
      ) : (
        <ul className="grid content-start gap-2 sm:grid-cols-2">
          {defectos.map((defecto) => (
            <li key={defecto.id}>
              <button
                type="button"
                onClick={() => onVerCaso(defecto.caso)}
                className="group flex h-full w-full flex-col rounded-xl border border-border bg-background/40 p-3 text-left transition-colors duration-200 hover:border-accent/50"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-semibold text-accent">
                    {defecto.id}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${colorSeveridad[defecto.severidad]}`}
                  >
                    {defecto.severidad}
                  </span>
                </span>
                <span className="mt-1 text-sm font-medium leading-snug">
                  {defecto.titulo}
                </span>
                <span className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted">
                  <span className="truncate">{defecto.modulo}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-accent group-hover:underline">
                    {texto.viewCase} {defecto.caso}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
