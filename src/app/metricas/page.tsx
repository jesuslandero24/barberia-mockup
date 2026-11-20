import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { metricasTexto } from "@/config/metricas";
import { MetricasView } from "@/components/metricas/MetricasView";

export const metadata: Metadata = {
  title: `${metricasTexto.metaTitle} | ${brand.name}`,
  description: metricasTexto.intro,
};

export default function MetricasPage() {
  return (
    <main className="flex-1">
      <MetricasView />
    </main>
  );
}
