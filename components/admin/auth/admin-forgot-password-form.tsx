"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminSendResetCode,
  adminVerifyResetCode,
} from "@/lib/api/admin-auth";
import { formatApiError, useRateLimit } from "@/lib/hooks/use-rate-limit";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import {
  adminForgotSchema,
  adminVerifyCodeSchema,
} from "@/lib/validators/admin-auth";

type Step = "request" | "verify";

export function AdminForgotPasswordForm() {
  const router = useRouter();
  const rateLimit = useRateLimit();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "info" | "warning";
    title: string;
    items?: string[];
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function requestCode(e: React.FormEvent<HTMLFormElement>) {
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
    const parsed = adminForgotSchema.safeParse({ value: form.get("value") });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      const data = await adminSendResetCode(parsed.data.value);
      if (data.email) setEmail(data.email);
      setStep("verify");
      setAlert({
        variant: "success",
        title: "If the account exists, a verification code has been sent",
        items: [
          ...(data.email
            ? [`Use the code sent to ${data.email} to continue.`]
            : []),
          "Request another code after about 60 seconds if needed.",
        ],
      });
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

  async function verifyCode(e: React.FormEvent<HTMLFormElement>) {
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
    const parsed = adminVerifyCodeSchema.safeParse({
      email: form.get("email") || email,
      code: form.get("code"),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      const message = await adminVerifyResetCode(parsed.data);
      setAlert({ variant: "success", title: message });
      router.push(
        `/admin/reset-password?email=${encodeURIComponent(parsed.data.email)}&token=${encodeURIComponent(parsed.data.code)}`,
      );
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

      {step === "request" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <Input
            name="value"
            label="Email or username"
            placeholder="admin@example.com"
            error={errors.value}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={pending || rateLimit.isLimited}
          >
            {pending ? "Sending…" : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            name="code"
            label="Verification code"
            placeholder="6-digit code"
            error={errors.code}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={pending || rateLimit.isLimited}
          >
            {pending ? "Verifying…" : "Verify code"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => setStep("request")}
          >
            Back
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted">
        <Link href="/admin/login" className="hover:text-foreground">
          Back to admin sign in
        </Link>
      </p>
    </div>
  );
}
