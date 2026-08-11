"use client";

import { use } from "react";
import { ProductDetail } from "@/components/admin/products/product-detail";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="animate-fade-up">
      <ProductDetail id={Number(id)} />
    </div>
  );
}
