import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Option = {
  value: string;
  en: string;
  zh: string;
};

const bookingTypes: Option[] = [
  { value: "still", en: "Still shoot", zh: "平面拍攝" },
  { value: "commercial", en: "Advertising / commercial", zh: "廣告 / 商業拍攝" },
  { value: "editorial", en: "Fashion / editorial", zh: "時尚 / Editorial" },
  { value: "video", en: "Video / motion", zh: "影片 / 影像" },
  { value: "event", en: "Event / appearance", zh: "活動 / 出席" },
  { value: "other", en: "Other", zh: "其他" },
];

const timeSlots: Option[] = [
  { value: "morning", en: "Morning", zh: "上午" },
  { value: "afternoon", en: "Afternoon", zh: "下午" },
  { value: "evening", en: "Evening", zh: "晚上" },
  { value: "full-day", en: "Full day", zh: "全天" },
  { value: "undecided", en: "Not decided yet", zh: "尚未確定" },
];

const locations: Option[] = [
  { value: "taiwan", en: "Taiwan", zh: "台灣" },
  { value: "japan", en: "Japan", zh: "日本" },
  { value: "korea", en: "Korea", zh: "韓國" },
  { value: "hong-kong", en: "Hong Kong", zh: "香港" },
  { value: "other", en: "Other", zh: "其他" },
];

const usageMarkets: Option[] = [
  { value: "taiwan", en: "Taiwan", zh: "台灣" },
  { value: "japan", en: "Japan", zh: "日本" },
  { value: "korea", en: "Korea", zh: "韓國" },
  { value: "asia", en: "Asia regional", zh: "亞洲區域" },
  { value: "global", en: "Global", zh: "全球" },
  { value: "undecided", en: "Not decided yet", zh: "尚未確定" },
];

const usagePeriods: Option[] = [
  { value: "one-day", en: "1 day", zh: "1 天" },
  { value: "one-week", en: "1 week", zh: "1 週" },
  { value: "one-month", en: "1 month", zh: "1 個月" },
  { value: "three-months", en: "3 months", zh: "3 個月" },
  { value: "other", en: "Other", zh: "其他" },
];

export type QuickBookingRequest = {
  modelId?: string | undefined;
  modelName?: string | undefined;
  bookingType: string;
  expectedDate: string;
  timeSlot: string;
  location: string;
  usageMarket: string;
  usagePeriod: string;
  contactName: string;
  company: string;
  email: string;
  phone: string;
  note?: string | undefined;
  createdAt: string;
};

type QuickBookingProps = {
  className?: string;
  modelId?: string | undefined;
  modelName?: string | undefined;
};

function FieldLabel({ children }: { children: string }) {
  return <span className="label-xs text-muted-foreground">{children}</span>;
}

function NativeSelect({
  label,
  name,
  options,
  required = true,
}: {
  label: string;
  name: string;
  options: Option[];
  required?: boolean;
}) {
  const { pick } = useI18n();
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select
        name={name}
        required={required}
        className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {pick(option.en, option.zh)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QuickBooking({ className = "", modelId, modelName }: QuickBookingProps) {
  const { pick, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const firstRef = useRef<HTMLInputElement>(null);

  const title = modelName
    ? pick(`I want to book: ${modelName}`, `我想要預約：${modelName}`)
    : t("booking.title");

  useEffect(() => {
    if (open) window.setTimeout(() => firstRef.current?.focus(), 0);
  }, [open]);

  function openDialog() {
    window.setTimeout(() => setOpen(true), 0);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const request: QuickBookingRequest = {
      modelId,
      modelName,
      bookingType: String(form.get("bookingType") ?? ""),
      expectedDate: String(form.get("expectedDate") ?? ""),
      timeSlot: String(form.get("timeSlot") ?? ""),
      location: String(form.get("location") ?? ""),
      usageMarket: String(form.get("usageMarket") ?? ""),
      usagePeriod: String(form.get("usagePeriod") ?? ""),
      contactName: String(form.get("contactName") ?? "")
        .trim()
        .slice(0, 100),
      company: String(form.get("company") ?? "")
        .trim()
        .slice(0, 120),
      email: String(form.get("email") ?? "")
        .trim()
        .slice(0, 200),
      phone: String(form.get("phone") ?? "")
        .trim()
        .slice(0, 40),
      note:
        String(form.get("note") ?? "")
          .trim()
          .slice(0, 500) || undefined,
      createdAt: new Date().toISOString(),
    };

    if (!request.contactName || !request.company || !request.email || !request.phone) return;

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
        onClick={openDialog}
        className={`label-xs border border-foreground bg-foreground px-3 py-2 text-background transition-colors hover:bg-background hover:text-foreground ${className}`}
      >
        {t("booking.cta")}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70]" role="presentation">
          <button
            type="button"
            aria-label={pick("Close booking dialog", "關閉預約視窗")}
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-booking-title"
            className="fixed inset-x-0 bottom-0 z-[80] max-h-[88vh] overflow-hidden border bg-background shadow-lg sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%]"
          >
            <div className="gradient-accent h-1 w-full" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 opacity-70 transition-opacity hover:opacity-100"
              aria-label={t("assistant.close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="max-h-[calc(88vh-0.25rem)] overflow-y-auto">
              <header className="border-b border-border px-5 py-5 text-left">
                <h2 id="quick-booking-title" className="text-xl font-light leading-tight">
                  {title}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">{t("booking.intro")}</p>
              </header>

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
                <form onSubmit={onSubmit} className="grid gap-6 px-5 py-6">
                  <fieldset>
                    <legend className="label-xs text-muted-foreground">
                      {pick("Booking type", "預約類型")}
                    </legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {bookingTypes.map((option, index) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 border border-border px-3 py-2 text-sm"
                        >
                          <input
                            ref={index === 0 ? firstRef : undefined}
                            type="radio"
                            name="bookingType"
                            value={option.value}
                            defaultChecked={index === 0}
                            className="accent-foreground"
                          />
                          {pick(option.en, option.zh)}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <FieldLabel>{pick("Expected date", "預計日期")}</FieldLabel>
                      <input
                        name="expectedDate"
                        type="date"
                        required
                        className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                      />
                    </label>
                    <NativeSelect
                      label={pick("Expected time", "預計時段")}
                      name="timeSlot"
                      options={timeSlots}
                    />
                    <NativeSelect
                      label={pick("Location", "預計地點")}
                      name="location"
                      options={locations}
                    />
                    <NativeSelect
                      label={pick("Usage market", "使用地區 / 市場")}
                      name="usageMarket"
                      options={usageMarkets}
                    />
                    <NativeSelect
                      label={pick("Usage period", "預計使用期間")}
                      name="usagePeriod"
                      options={usagePeriods}
                    />
                  </div>

                  <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
                    <label className="block">
                      <FieldLabel>{t("booking.contact")} *</FieldLabel>
                      <input
                        name="contactName"
                        required
                        maxLength={100}
                        className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>{pick("Company", "公司")} *</FieldLabel>
                      <input
                        name="company"
                        required
                        maxLength={120}
                        className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>{t("booking.email")} *</FieldLabel>
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={200}
                        className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>{t("booking.phone")} *</FieldLabel>
                      <input
                        name="phone"
                        type="tel"
                        required
                        maxLength={40}
                        className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <FieldLabel>{t("booking.note")}</FieldLabel>
                    <textarea
                      name="note"
                      rows={3}
                      maxLength={500}
                      className="mt-2 w-full resize-none border border-border bg-transparent p-3 text-sm outline-none focus:border-foreground"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="label-xs sticky bottom-0 border border-foreground bg-background px-4 py-3 transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
                  >
                    {state === "sending" ? t("booking.sending") : t("booking.submit")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
