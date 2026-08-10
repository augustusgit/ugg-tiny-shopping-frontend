"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/api/auth";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export function ForgotPasswordForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ message: string; token?: string } | null>(
    null,
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setErrors({});
    setResult(null);
    const form = new FormData(e.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({
      email: form.get("email"),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? "form");
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setPending(true);
    try {
      const res = await forgotPassword(parsed.data.email);
      setResult(res);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        {formError ? <p className="text-sm text-danger">{formError}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      {result ? (
        <div className="rounded-md border border-border bg-brand-soft/50 p-4 text-sm">
          <p className="text-foreground">{result.message}</p>
          {result.token ? (
            <p className="mt-2">
              Demo token:{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 text-brand">
                {result.token}
              </code>
              <br />
              <Link
                href={`/reset-password?token=${result.token}`}
                className="mt-2 inline-block text-brand underline"
              >
                Continue to reset password
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="hover:text-foreground">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
