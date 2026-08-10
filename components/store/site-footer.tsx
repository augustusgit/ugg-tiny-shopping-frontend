import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-[family-name:var(--font-fraunces)] text-lg text-foreground">
          Tiny Store
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-foreground">
            Account
          </Link>
          <Link href="/#catalog" className="hover:text-foreground">
            Catalog
          </Link>
        </div>
        <p>Everyday goods, carefully chosen.</p>
      </div>
    </footer>
  );
}
