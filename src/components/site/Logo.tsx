/**
 * Minimal J&J monogram. Pure SVG so it stays crisp, themes with
 * currentColor and needs no image asset.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 44 44"
        aria-hidden="true"
        className="h-7 w-7 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <rect x="0.7" y="0.7" width="42.6" height="42.6" />
        {/* left J */}
        <path d="M17 11v15.5a5 5 0 0 1-5 5 5 5 0 0 1-5-5" strokeLinecap="square" />
        {/* right J */}
        <path d="M37 11v15.5a5 5 0 0 1-5 5 5 5 0 0 1-5-5" strokeLinecap="square" />
        {/* ampersand tie */}
        <path d="M22 17.5v9" strokeLinecap="square" />
      </svg>
      <span className="label-sm tracking-[0.32em] leading-none">J&amp;J</span>
    </span>
  );
}
