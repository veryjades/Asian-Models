import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  shuffle,
  spotlightLabels,
  spotlightSlides,
  type SpotlightSlide,
} from "@/lib/content/spotlight";

const INTERVAL = 6000;

function SlideBody({ slide }: { slide: SpotlightSlide }) {
  const { pick, lang } = useI18n();
  const label = spotlightLabels[slide.kind];

  return (
    <>
      <img
        src={slide.image}
        alt={pick(slide.titleEn, slide.titleZh)}
        width={1920}
        height={1024}
        className="h-[62vh] w-full object-cover md:h-[78vh]"
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
      </div>
    </>
  );
}

export function HeroCarousel() {
  const { t } = useI18n();
  // Random order per visit, decided after hydration so SSR markup stays stable.
  const [order, setOrder] = useState<SpotlightSlide[]>(spotlightSlides);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setOrder(shuffle(spotlightSlides));
  }, []);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % order.length);
    }, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, order.length]);

  const slides = useMemo(() => order, [order]);

  return (
    <section
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label={t("hero.label")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
