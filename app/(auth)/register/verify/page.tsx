import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterVerifyForm } from "@/components/auth/register-verify-form";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Verify registration",
};

export default function RegisterVerifyPage() {
  return (
    <AuthCard
      title="Verify your account"
      subtitle="Enter the email and mobile codes sent after registration."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
      >
        <RegisterVerifyForm />
      </Suspense>
    </AuthCard>
  );
}
