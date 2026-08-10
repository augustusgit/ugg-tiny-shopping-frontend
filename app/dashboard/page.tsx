"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-foreground">
          Welcome, {user?.name}
        </h1>
        <p className="mt-2 text-muted">
          Manage your Tiny Store account from here.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/profile"
          className="rounded-lg border border-border bg-surface p-5 transition hover:border-brand"
        >
          <h2 className="font-medium text-foreground">Profile</h2>
          <p className="mt-1 text-sm text-muted">
            Update your name and email address.
          </p>
        </Link>
        <Link
          href="/dashboard/security"
          className="rounded-lg border border-border bg-surface p-5 transition hover:border-brand"
        >
          <h2 className="font-medium text-foreground">Security</h2>
          <p className="mt-1 text-sm text-muted">
            Change your password and keep your account safe.
          </p>
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border bg-surface p-5 transition hover:border-brand sm:col-span-2"
        >
          <h2 className="font-medium text-foreground">Browse catalog</h2>
          <p className="mt-1 text-sm text-muted">
            Return to the storefront and explore products.
          </p>
        </Link>
      </div>
    </div>
  );
}
