import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AdminLoginForm } from "@/components/admin/auth/admin-login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function AdminLoginPage() {
  return (
    <AuthCard
      title="Admin sign in"
      subtitle="Verify with password, then enter the email OTP code."
    >
      <AdminLoginForm />
    </AuthCard>
  );
}
