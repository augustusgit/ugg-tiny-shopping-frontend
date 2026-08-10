import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AdminResetPasswordForm } from "@/components/admin/auth/admin-reset-password-form";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Admin reset password",
};

export default function AdminResetPasswordPage() {
  return (
    <AuthCard
      title="Set new admin password"
      subtitle="Use the verified code with your email to finish the reset."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
      >
        <AdminResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
