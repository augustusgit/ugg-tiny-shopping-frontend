"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/api/auth";
import { resetPasswordSchema } from "@/lib/validators/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultToken = searchParams.get("token") ?? "";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setErrors({});
    const form = new FormData(e.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      token: form.get("token"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
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
      await resetPassword(parsed.data.token, parsed.data.password);
      router.push("/login");
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        name="token"
        label="Reset token"
        defaultValue={defaultToken}
        error={errors.token}
      />
      <Input
        name="password"
        type="password"
        label="New password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password}
      />
      <Input
        name="confirmPassword"
        type="password"
        label="Confirm password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="hover:text-foreground">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
