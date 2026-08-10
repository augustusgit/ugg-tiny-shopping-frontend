import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AdminForgotPasswordForm } from "@/components/admin/auth/admin-forgot-password-form";

export const metadata: Metadata = {
  title: "Admin forgot password",
};

export default function AdminForgotPasswordPage() {
  return (
    <AuthCard
      title="Admin password reset"
      subtitle="Request a verification code, confirm it, then set a new password."
    >
      <AdminForgotPasswordForm />
    </AuthCard>
  );
}
