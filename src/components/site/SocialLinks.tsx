import { useI18n } from "@/lib/i18n";

/** Public channels. Facebook and Instagram only — no closed-loop networks. */
export const socialLinks = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/jjmodelagency",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/jjmodelagency",
  },
] as const;

function Icon({ id }: { id: (typeof socialLinks)[number]["id"] }) {
  if (id === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.2c0-.9.3-1.5 1.5-1.5h1.7V4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2V10H7.4v3h2.7v8z" />
    </svg>
  );
}

export function SocialLinks({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="label-xs text-muted-foreground">{t("footer.follow")}</span>
      {socialLinks.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={link.label}
          title={link.label}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon id={link.id} />
        </a>
      ))}
    </div>
  );
}
