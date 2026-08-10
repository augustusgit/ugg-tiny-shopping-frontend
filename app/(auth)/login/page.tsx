import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your dashboard or the admin panel."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
      <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
        Demo: admin@tinystore.com / admin123 · user@tinystore.com / user123
      </p>
    </AuthCard>
  );
}
