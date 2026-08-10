"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";

export function SiteHeader() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-2xl tracking-tight text-brand"
        >
          Tiny Store
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-muted">
          <Link href="/#catalog" className="hover:text-foreground">
            Catalog
          </Link>
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/dashboard"}
              className="rounded-md bg-brand px-3 py-2 text-white hover:bg-brand-dark"
            >
              {user.role === "admin" ? "Admin" : "Dashboard"}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand px-3 py-2 text-white hover:bg-brand-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
