"use client";

import { metricasTexto } from "@/config/metricas";
import type { Conteo } from "@/lib/metricas";

type BarrasApiladasProps = {
  items: Conteo[];
  seleccionado?: string | null;
  onSelect?: (label: string) => void;
};

export function BarrasApiladas({
  items,
  seleccionado = null,
  onSelect,
}: BarrasApiladasProps) {
  const maximo = Math.max(1, ...items.map((item) => item.total));
  const texto = metricasTexto.modules;

  return (
    <div>
      <ul className="grid gap-1.5">
        {items.map((item) => {
          const activo = seleccionado === item.label;
          const atenuado = seleccionado !== null && !activo;
          const contenido = (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium">
                  {item.label}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {item.fallaron > 0 && (
                    <span className="mr-2 font-semibold text-danger">
                      {item.fallaron}{" "}
                      {item.fallaron === 1 ? texto.failedOne : texto.failed.toLowerCase()}
                    </span>
                  )}
                  {item.total} {item.total === 1 ? texto.case : texto.cases}
                </span>
              </div>
              <div
                className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-background"
                style={{ width: `${(item.total / maximo) * 100}%` }}
              >
                <span
                  className="h-full bg-success transition-all duration-500"
                  style={{ width: `${(item.pasaron / item.total) * 100}%` }}
                />
                <span
                  className="h-full bg-danger transition-all duration-500"
                  style={{ width: `${(item.fallaron / item.total) * 100}%` }}
                />
                <span
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${(item.bloqueados / item.total) * 100}%` }}
                />
              </div>
            </>
          );

          return (
            <li
              key={item.label}
              className={`transition-opacity duration-200 ${
                atenuado ? "opacity-45" : ""
              }`}
            >
              {onSelect ? (
                <button
                  type="button"
                  aria-pressed={activo}
                  title={`${item.label}: ${item.pasaron} ${texto.passed.toLowerCase()}, ${item.fallaron} ${texto.failed.toLowerCase()}`}
                  onClick={() => onSelect(item.label)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition-colors duration-200 ${
                    activo
                      ? "border-accent bg-accent/10"
                      : "border-transparent hover:border-border hover:bg-background/40"
                  }`}
                >
                  {contenido}
                </button>
              ) : (
                <div className="px-3 py-2">{contenido}</div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap gap-4 px-3 text-xs text-muted">
        <Leyenda color="bg-success" label={texto.passed} />
        <Leyenda color="bg-danger" label={texto.failed} />
        <Leyenda color="bg-accent" label={texto.blocked} />
      </div>
    </div>
  );
}

function Leyenda({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-full ${color}`} aria-hidden="true" />
      {label}
    </span>
  );
}
