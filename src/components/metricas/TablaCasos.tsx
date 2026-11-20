"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, Search } from "lucide-react";
import type { CasoPrueba } from "@/config/metricas-data";
import { metricasTexto } from "@/config/metricas";
import { fillTemplate } from "@/lib/format";

type Columna = keyof typeof metricasTexto.table.columns;

const COLUMNAS: Columna[] = [
  "id",
  "nombre",
  "modulo",
  "prioridad",
  "modalidad",
  "estado",
  "defecto",
];

// En celular se muestran los casos por tandas para no alargar la página.
const PASO_MOVIL = 12;

const colorEstado: Record<string, string> = {
  Pasó: "border-success/30 bg-success/10 text-success",
  Falló: "border-danger/30 bg-danger/10 text-danger",
  Bloqueado: "border-accent/30 bg-accent/10 text-accent",
  "No ejecutado": "border-border text-muted",
};

type TablaCasosProps = {
  casos: CasoPrueba[];
  busqueda: string;
  onBusqueda: (valor: string) => void;
};

export function TablaCasos({ casos, busqueda, onBusqueda }: TablaCasosProps) {
  const texto = metricasTexto.table;
  const [orden, setOrden] = useState<{ col: Columna; asc: boolean } | null>(
    null,
  );
  const [abierto, setAbierto] = useState<string | null>(null);
  const [limite, setLimite] = useState(PASO_MOVIL);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtrados = q
      ? casos.filter((c) =>
          [c.id, c.nombre, c.modulo, c.defecto ?? "", c.hu]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : casos;
    if (!orden) return filtrados;
    return [...filtrados].sort((a, b) => {
      const va = a[orden.col] ?? "";
      const vb = b[orden.col] ?? "";
      const r = va.localeCompare(vb, "es", { numeric: true });
      return orden.asc ? r : -r;
    });
  }, [casos, busqueda, orden]);

  function ordenar(col: Columna) {
    setOrden((prev) =>
      prev?.col === col ? { col, asc: !prev.asc } : { col, asc: true },
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">{texto.searchLabel}</span>
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
            placeholder={texto.search}
            className="min-h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </label>
        <p className="text-sm text-muted" aria-live="polite">
          {visibles.length === 1
            ? texto.countOne
            : fillTemplate(texto.count, { count: String(visibles.length) })}
        </p>
      </div>

      {visibles.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
          {texto.empty}
        </p>
      ) : (
        <>
          {/* Celular: tarjetas */}
          <ul className="mt-4 grid gap-2 md:hidden">
            {visibles.slice(0, limite).map((caso) => (
              <li
                key={caso.id}
                className="rounded-xl border border-border bg-background/40"
              >
                <button
                  type="button"
                  aria-expanded={abierto === caso.id}
                  onClick={() =>
                    setAbierto((prev) => (prev === caso.id ? null : caso.id))
                  }
                  className="flex w-full items-start gap-3 p-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-semibold text-accent">
                        {caso.id}
                      </span>
                      <EstadoBadge estado={caso.estado} />
                      {caso.defecto && (
                        <span className="text-xs font-semibold text-danger">
                          {caso.defecto}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm font-medium leading-snug">
                      {caso.nombre}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {caso.modulo} · {caso.prioridad} · {caso.modalidad}
                    </span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`mt-1 shrink-0 text-muted transition-transform duration-200 ${
                      abierto === caso.id ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {abierto === caso.id && (
                  <div className="border-t border-border p-3">
                    <Detalle caso={caso} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          {visibles.length > limite && (
            <button
              type="button"
              onClick={() => setLimite((n) => n + PASO_MOVIL)}
              className="mt-3 min-h-12 w-full rounded-xl border border-border text-sm font-medium text-accent transition-colors duration-200 hover:border-accent md:hidden"
            >
              {fillTemplate(metricasTexto.mobileMore, {
                count: String(Math.min(PASO_MOVIL, visibles.length - limite)),
              })}
            </button>
          )}

          {/* Escritorio: tabla */}
          <div className="mt-4 hidden max-h-[38rem] overflow-auto rounded-xl border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-surface-2">
                <tr>
                  {COLUMNAS.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      aria-sort={
                        orden?.col === col
                          ? orden.asc
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className="border-b border-border px-3 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => ordenar(col)}
                        aria-label={fillTemplate(texto.sortBy, {
                          column: texto.columns[col],
                        })}
                        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200 hover:text-accent ${
                          orden?.col === col ? "text-accent" : "text-muted"
                        }`}
                      >
                        {texto.columns[col]}
                        <ArrowDownUp size={12} aria-hidden="true" />
                      </button>
                    </th>
                  ))}
                  <th className="border-b border-border px-3 py-2.5">
                    <span className="sr-only">{texto.details}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((caso) => {
                  const open = abierto === caso.id;
                  return (
                    <Fragment key={caso.id}>
                      <tr
                        className={`cursor-pointer border-b border-border transition-colors duration-200 hover:bg-background/60 ${
                          open ? "bg-background/60" : ""
                        }`}
                        onClick={() =>
                          setAbierto((prev) => (prev === caso.id ? null : caso.id))
                        }
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-accent">
                          {caso.id}
                        </td>
                        <td className="px-3 py-2.5">{caso.nombre}</td>
                        <td className="px-3 py-2.5 text-muted">{caso.modulo}</td>
                        <td className="px-3 py-2.5 text-muted">{caso.prioridad}</td>
                        <td className="px-3 py-2.5 text-muted">{caso.modalidad}</td>
                        <td className="px-3 py-2.5">
                          <EstadoBadge estado={caso.estado} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-danger">
                          {caso.defecto ?? <span className="text-border">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-label={open ? texto.hideDetails : texto.details}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAbierto((prev) =>
                                prev === caso.id ? null : caso.id,
                              );
                            }}
                            className="grid size-8 place-items-center rounded-lg text-muted hover:text-accent"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ${
                                open ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-border bg-background/40">
                          <td colSpan={COLUMNAS.length + 1} className="px-3 py-4">
                            <Detalle caso={caso} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
        colorEstado[estado] ?? "border-border text-muted"
      }`}
    >
      {estado}
    </span>
  );
}

function Detalle({ caso }: { caso: CasoPrueba }) {
  const texto = metricasTexto.table;
  const filas = [
    { label: texto.story, valor: `${caso.hu}: ${caso.historia}` },
    { label: texto.expected, valor: caso.esperado },
    { label: texto.actual, valor: caso.obtenido },
    {
      label: texto.design,
      valor: `${caso.tipo} · ${caso.tecnica} · ${caso.enfoque}`,
    },
    { label: texto.script, valor: caso.script, mono: true },
  ];

  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {filas.map((f) => (
        <div key={f.label} className={f.mono ? "md:col-span-2" : ""}>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            {f.label}
          </dt>
          <dd
            className={`mt-1 text-sm leading-relaxed ${
              f.mono ? "break-all font-mono text-xs text-muted" : "text-foreground/90"
            }`}
          >
            {f.valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}
