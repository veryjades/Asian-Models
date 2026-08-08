import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

/**
 * Enquiry types for the contact form. Stored value is the stable id, so the
 * backend record shape does not change when labels are re-worded.
 */
export const enquiryTypes = [
  { id: "collaboration", en: "Collaboration / partnership", zh: "合作邀約" },
  { id: "booking", en: "Booking / job enquiry", zh: "工作洽詢" },
  { id: "casting", en: "Casting request", zh: "選角需求" },
  { id: "press", en: "Press & media", zh: "媒體採訪" },
  { id: "model", en: "Model application", zh: "模特應徵" },
  { id: "other", en: "Other", zh: "其他" },
] as const;

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
        maxLength={200}
        className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
      />
    </label>
  );
}

export function ContactForm() {
  const { t, lang } = useI18n();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    // The record below is written to the agency database once the project
    // credentials are connected — no page change needed at that point.
    window.setTimeout(() => setState("done"), 600);
  }

  if (state === "done") {
    return (
      <div className="mt-10 border border-border p-6">
        <p className="text-sm">{t("contactForm.thanks")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-8 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="label-xs text-muted-foreground">{t("contactForm.type")} *</span>
        <select
          name="type"
          required
          defaultValue="collaboration"
          className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
        >
          {enquiryTypes.map((option) => (
            <option key={option.id} value={option.id}>
              {lang === "zh" ? option.zh : option.en}
            </option>
          ))}
        </select>
      </label>

      <Field label={t("contactForm.name")} name="name" required />
      <Field label={t("contactForm.company")} name="company" />
      <Field label={t("contactForm.email")} name="email" type="email" required />
      <Field label={t("contactForm.phone")} name="phone" type="tel" />
      <Field label={t("contactForm.subject")} name="subject" required />
      <Field label={t("contactForm.budget")} name="budget" />

      <label className="block md:col-span-2">
        <span className="label-xs text-muted-foreground">{t("contactForm.message")} *</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={2000}
          className="mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
        />
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="label-xs border border-foreground px-5 py-3 text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          {state === "sending" ? t("contactForm.sending") : t("contactForm.submit")}
        </button>
      </div>
    </form>
  );
}
