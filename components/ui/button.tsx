import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-brand-soft focus-visible:ring-brand",
  ghost: "bg-transparent text-foreground hover:bg-brand-soft",
  danger: "bg-danger text-white hover:opacity-90 focus-visible:ring-danger",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
} as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
