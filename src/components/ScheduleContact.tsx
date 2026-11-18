import { MapPin, MessageCircle, Clock } from "lucide-react";
import { brand } from "@/config/brand";
import { scheduleSection } from "@/config/content";
import { getWhatsAppUrl } from "@/lib/format";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";
import { ScheduleTable } from "@/components/ScheduleTable";

export function ScheduleContact() {
  return (
    <section id="horario" className="border-b border-border py-16 sm:py-20 lg:py-24">
      <div className="site-container">
        <SectionHeading
          eyebrow={scheduleSection.eyebrow}
          title={scheduleSection.title}
          intro={scheduleSection.intro}
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="neon-glow-hover rounded-2xl border border-border bg-surface p-6 transition duration-200 sm:p-8">
            <h3 className="flex items-center gap-3 font-display text-2xl font-semibold uppercase leading-none text-foreground">
              <Clock size={18} className="text-accent" aria-hidden="true" />
              {scheduleSection.scheduleLabel}
            </h3>
            <div className="mt-5">
              <ScheduleTable />
            </div>
            <p className="mt-4 text-sm text-muted">
              {scheduleSection.timezoneNote}
            </p>
          </div>

          <div className="flex flex-col gap-4">
          <div className="neon-glow-hover rounded-2xl border border-border bg-surface p-6 transition duration-200 sm:p-8">
              <h3 className="flex items-center gap-3 font-display text-2xl font-semibold uppercase leading-none text-foreground">
                <MapPin size={18} className="text-accent" aria-hidden="true" />
                {scheduleSection.addressLabel}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {brand.address}
              </p>
            </div>

            <div className="neon-glow-hover rounded-2xl border border-accent/30 bg-surface p-6 transition duration-200 sm:p-8">
              <h3 className="flex items-center gap-3 font-display text-2xl font-semibold uppercase leading-none text-foreground">
                <MessageCircle
                  size={18}
                  className="text-accent"
                  aria-hidden="true"
                />
                {scheduleSection.whatsappLabel}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {brand.name}
              </p>
              <ButtonLink
                href={getWhatsAppUrl(brand.whatsapp)}
                external
                className="mt-5 w-full"
              >
                <MessageCircle size={18} aria-hidden="true" />
                {scheduleSection.whatsappCta}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
