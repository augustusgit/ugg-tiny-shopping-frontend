"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Shield,
  Users,
  X,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUiStore } from "@/lib/stores/ui-store";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/admins", label: "Admins", icon: Shield },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-6xl">
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface p-5 transition md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="mb-8 flex items-center justify-between">
              <Link
                href="/"
                className="font-[family-name:var(--font-fraunces)] text-xl text-brand"
              >
                Tiny Store
              </Link>
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mb-4 text-xs uppercase tracking-[0.14em] text-muted">
              Admin
            </p>
            <nav className="space-y-1">
              {links.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/admin"
                    ? pathname === href
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-brand-soft text-brand" : "text-muted hover:bg-brand-soft/60 hover:text-foreground"}`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-8 border-t border-border pt-4">
              <p className="mb-2 truncate text-sm font-medium">{user?.name}</p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-2"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Log out
              </Button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 items-center gap-3 border-b border-border px-4 md:px-6">
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <p className="text-sm text-muted">Admin panel</p>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
        {sidebarOpen ? (
          <button
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close overlay"
          />
        ) : null}
      </div>
    </AuthGuard>
  );
}
