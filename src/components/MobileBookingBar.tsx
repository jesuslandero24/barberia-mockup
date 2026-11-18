"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { nav } from "@/config/content";

export function MobileBookingBar() {
  const pathname = usePathname();

  if (pathname === "/reservar") return null;

  return (
    <>
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <Link
          href="/reservar"
          className="btn-shine inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[1.0625rem] font-semibold tracking-wide text-background hover:bg-[#e2bb72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <CalendarCheck size={19} aria-hidden="true" />
          {nav.cta}
        </Link>
      </div>
    </>
  );
}
