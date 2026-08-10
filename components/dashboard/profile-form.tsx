"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/stores/auth-store";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import { profileSchema } from "@/lib/validators/auth";

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    variant: "error" | "success";
    title: string;
  } | null>(null);
  const [pending, setPending] = useState(false);

  if (!user) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setAlert(null);
    const form = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      // Local session update until Laravel customer profile endpoints are wired.
      updateUser({
        ...user!,
        name: parsed.data.name,
        email: parsed.data.email,
      });
      setAlert({ variant: "success", title: "Profile updated" });
    } catch (err) {
      setAlert({
        variant: "error",
        title: (err as Error).message || "Failed to update profile",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      {alert ? <Alert variant={alert.variant} title={alert.title} /> : null}
      <Input
        name="name"
        label="Full name"
        defaultValue={user.name}
        error={errors.name}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        defaultValue={user.email}
        error={errors.email}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
