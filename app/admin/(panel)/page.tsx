"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useAdminAccountStats } from "@/lib/hooks/use-admin-accounts";
import { useAdminCustomerStats } from "@/lib/hooks/use-admin-customers";
import { useAdminProductStats } from "@/lib/hooks/use-admin-products";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import { Alert } from "@/components/ui/alert";

export default function AdminOverviewPage() {
  const products = useAdminProductStats();
  const admins = useAdminAccountStats();
  const users = useAdminCustomerStats();

  const loading = products.isLoading || admins.isLoading || users.isLoading;

  if (loading) {
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
          Live stats from the Laravel admin API.
        </p>
      </div>

      {products.isError ? (
        <Alert
          variant="error"
          title={`Products: ${formatApiError(products.error).message}`}
        />
      ) : null}
      {admins.isError ? (
        <Alert
          variant="error"
          title={`Admins: ${formatApiError(admins.error).message}`}
        />
      ) : null}
      {users.isError ? (
        <Alert
          variant="error"
          title={`Users: ${formatApiError(users.error).message}`}
        />
      ) : null}

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="border-b border-border pb-4">
          <p className="text-sm text-muted">Products</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            {products.data?.total_products ?? "—"}
          </p>
          <Link
            href="/admin/products"
            className="mt-3 inline-block text-sm text-brand underline"
          >
            Manage products
          </Link>
        </div>
        <div className="border-b border-border pb-4">
          <p className="text-sm text-muted">Admins</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            {admins.data?.total_admins ?? "—"}
          </p>
          <Link
            href="/admin/admins"
            className="mt-3 inline-block text-sm text-brand underline"
          >
            Manage admins
          </Link>
        </div>
        <div className="border-b border-border pb-4">
          <p className="text-sm text-muted">Users</p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-brand">
            {users.data?.total_users ?? "—"}
          </p>
          <Link
            href="/admin/users"
            className="mt-3 inline-block text-sm text-brand underline"
          >
            Manage users
          </Link>
        </div>
      </div>
    </div>
  );
}
