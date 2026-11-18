import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { services } from "@/config/services";
import { servicesSection } from "@/config/content";
import { formatPrice } from "@/lib/format";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

export function Services() {
  return (
    <section id="servicios" className="section-space border-b border-border">
      <div className="site-container">
        <SectionHeading
          eyebrow={servicesSection.eyebrow}
          title={servicesSection.title}
          intro={servicesSection.intro}
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 80} className="h-full">
              <article
                className={`service-card relative flex h-full flex-col rounded-2xl border bg-surface p-4 sm:p-5 ${
                  service.featured ? "border-accent/40" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-sm tracking-[0.32em] text-accent-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {service.featured ? (
                    <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                      {servicesSection.featuredLabel}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 font-display text-2xl font-semibold uppercase leading-none text-foreground sm:text-3xl">
                  {service.name}
                </h3>

                <p className="mt-2.5 flex items-center gap-2 text-sm text-muted">
                  <Clock size={15} aria-hidden="true" />
                  {service.durationMin} {servicesSection.durationLabel}
                </p>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
                  <span className="service-price font-display text-2xl font-semibold sm:text-3xl">
                    {formatPrice(service.price)}
                  </span>
                  <Link
                    href={`/reservar?servicio=${service.id}`}
                    className="inline-flex min-h-12 items-center gap-1.5 rounded-lg border border-border px-3.5 text-[1rem] font-semibold text-foreground transition duration-200 hover:border-accent/60 hover:text-accent"
                  >
                    {servicesSection.cta}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
