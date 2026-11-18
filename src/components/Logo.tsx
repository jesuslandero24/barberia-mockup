import { brand } from "@/config/brand";

type LogoProps = {
  className?: string;
  withName?: boolean;
};

export function Logo({ className = "", withName = false }: LogoProps) {
  const initial = brand.name.trim().charAt(0).toUpperCase();

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-accent/60 bg-surface">
        <span className="absolute inset-1 rounded-full border border-accent/20" />
        <span className="font-display text-xl font-semibold leading-none text-accent">
          {initial}
        </span>
      </span>
      {withName ? (
        <span className="font-display text-lg font-semibold uppercase leading-none tracking-[0.14em] text-foreground">
          {brand.name}
        </span>
      ) : null}
    </span>
  );
}
