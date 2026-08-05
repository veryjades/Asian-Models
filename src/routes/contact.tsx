import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Asian Stars Agency" },
      {
        name: "description",
        content:
          "Booking, press and general enquiries for Asian Stars Agency. Desks in Taipei, Tokyo, Seoul and Singapore.",
      },
      { property: "og:title", content: "Contact — Asian Stars Agency" },
      {
        property: "og:description",
        content: "Booking, press and general enquiries. Desks in Taipei, Tokyo, Seoul and Singapore.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const desks = [
  { city: "Taipei", cityZh: "台北", phone: "+886 2 2771 0088", email: "taipei@asianstars.agency" },
  { city: "Tokyo", cityZh: "東京", phone: "+81 3 6427 5510", email: "tokyo@asianstars.agency" },
  { city: "Seoul", cityZh: "首爾", phone: "+82 2 540 3320", email: "seoul@asianstars.agency" },
  { city: "Singapore", cityZh: "新加坡", phone: "+65 6221 4408", email: "sg@asianstars.agency" },
];

function ContactPage() {
  const { t, pick } = useI18n();

  return (
    <div>
      <div className="halftone h-24 w-full opacity-50" aria-hidden="true" />
      <div className="mx-auto max-w-[1600px] px-5 pb-10 md:px-10">
        <h1 className="text-3xl font-light md:text-4xl">{t("contact.title")}</h1>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div>
            <p className="label-xs text-muted-foreground">{t("contact.general")}</p>
            <a href="mailto:hello@asianstars.agency" className="mt-2 block text-sm underline">
              hello@asianstars.agency
            </a>
          </div>
          <div>
            <p className="label-xs text-muted-foreground">{t("contact.bookings")}</p>
            <a href="mailto:bookings@asianstars.agency" className="mt-2 block text-sm underline">
              bookings@asianstars.agency
            </a>
          </div>
          <div>
            <p className="label-xs text-muted-foreground">{t("contact.press")}</p>
            <a href="mailto:press@asianstars.agency" className="mt-2 block text-sm underline">
              press@asianstars.agency
            </a>
          </div>
        </div>

        <ul className="mt-14 grid gap-px bg-border md:grid-cols-2 xl:grid-cols-4">
          {desks.map((desk) => (
            <li key={desk.city} className="bg-background p-5">
              <p className="text-lg font-light">{pick(desk.city, desk.cityZh)}</p>
              <p className="mt-3 text-sm text-muted-foreground">{desk.phone}</p>
              <a href={`mailto:${desk.email}`} className="mt-1 block text-sm underline">
                {desk.email}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
