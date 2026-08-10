import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New product",
};

export default function NewProductPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          New product
        </h1>
        <p className="mt-2 text-sm text-muted">
          Add an item to the Tiny Store catalog.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
