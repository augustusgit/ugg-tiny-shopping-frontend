"use client";

import { ProductCard } from "@/components/store/product-card";
import { Spinner } from "@/components/ui/spinner";
import { useProducts } from "@/lib/hooks/use-products";

export function ProductGrid() {
  const { data, isLoading, isError, error } = useProducts();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-12 text-center text-danger">
        {(error as Error).message || "Failed to load products"}
      </p>
    );
  }

  if (!data?.length) {
    return (
      <p className="py-12 text-center text-muted">No products yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {data.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
