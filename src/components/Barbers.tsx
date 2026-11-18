import {
  ArrowRight,
  Clock,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { barbers } from "@/config/barbers";
import { brand } from "@/config/brand";
import { barbersSection, scheduleSection } from "@/config/content";
import { getWhatsAppUrl } from "@/lib/format";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";
import { ScheduleTable } from "@/components/ScheduleTable";
import { Reveal } from "@/components/Reveal";

export function Barbers() {
  const barber = barbers[0];

  if (!barber) return null;

  return (
    <section className="section-space border-b border-border">
      <div className="site-container">
        <SectionHeading
          eyebrow={barbersSection.eyebrow}
          title={barbersSection.title}
          intro={barbersSection.intro}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-5">
          <Reveal className="h-full">
            <article
              id="yonder"
              className="neon-glow-hover relative h-full scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-surface transition duration-200 hover:border-accent/50 lg:scroll-mt-28"
            >
              <span
                className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-accent/10"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full border border-accent/10"
                aria-hidden="true"
              />

              <div className="relative flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
                <div className="flex items-center gap-5">
                  <span className="grid size-20 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 font-display text-5xl font-semibold leading-none text-accent sm:size-24 sm:text-6xl">
                    {barber.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                      {barber.role}
                    </p>
                    <h3 className="mt-1.5 font-display text-5xl font-semibold uppercase leading-[0.9] tracking-tight text-foreground sm:text-6xl">
                      {barber.name}
                    </h3>
                  </div>
                </div>

                <p className="max-w-xl text-lg leading-relaxed text-muted">
                  {barbersSection.quote}
                </p>

                <ButtonLink href="/reservar" className="w-full sm:w-auto">
                  {barbersSection.cta}
                  <ArrowRight
                    size={18}
                    className="motion-arrow"
                    aria-hidden="true"
                  />
                </ButtonLink>
              </div>
            </article>
          </Reveal>

          <Reveal delay={80} className="h-full">
            <div
              id="horario"
              className="neon-glow-hover flex h-full scroll-mt-24 flex-col rounded-2xl border border-border bg-surface p-6 transition duration-200 sm:p-8 lg:scroll-mt-28"
            >
              <h3 className="flex items-center gap-3 font-display text-2xl font-semibold uppercase leading-none text-foreground">
                <Clock size={20} className="text-accent" aria-hidden="true" />
                {scheduleSection.scheduleLabel}
              </h3>

              <div className="mt-4">
                <ScheduleTable />
              </div>

              <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {scheduleSection.addressLabel}
                    </p>
                    <p className="mt-1 text-sm leading-snug">{brand.address}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <MessageCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        {scheduleSection.whatsappLabel}
                      </p>
                      <p className="mt-1 text-sm leading-snug">
                        {scheduleSection.timezoneNote}
                      </p>
                    </div>
                  </div>
                  <ButtonLink
                    href={getWhatsAppUrl(brand.whatsapp)}
                    external
                    className="w-full"
                  >
                    <MessageCircle size={18} aria-hidden="true" />
                    {scheduleSection.whatsappCta}
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
