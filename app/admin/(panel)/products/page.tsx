import type { Metadata } from "next";
import { ProductsManager } from "@/components/admin/products/products-manager";

export const metadata: Metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          Products
        </h1>
        <p className="mt-2 text-sm text-muted">
          Manage catalog items, drafts, inventories, and publishing.
        </p>
      </div>
      <ProductsManager />
    </div>
  );
}
