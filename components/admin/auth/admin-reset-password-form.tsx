"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminResetPassword } from "@/lib/api/admin-auth";
import { formatApiError, useRateLimit } from "@/lib/hooks/use-rate-limit";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import { adminResetSchema } from "@/lib/validators/admin-auth";

export function AdminResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rateLimit = useRateLimit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "info" | "warning";
    title: string;
    items?: string[];
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);
    setErrors({});
    if (rateLimit.isLimited) {
      setAlert({
        variant: "warning",
        title: `Too many attempts. Retry in ${rateLimit.secondsLeft}s.`,
      });
      return;
    }

    const form = new FormData(e.currentTarget);
    const parsed = adminResetSchema.safeParse({
      email: form.get("email"),
      token: form.get("token"),
      password: form.get("password"),
      password_confirmation: form.get("password_confirmation"),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      const message = await adminResetPassword(parsed.data);
      setAlert({ variant: "success", title: message });
      router.push("/admin/login");
    } catch (error) {
      rateLimit.applyFromError(error);
      const formatted = formatApiError(error);
      setAlert({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {alert ? (
        <Alert variant={alert.variant} title={alert.title} items={alert.items} />
      ) : null}
      {rateLimit.isLimited ? (
        <Alert variant="warning" title={`Rate limited · wait ${rateLimit.secondsLeft}s`} />
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          defaultValue={searchParams.get("email") ?? ""}
          error={errors.email}
        />
        <Input
          name="token"
          label="Verification code"
          defaultValue={searchParams.get("token") ?? ""}
          error={errors.token}
        />
        <Input
          name="password"
          type="password"
          label="New password"
          autoComplete="new-password"
          error={errors.password}
        />
        <Input
          name="password_confirmation"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.password_confirmation}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={pending || rateLimit.isLimited}
        >
          {pending ? "Updating…" : "Reset password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        <Link href="/admin/login" className="hover:text-foreground">
          Back to admin sign in
        </Link>
      </p>
    </div>
  );
}
