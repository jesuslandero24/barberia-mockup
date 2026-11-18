import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  external?: boolean;
  onClick?: () => void;
};

const styles = {
  base: "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-[1.0625rem] font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  primary: "btn-shine bg-accent text-background hover:bg-[#e2bb72]",
  secondary:
    "border border-border bg-surface text-foreground hover:border-accent/60 hover:text-accent",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
  onClick,
}: ButtonLinkProps) {
  const combined = `${styles.base} ${styles[variant]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={combined}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={combined} onClick={onClick}>
      {children}
    </Link>
  );
}
