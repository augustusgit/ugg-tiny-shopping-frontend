export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block size-5 animate-spin rounded-full border-2 border-brand/25 border-t-brand ${className}`}
      aria-hidden
    />
  );
}
