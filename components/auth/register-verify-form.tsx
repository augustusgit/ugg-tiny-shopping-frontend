"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  customerResendVerification,
  customerVerifyRegistration,
} from "@/lib/api/customer-auth";
import { formatApiError, useRateLimit } from "@/lib/hooks/use-rate-limit";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import { customerVerifyRegisterSchema } from "@/lib/validators/customer-auth";

export function RegisterVerifyForm() {
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
  const [resending, setResending] = useState(false);

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
    const parsed = customerVerifyRegisterSchema.safeParse({
      email: form.get("email"),
      code: form.get("code"),
      mobile_code: form.get("mobile_code"),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      const message = await customerVerifyRegistration(parsed.data);
      setAlert({ variant: "success", title: message });
      router.push("/dashboard");
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

  async function resend() {
    setAlert(null);
    if (rateLimit.isLimited) {
      setAlert({
        variant: "warning",
        title: `Too many attempts. Retry in ${rateLimit.secondsLeft}s.`,
      });
      return;
    }
    const email = searchParams.get("email");
    if (!email) {
      setAlert({ variant: "error", title: "Email is required to resend codes." });
      return;
    }
    setResending(true);
    try {
      const data = await customerResendVerification({
        email,
        mobile: searchParams.get("mobile") || undefined,
      });
      setAlert({
        variant: "success",
        title: "Verification code sent to email and phone number",
        items: [`Codes resent for ${data.email}`],
      });
      rateLimit.lockFor(60);
    } catch (error) {
      rateLimit.applyFromError(error);
      const formatted = formatApiError(error);
      setAlert({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    } finally {
      setResending(false);
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
          name="code"
          label="Email verification code"
          placeholder="6-digit email code"
          error={errors.code}
        />
        <Input
          name="mobile_code"
          label="Mobile verification code"
          placeholder="6-digit SMS code"
          error={errors.mobile_code}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={pending || rateLimit.isLimited}
        >
          {pending ? "Verifying…" : "Verify account"}
        </Button>
      </form>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={resending || rateLimit.isLimited}
        onClick={resend}
      >
        {resending ? "Resending…" : "Resend codes"}
      </Button>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="hover:text-foreground">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
