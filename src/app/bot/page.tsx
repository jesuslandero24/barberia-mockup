import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { brand } from "@/config/brand";
import { bot } from "@/config/content";
import { BotSimulator } from "@/components/bot/BotSimulator";

export const metadata: Metadata = {
  title: `${bot.eyebrow} | ${brand.name}`,
  description: bot.intro,
};

export default function BotPage() {
  return (
    <main className="flex-1">
      <div className="site-container pb-16 pt-24 lg:pt-28">
        <header className="max-w-2xl">
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
            {bot.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-[0.92] tracking-tight text-foreground sm:text-5xl">
            {bot.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            {bot.intro}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-[1.0625rem] font-semibold text-foreground transition duration-200 hover:border-accent/60 hover:text-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {bot.backHome}
          </Link>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
          <BotSimulator />

          <aside className="rounded-2xl border border-accent/30 bg-surface p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-semibold uppercase leading-none text-foreground">
              {bot.noteTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {bot.note}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
