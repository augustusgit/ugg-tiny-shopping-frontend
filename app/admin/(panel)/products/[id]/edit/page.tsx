"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { Spinner } from "@/components/ui/spinner";
import { useProduct } from "@/lib/hooks/use-products";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-danger">
        {(error as Error)?.message || "Product not found"}
      </p>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          Edit product
        </h1>
        <p className="mt-2 text-sm text-muted">{data.name}</p>
      </div>
      <ProductForm product={data} />
    </div>
  );
}
