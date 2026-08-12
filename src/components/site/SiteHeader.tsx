import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/site/Logo";
import { QuickBooking } from "@/components/site/QuickBooking";

type NavItem = { to: string; params?: Record<string, string>; key: string };

const navItems: NavItem[] = [
  { to: "/models/$board", params: { board: "women" }, key: "nav.women" },
  { to: "/models/$board", params: { board: "men" }, key: "nav.men" },
  { to: "/models/$board", params: { board: "new-faces" }, key: "nav.newFaces" },
  { to: "/models/$board", params: { board: "talent" }, key: "nav.talent" },
  { to: "/news", key: "nav.news" },
  { to: "/about", key: "nav.about" },
  { to: "/contact", key: "nav.contact" },
];

function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-px border border-border">
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`label-xs px-2.5 py-1.5 transition-colors ${
          lang === "en"
            ? "gradient-accent text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={`label-xs px-2.5 py-1.5 transition-colors ${
          lang === "zh"
            ? "gradient-accent text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        繁中
      </button>
    </div>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isModelProfile = /^\/models\/[^/]+\/[^/]+/.test(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="text-foreground" aria-label="J&J Model Agency">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to as never}
              params={item.params as never}
              className="label-xs text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "label-xs text-foreground" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isModelProfile && <QuickBooking className="hidden md:inline-block" />}
          <Link
            to="/scouted"
            className="label-xs hidden border border-foreground px-3 py-2 text-foreground transition-colors hover:bg-foreground hover:text-background md:inline-block"
          >
            {t("nav.scouted")}
          </Link>
          <LangToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="label-xs px-1 py-2 text-foreground lg:hidden"
            aria-expanded={open}
          >
            {open ? t("nav.close") : t("nav.menu")}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.to as never}
                  params={item.params as never}
                  className="label-sm text-foreground"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/scouted" className="label-sm text-foreground">
                {t("nav.scouted")}
              </Link>
            </li>
            {!isModelProfile && (
              <li>
                <QuickBooking />
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
