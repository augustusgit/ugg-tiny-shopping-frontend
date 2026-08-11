import Link from "next/link";
import { CatalogBrowser } from "@/components/store/catalog-browser";
import { FeaturedStrip } from "@/components/store/featured-strip";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#e4efe6_0%,transparent_45%),radial-gradient(circle_at_85%_10%,#f0e6d8_0%,transparent_40%),linear-gradient(180deg,#f6f3ee_0%,#efe8dc_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20">
          <p className="animate-fade-up font-[family-name:var(--font-fraunces)] text-5xl leading-none tracking-tight text-brand sm:text-7xl md:text-8xl">
            Tiny Store
          </p>
          <h1 className="animate-fade-up stagger-1 mt-5 max-w-xl font-[family-name:var(--font-fraunces)] text-2xl leading-snug text-foreground sm:text-3xl">
            Everyday goods for quieter rooms.
          </h1>
          <p className="animate-fade-up stagger-2 mt-3 max-w-md text-base text-muted">
            Browse published catalog items from the live store — filter by brand,
            price, and availability.
          </p>
          <div className="animate-fade-up stagger-3 mt-8">
            <Link
              href="#catalog"
              className="inline-flex h-12 items-center rounded-md bg-brand px-5 text-sm font-medium text-white transition hover:bg-brand-dark"
            >
              Browse catalog
            </Link>
          </div>
        </div>
      </section>

      <FeaturedStrip />

      <section id="catalog" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-foreground">
            Catalog
          </h2>
          <p className="mt-2 text-sm text-muted">
            Search, filter by brand or price, and open any item for options.
          </p>
        </div>
        <CatalogBrowser />
      </section>
    </>
  );
}
