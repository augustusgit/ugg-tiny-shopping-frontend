import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="User registration only — admins are provisioned separately."
    >
      <RegisterForm />
    </AuthCard>
  );
}
