import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function Select({
  label,
  error,
  className = "",
  id,
  children,
  ...props
}: Props) {
  const inputId = id || props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-foreground">{label}</span> : null}
      <select
        id={inputId}
        className={`h-11 rounded-md border border-border bg-surface px-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${error ? "border-danger" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
