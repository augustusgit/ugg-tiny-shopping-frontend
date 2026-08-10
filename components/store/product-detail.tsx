"use client";

import Image from "next/image";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useProduct } from "@/lib/hooks/use-products";

export function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, isError, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="text-danger">
          {(error as Error)?.message || "Product not found"}
        </p>
        <Link href="/" className="mt-4 inline-block text-brand underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-16">
      <div className="relative aspect-[4/5] animate-fade-in overflow-hidden rounded-md bg-brand-soft">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="animate-fade-up flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">
          {product.category}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl leading-tight text-foreground sm:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 text-2xl font-medium text-brand">
          ${product.price.toFixed(2)}
        </p>
        <p className="mt-6 max-w-prose text-base leading-relaxed text-muted">
          {product.description}
        </p>
        <p className="mt-6 text-sm">
          <span
            className={`inline-flex rounded-md px-2.5 py-1 ${product.stock > 0 ? "bg-brand-soft text-brand" : "bg-red-50 text-danger"}`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </p>
        <Link
          href="/#catalog"
          className="mt-10 inline-flex h-11 w-fit items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-brand-soft"
        >
          Back to catalog
        </Link>
      </div>
    </article>
  );
}
