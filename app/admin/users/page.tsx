import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = {
  title: "Users",
};

export default function AdminUsersPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          Users
        </h1>
        <p className="mt-2 text-sm text-muted">
          Read-only list of registered accounts.
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
