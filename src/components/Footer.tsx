import Link from "next/link";
import { brand } from "@/config/brand";
import { footer, nav } from "@/config/content";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

export function Footer() {
  return (
    <footer className="py-7 lg:py-8">
      <Reveal className="site-container">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo withName />
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              {footer.tagline}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {nav.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#"
              className="text-muted transition-colors duration-200 hover:text-foreground"
            >
              {footer.backToTop}
            </Link>
          </nav>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-sm text-muted">
            © {brand.name}. {footer.rights}
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
