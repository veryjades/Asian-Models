import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/scouted")({
  head: () => ({
    meta: [
      { title: "Get Scouted — J&J Model Agency" },
      {
        name: "description",
        content:
          "Apply to J&J Model Agency. Send daylight, unretouched photographs and your measurements — we review every application.",
      },
      { property: "og:title", content: "Get Scouted — J&J Model Agency" },
      {
        property: "og:description",
        content: "Apply to J&J Model Agency. We review every application.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/scouted" },
    ],
    links: [{ rel: "canonical", href: "/scouted" }],
  }),
  component: ScoutedPage,
});

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="label-xs text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
      />
    </label>
  );
}

function ScoutedPage() {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    // Submissions are wired to the agency database once the Supabase project
    // credentials are connected; the form shape below is the stored record.
    window.setTimeout(() => setState("done"), 600);
  }

  return (
    <div>
      <div className="gradient-accent h-1 w-full" aria-hidden="true" />
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-10">
        <h1 className="text-3xl font-light md:text-4xl">{t("scout.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t("scout.intro")}</p>

        {state === "done" ? (
          <p className="mt-12 border border-border p-6 text-sm">{t("scout.thanks")}</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 grid gap-8 md:grid-cols-2">
            <Field label={t("scout.name")} name="name" required />
            <Field label={t("scout.age")} name="age" type="number" required />
            <Field label={t("scout.city")} name="city" required />
            <Field label={t("scout.email")} name="email" type="email" required />
            <Field label={t("scout.phone")} name="phone" type="tel" />
            <Field label={t("scout.height")} name="height" required />
            <Field label={t("scout.measurements")} name="measurements" />
            <Field label={t("scout.instagram")} name="instagram" />

            <label className="block md:col-span-2">
              <span className="label-xs text-muted-foreground">{t("scout.photos")} *</span>
              <input
                type="file"
                name="photos"
                accept="image/*"
                multiple
                required
                className="mt-2 w-full border border-dashed border-border p-4 text-sm"
              />
              <span className="mt-2 block text-xs text-muted-foreground">
                {t("scout.photosHint")}
              </span>
            </label>

            <label className="block md:col-span-2">
              <span className="label-xs text-muted-foreground">{t("scout.message")}</span>
              <textarea
                name="message"
                rows={4}
                className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={state === "sending"}
                className="label-xs border border-foreground px-6 py-3 transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
              >
                {state === "sending" ? t("scout.sending") : t("scout.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
