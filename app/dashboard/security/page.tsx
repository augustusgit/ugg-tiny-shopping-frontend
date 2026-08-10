import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export const metadata: Metadata = {
  title: "Security",
};

export default function SecurityPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          Security
        </h1>
        <p className="mt-2 text-sm text-muted">
          Update your password whenever you need.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
