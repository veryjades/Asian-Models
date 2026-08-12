import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { AgencyImage } from "@/components/site/AgencyImage";
import { spotlightLabels, spotlightSlides, type SpotlightSlide } from "@/lib/content/spotlight";

const INTERVAL = 6000;

function SlideBody({ slide }: { slide: SpotlightSlide }) {
  const { pick, lang } = useI18n();
  const label = spotlightLabels[slide.kind];

  return (
    <>
      <AgencyImage
        src={slide.image}
        alt={pick(slide.titleEn, slide.titleZh)}
        width={1920}
        height={1024}
        containerClassName="aspect-video md:aspect-auto md:h-[calc(100vh-4.25rem)]"
        fit={slide.imageFit}
        objectPosition={slide.objectPosition}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background/85 via-background/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
        <span className="gradient-accent label-xs inline-block px-2.5 py-1.5 text-foreground">
          {lang === "zh" ? label.zh : label.en}
        </span>
        <h2 className="mt-4 max-w-3xl text-2xl font-light leading-tight md:text-4xl">
          {pick(slide.titleEn, slide.titleZh)}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          {pick(slide.captionEn, slide.captionZh)}
        </p>
        <span className="mt-5 inline-flex border-b border-foreground pb-1 text-xs tracking-[0.14em] uppercase">
          {pick(slide.ctaEn, slide.ctaZh)}
        </span>
      </div>
    </>
  );
}

export function HeroCarousel() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % spotlightSlides.length);
    }, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const slides = spotlightSlides;
  const goToPrevious = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goToNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label={t("hero.label")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (startX === null || endX === undefined || Math.abs(startX - endX) < 48) return;
        if (startX > endX) goToNext();
        else goToPrevious();
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`transition-opacity duration-1000 ${
            i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
          }`}
          aria-hidden={i === index ? undefined : true}
        >
          {slide.externalHref ? (
            <a
              href={slide.externalHref}
              target="_blank"
              rel="noreferrer noopener"
              className="block"
            >
              <SlideBody slide={slide} />
            </a>
          ) : (
            <Link to={slide.to as never} params={slide.params as never} className="block">
              <SlideBody slide={slide} />
            </Link>
          )}
        </div>
      ))}

      <div className="absolute inset-x-5 top-1/2 hidden -translate-y-1/2 justify-between md:flex md:px-5">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            goToPrevious();
          }}
          className="grid size-11 place-items-center border border-foreground/40 bg-background/70 transition-colors hover:bg-background"
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            goToNext();
          }}
          className="grid size-11 place-items-center border border-foreground/40 bg-background/70 transition-colors hover:bg-background"
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="absolute bottom-4 right-5 flex items-center gap-2 md:right-10">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${t("hero.goTo")} ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 w-6 transition-opacity ${
              i === index ? "gradient-accent opacity-100" : "bg-foreground/25 hover:opacity-70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
