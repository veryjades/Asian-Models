export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <span className="shrink-0 border border-foreground px-1.5 py-1 text-lg font-light leading-none tracking-[0.08em]">
        J_J
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-[0.68rem] font-medium tracking-[0.22em] uppercase">
          J&amp;J Model Agency
        </span>
        <span className="mt-1 truncate text-[0.58rem] tracking-[0.12em] text-muted-foreground">
          寰星娛樂國際股份有限公司
        </span>
      </span>
    </span>
  );
}
