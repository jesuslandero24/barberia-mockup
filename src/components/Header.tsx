"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { brand } from "@/config/brand";
import { nav } from "@/config/content";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ButtonLink";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isHome) return;

    const observed = nav.links
      .map((link) => document.getElementById(link.href.split("#")[1] ?? ""))
      .filter((section): section is HTMLElement => section !== null);

    if (observed.length === 0) return;

    const visibility = new Map<string, boolean>(
      observed.map((section) => [section.id, false]),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting);
        }

        const visible = observed.find((section) =>
          visibility.get(section.id),
        );
        setActiveSection(visible?.id ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    observed.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isHome]);

  function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    setOpen(false);

    if (!isHome) return;

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b ${
        scrolled
          ? "border-border bg-background/70 backdrop-blur-2xl"
          : "border-border/80 bg-background/90 backdrop-blur-xl"
      }`}
    >
      <div
        className={`site-container flex items-center justify-between gap-4 ${
          scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20"
        }`}
      >
        <Link
          href="/"
          aria-label={brand.name}
          className={`header-logo ${scrolled ? "scale-95" : "scale-100"}`}
          onClick={handleLogoClick}
        >
          <span className="sm:hidden">
            <Logo />
          </span>
          <span className="hidden sm:inline-flex">
            <Logo withName />
          </span>
        </Link>

        <nav
          aria-label={nav.menuLabel}
          className="hidden items-center gap-7 lg:flex"
        >
          {nav.links.map((link) => {
            const active =
              isHome && activeSection === link.href.split("#")[1];

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "location" : undefined}
                className={`menu-link relative py-1 text-[1.0625rem] transition-colors duration-200 ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
                <span
                  className="menu-underline absolute inset-x-0 bottom-0 h-px bg-accent"
                  data-active={active ? "true" : undefined}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href="/reservar">{nav.cta}</ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? nav.closeMenu : nav.openMenu}
          className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div
          id="menu-movil"
          className="border-t border-border bg-background px-4 pb-6 pt-4 sm:px-6 lg:hidden"
        >
          <nav aria-label={nav.menuLabel} className="flex flex-col">
            {nav.links.map((link) => {
              const active =
                isHome && activeSection === link.href.split("#")[1];

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "location" : undefined}
                  className={`menu-link relative border-b border-border/70 py-3 text-base transition-colors duration-200 ${
                    active ? "text-accent" : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span
                    className="menu-underline absolute inset-x-0 bottom-0 h-px bg-accent"
                    data-active={active ? "true" : undefined}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>
          <ButtonLink
            href="/reservar"
            className="mt-5 w-full"
            onClick={() => setOpen(false)}
          >
            {nav.cta}
          </ButtonLink>
        </div>
      ) : null}
    </header>
  );
}
