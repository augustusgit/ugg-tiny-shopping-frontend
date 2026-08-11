import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/accounts/admin-form";

export const metadata: Metadata = {
  title: "New admin",
};

export default function NewAdminPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          New admin
        </h1>
        <p className="mt-2 text-sm text-muted">
          Provision an admin with optional verification flags.
        </p>
      </div>
      <AdminForm />
    </div>
  );
}
