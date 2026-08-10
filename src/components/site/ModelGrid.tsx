import { Link } from "@tanstack/react-router";
import { AgencyImage } from "@/components/site/AgencyImage";
import type { Model } from "@/lib/content/types";
import { useI18n } from "@/lib/i18n";

export function ModelGrid({ models }: { models: Model[] }) {
  const { pick, t } = useI18n();

  if (models.length === 0) {
    return <p className="px-5 py-20 text-sm text-muted-foreground md:px-10">{t("board.empty")}</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-px bg-border md:grid-cols-3 xl:grid-cols-4">
      {models.map((model) => (
        <li key={model.slug} className="bg-background">
          <Link
            to="/models/$board/$slug"
            params={{ board: model.board, slug: model.slug }}
            className="portrait-hover group block"
          >
            <div className="relative">
              <AgencyImage
                src={model.portrait}
                alt={`${model.name} — ${model.city}`}
                loading="lazy"
                width={768}
                height={1024}
                aspectRatio="3 / 4"
                fit="contain"
              />
              <div className="gradient-accent-soft pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <div className="px-3 py-3">
              <p className="label-xs text-foreground">{pick(model.name, model.nameZh)}</p>
              <p className="mt-1.5 text-[0.6875rem] tracking-widest text-muted-foreground uppercase">
                {pick(model.city, model.cityZh)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
