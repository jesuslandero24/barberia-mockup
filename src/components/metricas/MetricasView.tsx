"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Bug,
  CircleCheckBig,
  Gauge,
  ListChecks,
  Target,
  X,
} from "lucide-react";
import {
  casos,
  ciclo,
  defectos,
  ejecucionAnterior,
  metas,
} from "@/config/metricas-data";
import type { EstadoCaso, Modalidad, Prioridad } from "@/config/metricas-data";
import { metricasTexto } from "@/config/metricas";
import { fillTemplate } from "@/lib/format";
import {
  agrupar,
  filtrarCasos,
  filtrosVacios,
  formatoDensidad,
  formatoNumero,
  resumen,
} from "@/lib/metricas";
import type { FiltrosMetricas } from "@/lib/metricas";
import { KpiCard } from "@/components/metricas/KpiCard";
import { DonaEstado } from "@/components/metricas/DonaEstado";
import { BarrasApiladas } from "@/components/metricas/BarrasApiladas";
import { PanelDefectos } from "@/components/metricas/PanelDefectos";
import { Comparativo } from "@/components/metricas/Comparativo";
import { TablaCasos } from "@/components/metricas/TablaCasos";

type CampoDistribucion = "tipo" | "tecnica" | "enfoque" | "prioridad" | "modalidad";

const t = metricasTexto;
const totalGeneral = resumen(casos, defectos);

export function MetricasView() {
  const [filtros, setFiltros] = useState<FiltrosMetricas>(filtrosVacios);
  const [busqueda, setBusqueda] = useState("");
  const [campo, setCampo] = useState<CampoDistribucion>("tipo");

  const visibles = useMemo(() => filtrarCasos(casos, filtros), [filtros]);
  const r = useMemo(() => resumen(visibles, defectos), [visibles]);
  const modulos = useMemo(() => agrupar(visibles, "modulo"), [visibles]);
  const distribucion = useMemo(() => agrupar(visibles, campo), [visibles, campo]);
  const hayFiltros = Object.values(filtros).some((v) => v !== null);

  function alternar<K extends keyof FiltrosMetricas>(
    clave: K,
    valor: FiltrosMetricas[K],
  ) {
    setFiltros((prev) => ({
      ...prev,
      [clave]: prev[clave] === valor ? null : valor,
    }));
  }

  function verCaso(id: string) {
    setFiltros(filtrosVacios);
    setBusqueda(id);
    document.getElementById("casos")?.scrollIntoView({ behavior: "smooth" });
  }

  const kpis = [
    {
      icon: CircleCheckBig,
      label: t.kpis.passRate.label,
      value: `${formatoNumero(r.aprobacion)} %`,
      hint: t.kpis.passRate.hint,
      goal: fillTemplate(t.kpis.passRate.goal, { goal: String(metas.aprobacion) }),
      met: r.ejecutados ? r.aprobacion >= metas.aprobacion : null,
      progress: r.aprobacion,
      goalMark: metas.aprobacion,
    },
    {
      icon: ListChecks,
      label: t.kpis.execution.label,
      value: `${formatoNumero(r.ejecucion)} %`,
      hint: fillTemplate(t.kpis.execution.hint, {
        executed: String(r.ejecutados),
        total: String(r.total),
      }),
      goal: fillTemplate(t.kpis.execution.goal, { goal: String(metas.ejecucion) }),
      met: r.total ? r.ejecucion >= metas.ejecucion : null,
      progress: r.ejecucion,
      goalMark: metas.ejecucion,
    },
    {
      icon: Bug,
      label: t.kpis.openDefects.label,
      value: String(r.abiertos),
      hint: fillTemplate(t.kpis.openDefects.hint, { critical: String(r.criticos) }),
      goal: fillTemplate(t.kpis.openDefects.goal, {
        goal: String(metas.criticosAbiertos),
      }),
      met: r.criticos <= metas.criticosAbiertos,
      neutral: true,
    },
    {
      icon: Gauge,
      label: t.kpis.density.label,
      value: formatoDensidad(r.densidad),
      hint: t.kpis.density.hint,
      goal: fillTemplate(t.kpis.density.goal, {
        goal: formatoNumero(metas.densidadDefectos),
      }),
      met: r.ejecutados ? r.densidad < metas.densidadDefectos : null,
    },
    {
      icon: Bot,
      label: t.kpis.automation.label,
      value: `${formatoNumero(r.automatizacion)} %`,
      hint: fillTemplate(t.kpis.automation.hint, {
        automated: String(r.automatizados),
        total: String(r.total),
      }),
      goal: fillTemplate(t.kpis.automation.goal, { goal: "100" }),
      met: r.total ? r.automatizacion >= 100 : null,
      progress: r.automatizacion,
    },
    {
      icon: Target,
      label: t.kpis.coverage.label,
      value: `${formatoNumero(r.cobertura)} %`,
      hint: fillTemplate(t.kpis.coverage.hint, {
        covered: String(r.historias),
        total: String(r.total),
      }),
      goal: fillTemplate(t.kpis.coverage.goal, { goal: String(metas.cobertura) }),
      met: r.total ? r.cobertura >= metas.cobertura : null,
      progress: r.cobertura,
    },
  ];

  const hallazgos = useMemo(() => {
    const lista: { texto: string; tono: "danger" | "accent" | "success" }[] = [];
    const peor = modulos.find((m) => m.fallaron > 0);
    if (!peor) {
      lista.push({ texto: t.insights.none, tono: "success" });
      return lista;
    }
    const empatados = modulos.filter((m) => m.fallaron === peor.fallaron);
    lista.push({
      texto: fillTemplate(t.insights.topModule, {
        module: empatados.map((m) => m.label).join(" y "),
        count: String(peor.fallaron),
      }),
      tono: "danger",
    });
    const altos = visibles.filter(
      (c) => c.prioridad === "Alta" && c.estado === "Falló",
    );
    lista.push({
      texto: altos.length
        ? fillTemplate(t.insights.highPriority, {
            count: String(altos.length),
            ids: altos.map((c) => c.id).join(", "),
          })
        : t.insights.noHighPriority,
      tono: altos.length ? "danger" : "success",
    });
    lista.push({
      texto: r.criticos
        ? fillTemplate(t.insights.severityRisk, { count: String(r.criticos) })
        : fillTemplate(t.insights.severity, {
            media: String(r.defectos.filter((d) => d.severidad === "Media").length),
            baja: String(r.defectos.filter((d) => d.severidad === "Baja").length),
          }),
      tono: r.criticos ? "danger" : "accent",
    });
    lista.push({
      texto:
        r.aprobacion >= metas.aprobacion
          ? fillTemplate(t.insights.goalMet, {
              rate: formatoNumero(r.aprobacion),
              goal: String(metas.aprobacion),
            })
          : fillTemplate(t.insights.goal, {
              rate: formatoNumero(r.aprobacion),
              gap: formatoNumero(metas.aprobacion - r.aprobacion),
              goal: String(metas.aprobacion),
            }),
      tono: r.aprobacion >= metas.aprobacion ? "success" : "danger",
    });
    return lista;
  }, [modulos, visibles, r]);

  const segmentos: { estado: EstadoCaso; valor: number; color: string }[] = [
    { estado: "Pasó", valor: r.pasaron, color: "var(--success)" },
    { estado: "Falló", valor: r.fallaron, color: "var(--danger)" },
    { estado: "Bloqueado", valor: r.bloqueados, color: "var(--accent)" },
  ];

  return (
    <div className="pb-16">
      {/* Encabezado */}
      <section className="bg-listones border-b border-border pt-24 pb-10 lg:pt-28">
        <div className="site-container">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors duration-200 hover:text-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t.back}
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-5xl font-semibold uppercase leading-none sm:text-6xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-2xl text-muted">{t.intro}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t.cycleLabels.date, valor: ciclo.fecha },
              { label: t.cycleLabels.tool, valor: ciclo.herramienta },
              { label: t.cycleLabels.browser, valor: ciclo.navegador },
              { label: t.cycleLabels.owner, valor: ciclo.responsable },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-surface/80 px-3 py-2"
              >
                <dt className="text-xs text-muted">{item.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold">{item.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Filtros */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/90 backdrop-blur-xl lg:top-16">
        <div className="site-container flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 lg:flex-wrap lg:overflow-visible">
            <GrupoFiltro label={t.filters.modality}>
              {(["Manual", "Automatizada"] as Modalidad[]).map((m) => (
                <Chip
                  key={m}
                  activo={filtros.modalidad === m}
                  onClick={() => alternar("modalidad", m)}
                >
                  {m}
                </Chip>
              ))}
            </GrupoFiltro>
            <GrupoFiltro label={t.filters.priority}>
              {(["Alta", "Media"] as Prioridad[]).map((p) => (
                <Chip
                  key={p}
                  activo={filtros.prioridad === p}
                  onClick={() => alternar("prioridad", p)}
                >
                  {p}
                </Chip>
              ))}
            </GrupoFiltro>
            <GrupoFiltro label={t.filters.status}>
              {(["Pasó", "Falló"] as EstadoCaso[]).map((e) => (
                <Chip
                  key={e}
                  activo={filtros.estado === e}
                  onClick={() => alternar("estado", e)}
                >
                  {e}
                </Chip>
              ))}
            </GrupoFiltro>
            {filtros.modulo && (
              <GrupoFiltro label={t.filters.module}>
                <Chip activo onClick={() => alternar("modulo", filtros.modulo)}>
                  {filtros.modulo}
                  <X size={14} aria-hidden="true" />
                </Chip>
              </GrupoFiltro>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 lg:ml-auto">
            <p className="whitespace-nowrap text-sm text-muted" aria-live="polite">
              {fillTemplate(t.filters.showing, {
                visible: String(visibles.length),
                total: String(totalGeneral.total),
              })}
            </p>
            {hayFiltros && (
              <button
                type="button"
                onClick={() => setFiltros(filtrosVacios)}
                className="min-h-10 whitespace-nowrap rounded-lg border border-border px-3 text-sm font-medium text-accent transition-colors duration-200 hover:border-accent"
              >
                {t.filters.clear}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="site-container mt-8 grid gap-6">
        {/* KPIs */}
        <section
          aria-label="Indicadores clave"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </section>

        {/* Hallazgos */}
        <Tarjeta titulo={t.insights.title}>
          <ul className="grid gap-2 md:grid-cols-2">
            {hallazgos.map((h) => (
              <li
                key={h.texto}
                className="flex gap-3 rounded-xl border border-border bg-background/40 p-3 text-sm leading-relaxed"
              >
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    h.tono === "danger"
                      ? "bg-danger"
                      : h.tono === "success"
                        ? "bg-success"
                        : "bg-accent"
                  }`}
                  aria-hidden="true"
                />
                {h.texto}
              </li>
            ))}
          </ul>
        </Tarjeta>

        <div className="grid gap-6 lg:grid-cols-2">
          <Tarjeta titulo={t.status.title} subtitulo={t.status.caption}>
            <DonaEstado
              segmentos={segmentos}
              aprobacion={r.aprobacion}
              seleccionado={filtros.estado}
              onSelect={(e) => alternar("estado", e)}
            />
          </Tarjeta>
          <Tarjeta titulo={t.comparison.title} subtitulo={t.comparison.caption}>
            <Comparativo
              anterior={ejecucionAnterior}
              actual={{
                nombre: t.comparison.current,
                total: totalGeneral.total,
                pasaron: totalGeneral.pasaron,
                fallaron: totalGeneral.fallaron,
                bloqueados: totalGeneral.bloqueados,
                defectos: defectos.length,
              }}
            />
          </Tarjeta>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Tarjeta titulo={t.modules.title} subtitulo={t.modules.caption}>
            <BarrasApiladas
              items={modulos}
              seleccionado={filtros.modulo}
              onSelect={(m) => alternar("modulo", m)}
            />
          </Tarjeta>
          <Tarjeta titulo={t.distribution.title} subtitulo={t.distribution.caption}>
            <div
              role="tablist"
              aria-label={t.distribution.title}
              className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1"
            >
              {t.distribution.tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={campo === tab.key}
                  onClick={() => setCampo(tab.key as CampoDistribucion)}
                  className={`min-h-10 shrink-0 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 ${
                    campo === tab.key
                      ? "border-accent bg-accent text-background"
                      : "border-border text-muted hover:border-accent/50 hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <BarrasApiladas items={distribucion} />
          </Tarjeta>
        </div>

        <Tarjeta titulo={t.defects.title} subtitulo={t.defects.caption}>
          <PanelDefectos defectos={r.defectos} onVerCaso={verCaso} />
        </Tarjeta>

        <section id="casos" className="scroll-mt-36">
          <Tarjeta titulo={t.table.title}>
            <TablaCasos
              casos={visibles}
              busqueda={busqueda}
              onBusqueda={setBusqueda}
            />
          </Tarjeta>
        </section>
      </div>
    </div>
  );
}

function Tarjeta({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <h2 className="font-display text-2xl font-semibold uppercase leading-tight">
        {titulo}
      </h2>
      {subtitulo && <p className="mt-1 text-sm text-muted">{subtitulo}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function GrupoFiltro({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface p-1"
    >
      <span className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${
        activo
          ? "bg-accent text-background"
          : "text-foreground hover:bg-background"
      }`}
    >
      {children}
    </button>
  );
}
