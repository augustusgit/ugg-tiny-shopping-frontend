"use client";

import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { Spinner } from "@/components/ui/spinner";
import { useFeaturedProducts } from "@/lib/hooks/use-catalog";
import { formatApiError } from "@/lib/hooks/use-rate-limit";

export function FeaturedStrip() {
  const { data, isLoading, isError, error } = useFeaturedProducts(8);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-sm text-danger">{formatApiError(error).message}</p>
    );
  }

  if (!data?.items.length) {
    return null;
  }

  return (
    <section className="border-b border-border bg-surface/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl">
              Featured
            </h2>
            <p className="mt-2 text-sm text-muted">
              Highlighted pieces from the live catalog.
            </p>
          </div>
          <Link href="#catalog" className="text-sm text-brand underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {data.items.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
