"use client";

import { useState } from "react";
import type { EstadoCaso } from "@/config/metricas-data";
import { metricasTexto } from "@/config/metricas";
import { formatoNumero } from "@/lib/metricas";

type Segmento = {
  estado: EstadoCaso;
  valor: number;
  color: string;
};

type DonaEstadoProps = {
  segmentos: Segmento[];
  aprobacion: number;
  seleccionado: EstadoCaso | null;
  onSelect: (estado: EstadoCaso) => void;
};

const RADIO = 70;
const GROSOR = 22;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

export function DonaEstado({
  segmentos,
  aprobacion,
  seleccionado,
  onSelect,
}: DonaEstadoProps) {
  const [hover, setHover] = useState<EstadoCaso | null>(null);
  const total = segmentos.reduce((suma, s) => suma + s.valor, 0);
  const visibles = segmentos.filter((s) => s.valor > 0);
  const activo = hover ?? seleccionado;
  const activoData = visibles.find((s) => s.estado === activo);

  const arcos = visibles.map((s, i) => {
    const largo = total ? (s.valor / total) * CIRCUNFERENCIA : 0;
    const previo = visibles
      .slice(0, i)
      .reduce((suma, p) => suma + (total ? (p.valor / total) * CIRCUNFERENCIA : 0), 0);
    return { ...s, largo, offset: -previo };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <svg
        viewBox="0 0 180 180"
        className="size-48 shrink-0"
        role="img"
        aria-label={visibles
          .map((s) => `${s.estado}: ${s.valor}`)
          .join(", ")}
      >
        <g transform="rotate(-90 90 90)">
        <circle
          cx="90"
          cy="90"
          r={RADIO}
          fill="none"
          stroke="var(--background)"
          strokeWidth={GROSOR}
        />
        {arcos.map(({ largo, offset, ...s }) => {
          const atenuado = activo !== null && activo !== s.estado;
          return (
            <circle
              key={s.estado}
              cx="90"
              cy="90"
              r={RADIO}
              fill="none"
              stroke={s.color}
              strokeWidth={activo === s.estado ? GROSOR + 6 : GROSOR}
              strokeDasharray={`${largo} ${CIRCUNFERENCIA - largo}`}
              strokeDashoffset={offset}
              className="cursor-pointer transition-all duration-200"
              opacity={atenuado ? 0.3 : 1}
              onMouseEnter={() => setHover(s.estado)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(s.estado)}
            >
              <title>{`${s.estado}: ${s.valor}`}</title>
            </circle>
          );
        })}
        </g>
        <g>
          <text
            x="90"
            y="88"
            textAnchor="middle"
            className="fill-foreground font-display text-[2.1rem] font-semibold"
          >
            {activoData
              ? activoData.valor
              : `${formatoNumero(aprobacion)} %`}
          </text>
          <text
            x="90"
            y="110"
            textAnchor="middle"
            className="fill-muted text-[0.7rem] uppercase tracking-[0.14em]"
          >
            {activoData ? activoData.estado : metricasTexto.status.centerLabel}
          </text>
        </g>
      </svg>

      <ul className="grid w-full gap-2">
        {segmentos.map((s) => {
          const pct = total ? (s.valor / total) * 100 : 0;
          const pressed = seleccionado === s.estado;
          return (
            <li key={s.estado}>
              <button
                type="button"
                aria-pressed={pressed}
                disabled={s.valor === 0 && !pressed}
                onClick={() => onSelect(s.estado)}
                onMouseEnter={() => setHover(s.estado)}
                onMouseLeave={() => setHover(null)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  pressed
                    ? "border-accent bg-accent/10"
                    : "border-border bg-background/40 hover:border-accent/40"
                }`}
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-sm font-medium">{s.estado}</span>
                <span className="font-display text-xl font-semibold">
                  {s.valor}
                </span>
                <span className="w-14 text-right text-xs text-muted">
                  {formatoNumero(pct)} %
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
