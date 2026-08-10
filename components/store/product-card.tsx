import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col gap-3 transition"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-brand-soft">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {product.category}
        </p>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl leading-tight text-foreground">
          {product.name}
        </h3>
        <p className="text-sm font-medium text-brand">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
