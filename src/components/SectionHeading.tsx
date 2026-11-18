import { Reveal } from "@/components/Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <Reveal>
      <div className={`flex flex-col gap-4 ${alignment}`}>
        <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
          {eyebrow}
        </span>
        <h2 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-semibold uppercase leading-[0.95] tracking-tight text-foreground">
          {title}
        </h2>
        {intro ? (
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            {intro}
          </p>
        ) : null}
      </div>
    </Reveal>
  );
}
