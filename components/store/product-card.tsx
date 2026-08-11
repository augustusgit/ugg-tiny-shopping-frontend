import Link from "next/link";
import { ProductVisual } from "@/components/store/product-visual";
import { priceLabel, productHref } from "@/lib/api/catalog";
import type { CatalogProduct } from "@/lib/types/catalog";
import { isActiveFlag } from "@/lib/utils/empty";

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      href={productHref(product)}
      className="group flex flex-col gap-3 transition"
    >
      <div className="overflow-hidden transition duration-500 group-hover:scale-[1.02]">
        <ProductVisual
          name={product.name}
          brand={product.brand}
          featured={isActiveFlag(product.is_featured)}
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {product.brand || "Tiny Store"}
        </p>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl leading-tight text-foreground">
          {product.name}
        </h3>
        <p className="text-sm font-medium text-brand">{priceLabel(product)}</p>
        {product.available_inventories_count != null ? (
          <p className="text-xs text-muted">
            {product.available_inventories_count} option
            {product.available_inventories_count === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
