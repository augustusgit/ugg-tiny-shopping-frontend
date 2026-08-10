"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/api/user";
import { useAuthStore } from "@/lib/stores/auth-store";
import { profileSchema } from "@/lib/validators/auth";

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  if (!user) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    setSuccess("");
    const form = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse({
      name: form.get("name"),
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
      const updated = await updateProfile(token, parsed.data);
      updateUser(updated);
      setSuccess("Profile updated");
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
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
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      {success ? <p className="text-sm text-brand">{success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
