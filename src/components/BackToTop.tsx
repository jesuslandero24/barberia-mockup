"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { footer } from "@/config/content";

export function BackToTop() {
  const pathname = usePathname();
  const isReservation = pathname === "/reservar";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 600);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={footer.backToTop}
      className={`fixed right-4 z-40 grid size-12 place-items-center rounded-full border border-accent/40 bg-surface/95 text-accent shadow-[0_12px_30px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl transition duration-200 hover:border-accent hover:bg-accent hover:text-background sm:right-6 ${
        isReservation ? "bottom-64 lg:bottom-24" : "bottom-44 lg:bottom-24"
      }`}
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
