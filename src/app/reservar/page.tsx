import type { Metadata } from "next";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { reservation } from "@/config/content";
import { ReservationFlow } from "@/components/reservar/ReservationFlow";

export const metadata: Metadata = {
  title: `${reservation.eyebrow} | ${brand.name}`,
  description: reservation.intro,
};

function ReservationFallback() {
  return (
    <div className="site-container pb-16 pt-24 lg:pt-28">
      <p className="sr-only">{reservation.loading}</p>
      <div className="animate-pulse">
        <div className="h-4 w-32 rounded bg-surface-2" />
        <div className="mt-4 h-12 w-64 max-w-full rounded bg-surface-2" />
        <div className="mt-6 h-4 w-full max-w-xl rounded bg-surface-2" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-[380px] rounded-2xl border border-border bg-surface" />
          <div className="hidden h-56 rounded-2xl border border-border bg-surface lg:block" />
        </div>
      </div>
    </div>
  );
}

export default function ReservarPage() {
  return (
    <main className="flex-1">
      <Suspense fallback={<ReservationFallback />}>
        <ReservationFlow />
      </Suspense>
    </main>
  );
}
