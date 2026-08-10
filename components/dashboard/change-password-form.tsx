"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/lib/api/user";
import { useAuthStore } from "@/lib/stores/auth-store";
import { changePasswordSchema } from "@/lib/validators/auth";

export function ChangePasswordForm() {
  const token = useAuthStore((s) => s.token);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    setSuccess("");
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const parsed = changePasswordSchema.safeParse({
      currentPassword: form.get("currentPassword"),
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
      await changePassword(token, {
        currentPassword: parsed.data.currentPassword,
        password: parsed.data.password,
      });
      setSuccess("Password changed");
      formEl.reset();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
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
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      {success ? <p className="text-sm text-brand">{success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
