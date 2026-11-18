"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  Check,
  MessageCircle,
  RotateCcw,
  Scissors,
  Sparkles,
  Trash2,
} from "lucide-react";
import { demoMenu } from "@/config/content";
import {
  clearAllData,
  resetExampleData,
} from "@/lib/db";

const CLEAR_NOTICE_KEY = "yb-data-cleared-notice-v2";

export function DemoMenu() {
  const pathname = usePathname();
  const isReservation = pathname === "/reservar";
  const [open, setOpen] = useState(false);
  const [clearArmed, setClearArmed] = useState(false);
  const [clearNotice, setClearNotice] = useState(false);
  const [clearError, setClearError] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const clearTimerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.sessionStorage.getItem(CLEAR_NOTICE_KEY) !== "true") return;
    const frame = window.requestAnimationFrame(() => {
      window.sessionStorage.removeItem(CLEAR_NOTICE_KEY);
      setClearNotice(true);
      noticeTimerRef.current = window.setTimeout(
        () => setClearNotice(false),
        3000,
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => {
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current);
      }
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function handleReset() {
    setOpen(false);

    if (!window.confirm(demoMenu.resetConfirm)) return;

    resetExampleData();
    window.location.reload();
  }

  async function handleClearData() {
    if (!clearArmed) {
      setClearArmed(true);
      setClearError(false);
      clearTimerRef.current = window.setTimeout(() => {
        setClearArmed(false);
        clearTimerRef.current = null;
      }, 4000);
      return;
    }

    if (clearTimerRef.current !== null) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    try {
      await clearAllData();
      window.sessionStorage.setItem(CLEAR_NOTICE_KEY, "true");
      window.location.reload();
    } catch {
      setClearArmed(false);
      setClearError(true);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`fixed right-4 z-50 sm:right-6 lg:bottom-6 ${
        isReservation ? "bottom-48" : "bottom-24"
      }`}
    >
      {open ? (
        <div className="absolute bottom-full right-0 mb-3 w-60 overflow-hidden rounded-2xl border border-border bg-surface/95 p-1.5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {demoMenu.title}
          </p>

          <Link
            href="/panel"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-base font-medium text-foreground transition duration-200 hover:bg-surface-2 hover:text-accent"
          >
            <Scissors size={16} className="text-accent" aria-hidden="true" />
            {demoMenu.panel}
          </Link>

          <Link
            href="/bot"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-base font-medium text-foreground transition duration-200 hover:bg-surface-2 hover:text-accent"
          >
            <MessageCircle
              size={16}
              className="text-accent"
              aria-hidden="true"
            />
            {demoMenu.bot}
          </Link>

          <Link
            href="/info"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-base font-medium text-foreground transition duration-200 hover:bg-surface-2 hover:text-accent"
          >
            <CircleDollarSign
              size={16}
              className="text-accent"
              aria-hidden="true"
            />
            {demoMenu.info}
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-base font-medium text-foreground transition duration-200 hover:bg-surface-2 hover:text-accent"
          >
            <RotateCcw size={16} className="text-accent" aria-hidden="true" />
            {demoMenu.reset}
          </button>

          <button
            type="button"
            onClick={handleClearData}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-base font-medium text-foreground transition duration-200 hover:bg-surface-2 hover:text-accent"
          >
            <Trash2 size={16} className="text-accent" aria-hidden="true" />
            {clearArmed ? demoMenu.clearDataConfirm : demoMenu.clearData}
          </button>

          {clearError ? (
            <p role="alert" className="px-3 py-2 text-sm text-red-300">
              {demoMenu.clearDataError}
            </p>
          ) : null}
        </div>
      ) : null}

      {clearNotice ? (
        <p
          role="status"
          className="absolute bottom-full right-0 mb-3 inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-accent/40 bg-surface px-4 py-3 text-base font-medium text-foreground shadow-lg"
        >
          <Check size={18} className="text-accent" aria-hidden="true" />
          {demoMenu.clearDataNotice}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? demoMenu.close : demoMenu.label}
        className="neon-glow inline-flex min-h-12 items-center gap-2 rounded-full border border-accent/40 bg-surface/95 px-4 text-[1rem] font-semibold uppercase tracking-[0.16em] text-accent backdrop-blur-xl transition duration-200 hover:border-accent hover:bg-accent hover:text-background"
      >
        <Sparkles size={15} aria-hidden="true" />
        {demoMenu.label}
      </button>
    </div>
  );
}
