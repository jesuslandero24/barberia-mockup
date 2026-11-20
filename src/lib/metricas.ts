import type {
  CasoPrueba,
  Defecto,
  EstadoCaso,
  Modalidad,
  Prioridad,
} from "@/config/metricas-data";

export type FiltrosMetricas = {
  modalidad: Modalidad | null;
  prioridad: Prioridad | null;
  estado: EstadoCaso | null;
  modulo: string | null;
};

export const filtrosVacios: FiltrosMetricas = {
  modalidad: null,
  prioridad: null,
  estado: null,
  modulo: null,
};

export type Conteo = {
  label: string;
  total: number;
  pasaron: number;
  fallaron: number;
  bloqueados: number;
};

export function filtrarCasos(casos: CasoPrueba[], filtros: FiltrosMetricas) {
  return casos.filter(
    (caso) =>
      (!filtros.modalidad || caso.modalidad === filtros.modalidad) &&
      (!filtros.prioridad || caso.prioridad === filtros.prioridad) &&
      (!filtros.estado || caso.estado === filtros.estado) &&
      (!filtros.modulo || caso.modulo === filtros.modulo),
  );
}

export function resumen(casos: CasoPrueba[], defectos: Defecto[]) {
  const total = casos.length;
  const ejecutados = casos.filter(
    (caso) => caso.estado !== "No ejecutado",
  ).length;
  const pasaron = casos.filter((caso) => caso.estado === "Pasó").length;
  const fallaron = casos.filter((caso) => caso.estado === "Falló").length;
  const bloqueados = casos.filter((caso) => caso.estado === "Bloqueado").length;
  const ids = new Set(casos.map((caso) => caso.id));
  const defectosVisibles = defectos.filter((defecto) => ids.has(defecto.caso));
  const abiertos = defectosVisibles.filter(
    (defecto) => defecto.estado !== "Cerrado" && defecto.estado !== "Resuelto",
  );
  const criticos = abiertos.filter(
    (defecto) => defecto.severidad === "Crítica" || defecto.severidad === "Alta",
  ).length;
  const automatizados = casos.filter((caso) => caso.script.trim() !== "").length;
  const historias = new Set(casos.map((caso) => caso.hu)).size;

  return {
    total,
    ejecutados,
    pasaron,
    fallaron,
    bloqueados,
    defectos: defectosVisibles,
    abiertos: abiertos.length,
    criticos,
    automatizados,
    historias,
    aprobacion: ejecutados ? (pasaron / ejecutados) * 100 : 0,
    ejecucion: total ? (ejecutados / total) * 100 : 0,
    densidad: ejecutados ? defectosVisibles.length / ejecutados : 0,
    automatizacion: total ? (automatizados / total) * 100 : 0,
    cobertura: total ? (historias / total) * 100 : 0,
  };
}

export function agrupar(
  casos: CasoPrueba[],
  campo: keyof Pick<
    CasoPrueba,
    "modulo" | "tipo" | "tecnica" | "enfoque" | "prioridad" | "modalidad"
  >,
): Conteo[] {
  const mapa = new Map<string, Conteo>();

  for (const caso of casos) {
    const label = caso[campo];
    const item = mapa.get(label) ?? {
      label,
      total: 0,
      pasaron: 0,
      fallaron: 0,
      bloqueados: 0,
    };
    item.total += 1;
    if (caso.estado === "Pasó") item.pasaron += 1;
    if (caso.estado === "Falló") item.fallaron += 1;
    if (caso.estado === "Bloqueado") item.bloqueados += 1;
    mapa.set(label, item);
  }

  return [...mapa.values()].sort(
    (a, b) => b.fallaron - a.fallaron || b.total - a.total,
  );
}

const numero = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function formatoNumero(valor: number): string {
  return numero.format(valor);
}

export function formatoDensidad(valor: number): string {
  return decimal.format(valor);
}
