"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/store/product-card";
import { ProductVisual } from "@/components/store/product-visual";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/api/catalog";
import {
  useCatalogProduct,
  useRelatedProducts,
} from "@/lib/hooks/use-catalog";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import type { CatalogInventory } from "@/lib/types/catalog";
import { isActiveFlag } from "@/lib/utils/empty";

function inventoryPrice(inv: CatalogInventory) {
  return inv.has_offer && inv.offer_price != null
    ? Number(inv.offer_price)
    : Number(inv.current_price ?? inv.sale_price);
}

export function ProductDetail({ id }: { id: string }) {
  const detail = useCatalogProduct(id);
  const related = useRelatedProducts(id, 4);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const inventories = useMemo<CatalogInventory[]>(
    () => detail.data?.inventories ?? [],
    [detail.data?.inventories],
  );
  const selected = useMemo(() => {
    if (!inventories.length) return null;
    return (
      inventories.find((inv) => inv.id === selectedId) ||
      inventories.find((inv) => !inv.is_out_of_stock) ||
      inventories[0]
    );
  }, [inventories, selectedId]);

  if (detail.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    const formatted = formatApiError(detail.error);
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Alert
          variant="error"
          title={formatted.message || "Product not found"}
          items={formatted.errors}
        />
        <Link href="/#catalog" className="mt-6 inline-block text-brand underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  const product = detail.data;
  const price = selected
    ? inventoryPrice(selected)
    : product.min_price != null
      ? Number(product.min_price)
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <article className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductVisual
          name={product.name}
          brand={product.brand}
          featured={isActiveFlag(product.is_featured)}
          className="animate-fade-in"
        />

        <div className="animate-fade-up flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            {product.brand || "Tiny Store"}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl leading-tight text-foreground sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-medium text-brand">
              {formatPrice(price)}
            </p>
            {selected?.has_offer ? (
              <p className="text-sm text-muted line-through">
                {formatPrice(selected.sale_price)}
              </p>
            ) : null}
            {product.min_price != null &&
            product.max_price != null &&
            Number(product.min_price) !== Number(product.max_price) &&
            !selected ? (
              <p className="text-sm text-muted">
                from {formatPrice(product.min_price)}
              </p>
            ) : null}
          </div>

          {product.description ? (
            <p className="mt-6 max-w-prose text-base leading-relaxed text-muted">
              {product.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            {product.model_number ? (
              <span>Model {product.model_number}</span>
            ) : null}
            {isActiveFlag(product.downloadable) ? (
              <span className="rounded bg-brand-soft px-2 py-1 text-brand">
                Digital
              </span>
            ) : null}
            {isActiveFlag(product.requires_shipping) ? (
              <span className="rounded bg-brand-soft px-2 py-1 text-brand">
                Ships
              </span>
            ) : null}
            {selected?.free_shipping ? (
              <span className="rounded bg-brand-soft px-2 py-1 text-brand">
                Free shipping
              </span>
            ) : null}
          </div>

          {inventories.length > 0 ? (
            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium">
                {inventories.length > 1 ? "Choose an option" : "Availability"}
              </p>
              <div className="space-y-2">
                {inventories.map((inv) => {
                  const active = selected?.id === inv.id;
                  return (
                    <button
                      key={inv.id}
                      type="button"
                      disabled={inv.is_out_of_stock}
                      onClick={() => setSelectedId(inv.id)}
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm transition ${
                        active
                          ? "border-brand bg-brand-soft"
                          : "border-border hover:border-brand/50"
                      } ${inv.is_out_of_stock ? "opacity-50" : ""}`}
                    >
                      <span>
                        <span className="font-medium">
                          {inv.title || inv.sku}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {inv.condition}
                          {inv.sku ? ` · ${inv.sku}` : ""}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="font-medium text-brand">
                          {formatPrice(inventoryPrice(inv))}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {inv.is_out_of_stock
                            ? "Out of stock"
                            : `${inv.stock_quantity} available`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">
              No sellable inventory is currently available.
            </p>
          )}

          {selected?.key_features ? (
            <div className="mt-6">
              <p className="text-sm font-medium">Key features</p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">
                {selected.key_features}
              </p>
            </div>
          ) : null}

          <Link
            href="/#catalog"
            className="mt-10 inline-flex h-11 w-fit items-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-brand-soft"
          >
            Back to catalog
          </Link>
        </div>
      </article>

      {related.isLoading ? (
        <div className="mt-20 flex justify-center">
          <Spinner />
        </div>
      ) : related.data?.items.length ? (
        <section className="mt-20 border-t border-border pt-14">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl">
            Related
          </h2>
          <p className="mt-2 text-sm text-muted">
            More from {product.brand || "the catalog"}.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.data.items.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
