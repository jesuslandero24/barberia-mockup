import { Clock, MessageCircle, Zap } from "lucide-react";
import { hero } from "@/config/content";
import { ButtonLink } from "@/components/ButtonLink";
import { TodayHours } from "@/components/TodayHours";
import { HeroMascot } from "@/components/HeroMascot";
import BarberScene from "@/src/components/BarberScene";

const facts = [
  { icon: Clock },
  { icon: Zap },
  { icon: MessageCircle },
];

function titleWords(text: string, startIndex: number) {
  const words = text.trim().split(/\s+/);

  return words.map((word, index) => (
    <span
      key={`${word}-${index}`}
      className={`hero-word ${index < words.length - 1 ? "mr-[0.2em]" : ""}`}
      style={{ animationDelay: `${120 + (startIndex + index) * 70}ms` }}
    >
      {word}
    </span>
  ));
}

export function Hero() {
  const topWords = hero.titleTop.trim().split(/\s+/).length;

  return (
    <section className="relative overflow-hidden border-b border-border bg-listones">
      <div className="absolute inset-0 bg-geometria" aria-hidden="true" />

      <div className="site-container relative z-10">
        <div className="hero-layout grid items-center pb-10 pt-24 sm:pt-28 lg:pb-10 lg:pt-28">
          <div>
            <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              <BarberScene className="hero-barber-scene" />
              {hero.eyebrow}
            </span>

            <h1 className="mt-4 font-display text-[2.9rem] font-semibold uppercase leading-[0.9] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {titleWords(hero.titleTop, 0)}
              <br />
              <span className="text-accent">
                {titleWords(hero.titleAccent, topWords)}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {hero.subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/reservar">{hero.primaryCta}</ButtonLink>
              <ButtonLink href="/#trabajos" variant="secondary">
                {hero.secondaryCta}
              </ButtonLink>
            </div>
          </div>

          <div className="hero-visual">
            <HeroMascot
              alt={hero.photoAlt}
              sizes="(max-width: 767px) 34vw, (max-width: 1023px) 38vw, 400px"
            />
          </div>
        </div>

        <div className="grid gap-px border-t border-border sm:grid-cols-3">
          {hero.strip.map((item, index) => {
            const Icon = facts[index]?.icon ?? Clock;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 py-4 sm:px-5 sm:first:pl-0 sm:last:pr-0"
              >
                <Icon
                  size={18}
                  className="mt-0.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {index === 0 ? <TodayHours /> : item.detail}
                  </p>
                  {index === 0 ? (
                    <p className="mt-0.5 text-sm text-muted">{item.detail}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
