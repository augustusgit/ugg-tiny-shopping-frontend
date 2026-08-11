export function StatsStrip({
  items,
}: {
  items: { label: string; value: number | string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="border-b border-border pb-2">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {item.label}
          </p>
          <p className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl text-brand">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
