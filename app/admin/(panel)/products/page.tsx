import type { Metadata } from "next";
import Link from "next/link";
import { ProductsTable } from "@/components/admin/products-table";

export const metadata: Metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
            Products
          </h1>
          <p className="mt-2 text-sm text-muted">
            Create, edit, and remove catalog items.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          New product
        </Link>
      </div>
      <ProductsTable />
    </div>
  );
}
