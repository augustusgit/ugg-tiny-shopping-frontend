/** Catalog API has no image field — use a branded visual placeholder. */
export function ProductVisual({
  name,
  brand,
  featured,
  className = "",
}: {
  name: string;
  brand?: string | null;
  featured?: boolean;
  className?: string;
}) {
  const label = (brand || name).slice(0, 18);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={`relative flex aspect-[4/5] items-end overflow-hidden rounded-md bg-[linear-gradient(145deg,#e4efe6_0%,#f6f3ee_45%,#efe0cc_100%)] ${className}`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(47,93,58,0.18), transparent 40%), radial-gradient(circle at 80% 70%, rgba(196,92,38,0.12), transparent 35%)",
        }}
        aria-hidden
      />
      <div className="absolute left-4 top-4 flex size-12 items-center justify-center rounded-full bg-brand/10 font-[family-name:var(--font-fraunces)] text-lg text-brand">
        {initials || "TS"}
      </div>
      {featured ? (
        <span className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.16em] text-accent">
          Featured
        </span>
      ) : null}
      <div className="relative w-full p-4">
        <p className="truncate text-xs uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}
