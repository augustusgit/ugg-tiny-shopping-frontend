import type { Metadata } from "next";
import { CustomerForm } from "@/components/admin/accounts/customer-form";

export const metadata: Metadata = {
  title: "New user",
};

export default function NewUserPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          New user
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create a customer account from the admin panel.
        </p>
      </div>
      <CustomerForm />
    </div>
  );
}
