import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-[family-name:var(--font-fraunces)] text-3xl text-brand"
          >
            Tiny Store
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-2xl text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 shadow-[0_12px_40px_-28px_rgba(28,36,28,0.45)]">
          {children}
        </div>
      </div>
    </div>
  );
}
