import type { Metadata } from "next";
import { AdminsManager } from "@/components/admin/accounts/admins-manager";

export const metadata: Metadata = {
  title: "Manage admins",
};

export default function AdminAdminsPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          Admins
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create, update, verify, and soft-delete admin accounts.
        </p>
      </div>
      <AdminsManager />
    </div>
  );
}
