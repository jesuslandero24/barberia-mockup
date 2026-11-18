import { howItWorks } from "@/config/content";
import { Reveal } from "@/components/Reveal";

export function HowItWorks() {
  return (
    <section className="border-b border-border py-6 lg:py-7">
      <Reveal className="site-container flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
        <div className="shrink-0 lg:w-56">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {howItWorks.eyebrow}
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold uppercase leading-none tracking-tight text-foreground">
            {howItWorks.title}
          </h2>
        </div>

        <ol className="grid flex-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
          {howItWorks.steps.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-3 sm:px-5 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 font-display text-lg font-semibold leading-none text-accent">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-semibold uppercase leading-none text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-snug text-muted">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
