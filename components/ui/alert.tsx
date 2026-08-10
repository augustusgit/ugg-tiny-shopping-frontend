const styles = {
  error: "border-danger/30 bg-red-50 text-danger",
  success: "border-brand/30 bg-brand-soft text-brand-dark",
  info: "border-border bg-surface text-muted",
  warning: "border-accent/30 bg-orange-50 text-accent",
} as const;

export function Alert({
  variant = "info",
  title,
  children,
  items,
}: {
  variant?: keyof typeof styles;
  title?: string;
  children?: React.ReactNode;
  items?: string[];
}) {
  if (!title && !children && !items?.length) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-md border px-3 py-3 text-sm ${styles[variant]}`}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? (
        <div className={title ? "mt-1" : undefined}>{children}</div>
      ) : null}
      {items?.length ? (
        <ul className={`list-disc space-y-1 pl-4 ${title || children ? "mt-2" : ""}`}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
