import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/site/Logo";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border">
      <div className="halftone-up h-16 w-full opacity-40" aria-hidden="true" />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-5 pb-10 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Taipei · Tokyo · Seoul · Singapore
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <Link to="/about" className="label-xs text-muted-foreground hover:text-foreground">
            {t("nav.about")}
          </Link>
          <Link to="/contact" className="label-xs text-muted-foreground hover:text-foreground">
            {t("nav.contact")}
          </Link>
          <Link to="/scouted" className="label-xs text-muted-foreground hover:text-foreground">
            {t("nav.scouted")}
          </Link>
        </div>
        <p className="label-xs text-muted-foreground">
          © {new Date().getFullYear()} — {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
