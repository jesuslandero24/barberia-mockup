import { metricasTexto } from "@/config/metricas";
import { fillTemplate } from "@/lib/format";
import { formatoNumero } from "@/lib/metricas";

type Ejecucion = {
  nombre: string;
  total: number;
  pasaron: number;
  fallaron: number;
  bloqueados: number;
  defectos: number;
};

export function Comparativo({
  anterior,
  actual,
}: {
  anterior: Ejecucion;
  actual: Ejecucion;
}) {
  const texto = metricasTexto.comparison;
  const deltas = [
    { valor: actual.total - anterior.total, label: texto.deltaCases },
    { valor: actual.defectos - anterior.defectos, label: texto.deltaDefects },
    { valor: actual.bloqueados - anterior.bloqueados, label: texto.deltaBlocked },
  ];

  return (
    <div className="grid gap-5">
      {[anterior, actual].map((e) => {
        const ejecutados = e.pasaron + e.fallaron;
        const tasa = ejecutados ? (e.pasaron / ejecutados) * 100 : 0;
        return (
          <div key={e.nombre}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
              <span className="font-semibold">{e.nombre}</span>
              <span className="text-xs text-muted">
                {fillTemplate(texto.cases, { total: String(e.total) })} ·{" "}
                {fillTemplate(texto.passRate, { rate: formatoNumero(tasa) })}
              </span>
            </div>
            <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-background">
              <span
                className="bg-success"
                style={{ width: `${(e.pasaron / e.total) * 100}%` }}
                title={`${e.pasaron}`}
              />
              <span
                className="bg-danger"
                style={{ width: `${(e.fallaron / e.total) * 100}%` }}
                title={`${e.fallaron}`}
              />
              <span
                className="bg-accent"
                style={{ width: `${(e.bloqueados / e.total) * 100}%` }}
                title={`${e.bloqueados}`}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {e.pasaron} {metricasTexto.modules.passed.toLowerCase()} ·{" "}
              {e.fallaron} {metricasTexto.modules.failed.toLowerCase()} ·{" "}
              {e.bloqueados} {metricasTexto.modules.blocked.toLowerCase()}
            </p>
          </div>
        );
      })}
      <dl className="grid grid-cols-3 gap-2">
        {deltas.map((d) => (
          <div
            key={d.label}
            className="rounded-xl border border-border bg-background/40 p-3"
          >
            <dt className="text-xs leading-snug text-muted">{d.label}</dt>
            <dd className="mt-1 font-display text-2xl font-semibold text-accent">
              {d.valor > 0 ? `+${d.valor}` : d.valor}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
