"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import { changePasswordSchema } from "@/lib/validators/auth";

export function ChangePasswordForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "info";
    title: string;
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setAlert(null);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const parsed = changePasswordSchema.safeParse({
      currentPassword: form.get("currentPassword"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      setAlert({
        variant: "info",
        title:
          "Use Forgot password to change credentials against the Laravel API for now.",
      });
      formEl.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      {alert ? <Alert variant={alert.variant} title={alert.title} /> : null}
      <Input
        name="currentPassword"
        type="password"
        label="Current password"
        autoComplete="current-password"
        error={errors.currentPassword}
      />
      <Input
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        error={errors.password}
      />
      <Input
        name="confirmPassword"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
