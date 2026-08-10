"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin, adminVerifyLogin } from "@/lib/api/admin-auth";
import { formatApiError, useRateLimit } from "@/lib/hooks/use-rate-limit";
import { useAuthStore } from "@/lib/stores/auth-store";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import {
  adminLoginCodeSchema,
  adminLoginCredentialsSchema,
} from "@/lib/validators/admin-auth";

type Step = "credentials" | "otp";

export function AdminLoginForm() {
  const router = useRouter();
  const setAdminSession = useAuthStore((s) => s.setAdminSession);
  const rateLimit = useRateLimit();
  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "info" | "warning";
    title: string;
    items?: string[];
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function submitCredentials(e: React.FormEvent<HTMLFormElement>) {
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

    const parsed = adminLoginCredentialsSchema.safeParse({
      username,
      password,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      const data = await adminVerifyLogin(parsed.data);
      setEmailHint(data.email);
      setStep("otp");
      setAlert({
        variant: "success",
        title: "Verification code sent",
        items: [
          `Check the inbox for ${data.email}. Enter the 6-digit code to finish signing in.`,
          "You can request another code after about 60 seconds if needed.",
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

  async function submitOtp(e: React.FormEvent<HTMLFormElement>) {
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
    const parsed = adminLoginCodeSchema.safeParse({
      code: form.get("code"),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      const data = await adminLogin({
        username,
        password,
        code: parsed.data.code,
      });
      setAdminSession(data);
      router.push("/admin");
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

      {step === "credentials" ? (
        <form onSubmit={submitCredentials} className="space-y-4">
          <Input
            name="username"
            label="Username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            error={errors.username}
          />
          <Input
            name="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={errors.password}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={pending || rateLimit.isLimited}
          >
            {pending ? "Sending code…" : "Continue"}
          </Button>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="space-y-4">
          <p className="text-sm text-muted">
            Signing in as <strong className="text-foreground">{username}</strong>
            {emailHint ? (
              <>
                {" "}
                · code sent to{" "}
                <strong className="text-foreground">{emailHint}</strong>
              </>
            ) : null}
          </p>
          <Input
            name="code"
            label="Verification code"
            placeholder="6-digit code"
            autoComplete="one-time-code"
            error={errors.code}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={pending || rateLimit.isLimited}
          >
            {pending ? "Verifying…" : "Sign in to admin"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              setStep("credentials");
              setAlert(null);
            }}
          >
            Back
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:justify-between">
        <Link href="/admin/forgot-password" className="hover:text-foreground">
          Forgot password?
        </Link>
        <Link href="/login" className="hover:text-foreground">
          Customer sign in
        </Link>
      </div>
    </div>
  );
}
