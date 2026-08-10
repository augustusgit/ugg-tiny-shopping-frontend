"use client";

import Link from "next/link";
import { useAdminUsers, useProducts } from "@/lib/hooks/use-products";
import { Spinner } from "@/components/ui/spinner";

export default function AdminOverviewPage() {
  const products = useProducts();
  const users = useAdminUsers();

  if (products.isLoading || users.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          Admin overview
        </h1>
        <p className="mt-2 text-muted">
          Snapshot of catalog and accounts in the mock API.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted">Products</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            {products.data?.length ?? 0}
          </p>
          <Link
            href="/admin/products"
            className="mt-3 inline-block text-sm text-brand underline"
          >
            Manage products
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted">Users</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            {users.data?.length ?? 0}
          </p>
          <Link
            href="/admin/users"
            className="mt-3 inline-block text-sm text-brand underline"
          >
            View users
          </Link>
        </div>
      </div>
    </div>
  );
}
