import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { VideoUploadField } from "@/components/site/VideoUploadField";

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
  const [photoGate, setPhotoGate] = useState({
    halfBody: false,
    fullBody: false,
    additional: false,
  });
  const [photoError, setPhotoError] = useState("");
  const canSubmitPhotos = photoGate.halfBody && photoGate.fullBody;

  function onPhotoChange(kind: "halfBody" | "fullBody" | "additional", files: FileList | null) {
    const hasFile = Boolean(files?.length);
    setPhotoGate((current) => {
      const next = { ...current, [kind]: hasFile };
      if (next.halfBody && next.fullBody) setPhotoError("");
      return next;
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const halfBody = form.elements.namedItem("halfBodyPhoto") as HTMLInputElement | null;
    const fullBody = form.elements.namedItem("fullBodyPhoto") as HTMLInputElement | null;
    const hasRequiredPhotos = Boolean(halfBody?.files?.length) && Boolean(fullBody?.files?.length);

    if (!hasRequiredPhotos) {
      setPhotoError(t("scout.photosError"));
      return;
    }

    setPhotoError("");
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
        <div className="mt-6 border border-border p-4 text-sm">
          <p className="font-normal">{t("scout.photosGate")}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t("scout.photosNatural")}</p>
        </div>

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
            <Field label={t("scout.socialLinks")} name="socialLinks" />

            <label className="block md:col-span-2">
              <span className="label-xs text-muted-foreground">{t("scout.modelCard")}</span>
              <textarea
                name="modelCard"
                rows={5}
                className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
              />
            </label>

            <div className="grid gap-4 md:col-span-2">
              <div>
                <p className="label-xs text-muted-foreground">{t("scout.photos")} *</p>
                <p className="mt-2 text-xs text-muted-foreground">{t("scout.photosHint")}</p>
              </div>
              <label className="block">
                <span className="label-xs text-muted-foreground">{t("scout.photoHalf")} *</span>
                <input
                  type="file"
                  name="halfBodyPhoto"
                  accept="image/*"
                  required
                  onChange={(e) => onPhotoChange("halfBody", e.currentTarget.files)}
                  className="mt-2 w-full border border-dashed border-border p-4 text-sm"
                />
              </label>
              <label className="block">
                <span className="label-xs text-muted-foreground">{t("scout.photoFull")} *</span>
                <input
                  type="file"
                  name="fullBodyPhoto"
                  accept="image/*"
                  required
                  onChange={(e) => onPhotoChange("fullBody", e.currentTarget.files)}
                  className="mt-2 w-full border border-dashed border-border p-4 text-sm"
                />
              </label>
              <label className="block">
                <span className="label-xs text-muted-foreground">{t("scout.photoAdditional")}</span>
                <input
                  type="file"
                  name="additionalPhoto"
                  accept="image/*"
                  onChange={(e) => onPhotoChange("additional", e.currentTarget.files)}
                  className="mt-2 w-full border border-dashed border-border p-4 text-sm"
                />
              </label>
              {photoError ? (
                <p className="text-sm text-destructive" role="alert" aria-live="polite">
                  {photoError}
                </p>
              ) : null}
            </div>

            <VideoUploadField className="md:col-span-2" name="video" />

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
                disabled={state === "sending" || !canSubmitPhotos}
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
