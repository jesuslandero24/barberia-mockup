"use client";

import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X, ZoomIn } from "lucide-react";
import { galleryCategories, galleryPhotos } from "@/config/gallery";
import { worksSection } from "@/config/content";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

export function Works() {
  const [category, setCategory] = useState<string>("Todos");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const filtered =
    category === "Todos"
      ? galleryPhotos
      : galleryPhotos.filter((photo) => photo.category === category);
  const preview = filtered.slice(0, 8);
  const activePhoto = activeIndex === null ? null : filtered[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((index) =>
          index === null ? null : (index + 1) % filtered.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) =>
          index === null
            ? null
             : (index - 1 + filtered.length) % filtered.length,
        );
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, filtered.length]);

  function changeCategory(next: string) {
    setCategory(next);
    setActiveIndex(null);
  }

  function openPhoto(src: string) {
    const index = filtered.findIndex((photo) => photo.src === src);
    setActiveIndex(index >= 0 ? index : 0);
  }

  function showNext() {
    setActiveIndex((index) =>
      index === null ? null : (index + 1) % filtered.length,
    );
  }

  function showPrevious() {
    setActiveIndex((index) =>
      index === null
        ? null
        : (index - 1 + filtered.length) % filtered.length,
    );
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    didSwipe.current = false;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current;
    touchStartX.current = null;

    if (start === null) return;

    const delta = (event.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(delta) < 45) return;

    didSwipe.current = true;
    if (delta < 0) {
      showNext();
    } else {
      showPrevious();
    }
  }

  return (
    <section id="trabajos" className="section-space border-b border-border">
      <div className="site-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={worksSection.eyebrow}
            title={worksSection.title}
            intro={worksSection.intro}
          />

          <Reveal delay={80} className="flex flex-col gap-3 lg:items-end">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={worksSection.eyebrow}
            >
              {galleryCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeCategory(item)}
                  aria-pressed={category === item}
                  className={`min-h-12 rounded-full border px-4 text-[1.0625rem] font-semibold transition duration-200 ${
                    category === item
                      ? "border-accent bg-accent text-background"
                      : "border-border bg-surface text-muted hover:border-accent/50 hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setCategory("Todos");
                setActiveIndex(0);
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-5 text-[1.0625rem] font-semibold text-accent transition duration-200 hover:border-accent hover:bg-accent hover:text-background"
            >
              <Images size={18} aria-hidden="true" />
              {worksSection.viewAll}
            </button>
          </Reveal>
        </div>

        <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:gap-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {preview.map((photo, index) => (
            <Reveal
              key={photo.src}
              delay={index * 80}
              className="aspect-[3/4] w-[72vw] max-w-[18rem] shrink-0 snap-start sm:w-[38vw] lg:aspect-auto lg:h-60 lg:w-auto lg:max-w-none"
            >
              <button
                type="button"
                onClick={() => openPhoto(photo.src)}
                className="works-card group relative h-full w-full overflow-hidden rounded-xl border border-border bg-surface text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 38vw, 24vw"
                  className="works-media object-cover"
                />
                <span
                  className="works-overlay absolute inset-0 bg-gradient-to-t from-background/90 via-background/15 to-transparent"
                  aria-hidden="true"
                />
                <span className="works-meta absolute bottom-3 left-3 rounded-full border border-border/80 bg-background/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                  {photo.category}
                </span>
                <span
                  className="works-zoom absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-accent/40 bg-background/70 text-accent backdrop-blur-sm"
                  aria-hidden="true"
                >
                  <ZoomIn size={17} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={worksSection.previewLabel}
          onClick={() => {
            if (didSwipe.current) {
              didSwipe.current = false;
              return;
            }
            setActiveIndex(null);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {activePhoto.category}
            </span>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label={worksSection.close}
              className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent"
            >
              <X size={22} />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center px-4 pb-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-full max-h-[72vh] w-full max-w-3xl">
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
          </div>

          <div
            className="flex items-center justify-center gap-5 px-4 pb-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={showPrevious}
              aria-label={worksSection.previous}
              className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-base tabular-nums text-muted">
              {activeIndex === null ? 0 : activeIndex + 1} /{" "}
               {filtered.length}
            </span>
            <button
              type="button"
              onClick={showNext}
              aria-label={worksSection.next}
              className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
