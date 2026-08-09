import { useEffect, useRef, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * Quick booking: contact person, phone and email only.
 * The submitted record is kept in the shape the agency backend will store,
 * so wiring it to the database and the service mailbox later is a single
 * function swap — no UI change.
 */
export type QuickBookingRequest = {
  contactName: string;
  phone: string;
  email: string;
  note?: string | undefined;
  createdAt: string;
};

export function QuickBooking({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) firstRef.current?.focus();
  }, [open]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const request: QuickBookingRequest = {
      contactName: String(form.get("contactName") ?? "").trim().slice(0, 100),
      phone: String(form.get("phone") ?? "").trim().slice(0, 40),
      email: String(form.get("email") ?? "").trim().slice(0, 200),
      note: String(form.get("note") ?? "").trim().slice(0, 500) || undefined,
      createdAt: new Date().toISOString(),
    };
    if (!request.contactName || !request.phone || !request.email) return;
    setState("sending");
    // TODO: persist to the agency database and forward to the service mailbox
    // once the database and the deployed domain are connected.
    console.info("quick booking request", request);
    window.setTimeout(() => setState("done"), 500);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setState("idle");
        }}
        className={`label-xs border border-foreground bg-foreground px-3 py-2 text-background transition-colors hover:bg-background hover:text-foreground ${className}`}
      >
        {t("booking.cta")}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/30 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("booking.title")}
            className="w-full max-w-md border border-border bg-background"
          >
            <div className="gradient-accent h-1 w-full" aria-hidden="true" />
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="label-xs text-foreground">{t("booking.title")}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t("booking.intro")}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="label-xs text-muted-foreground hover:text-foreground"
              >
                {t("assistant.close")}
              </button>
            </div>

            {state === "done" ? (
              <div className="px-5 py-8">
                <p className="text-sm">{t("booking.thanks")}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="label-xs mt-6 border border-foreground px-3 py-2 transition-colors hover:bg-foreground hover:text-background"
                >
                  {t("assistant.close")}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5 px-5 py-6">
                <label className="block">
                  <span className="label-xs text-muted-foreground">{t("booking.contact")} *</span>
                  <input
                    ref={firstRef}
                    name="contactName"
                    required
                    maxLength={100}
                    className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                  />
                </label>
                <label className="block">
                  <span className="label-xs text-muted-foreground">{t("booking.phone")} *</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    maxLength={40}
                    className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                  />
                </label>
                <label className="block">
                  <span className="label-xs text-muted-foreground">{t("booking.email")} *</span>
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                  />
                </label>
                <label className="block">
                  <span className="label-xs text-muted-foreground">{t("booking.note")}</span>
                  <textarea
                    name="note"
                    rows={3}
                    maxLength={500}
                    className="mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                  />
                </label>
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="label-xs border border-foreground px-4 py-3 transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
                >
                  {state === "sending" ? t("booking.sending") : t("booking.submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
