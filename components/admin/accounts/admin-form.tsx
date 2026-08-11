"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useCreateAdmin,
  useUpdateAdmin,
} from "@/lib/hooks/use-admin-accounts";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import type { AdminAccount } from "@/lib/types/accounts";
import { omitEmpty } from "@/lib/utils/empty";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import {
  storeAdminSchema,
  updateAdminSchema,
} from "@/lib/validators/admin-accounts";

const ADMIN_ROLES = ["admin"];

export function AdminForm({ admin }: { admin?: AdminAccount }) {
  const router = useRouter();
  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin(admin?.id ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    variant: "error" | "success";
    title: string;
    items?: string[];
  } | null>(null);

  const pending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setAlert(null);
    const form = new FormData(e.currentTarget);
    const raw = {
      firstname: String(form.get("firstname") || ""),
      lastname: String(form.get("lastname") || ""),
      username: String(form.get("username") || ""),
      email: String(form.get("email") || ""),
      mobile: String(form.get("mobile") || ""),
      password: String(form.get("password") || ""),
      password_confirmation: String(form.get("password_confirmation") || ""),
      role: String(form.get("role") || ""),
      mark_email_verified: form.get("mark_email_verified") === "on",
      mark_phone_verified: form.get("mark_phone_verified") === "on",
    };

    try {
      if (admin) {
        const parsed = updateAdminSchema.safeParse(raw);
        if (!parsed.success) {
          setErrors(zodFieldErrors(parsed.error));
          return;
        }
        const payload = omitEmpty({ ...parsed.data });
        await updateMutation.mutateAsync(payload);
        setAlert({ variant: "success", title: "Admin updated" });
        router.push(`/admin/admins/${admin.id}`);
      } else {
        const parsed = storeAdminSchema.safeParse(raw);
        if (!parsed.success) {
          setErrors(zodFieldErrors(parsed.error));
          return;
        }
        const created = await createMutation.mutateAsync(
          omitEmpty({ ...parsed.data }) as typeof parsed.data,
        );
        router.push(`/admin/admins/${created.id}`);
      }
    } catch (error) {
      const formatted = formatApiError(error);
      setAlert({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {alert ? (
        <Alert variant={alert.variant} title={alert.title} items={alert.items} />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="firstname"
          label="First name"
          defaultValue={admin?.firstname ?? ""}
          error={errors.firstname}
        />
        <Input
          name="lastname"
          label="Last name"
          defaultValue={admin?.lastname ?? ""}
          error={errors.lastname}
        />
      </div>
      <Input
        name="username"
        label="Username"
        defaultValue={admin?.username ?? ""}
        error={errors.username}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        defaultValue={admin?.email ?? ""}
        error={errors.email}
      />
      <Input
        name="mobile"
        label="Mobile"
        defaultValue={admin?.mobile ?? ""}
        error={errors.mobile}
      />
      <Select
        name="role"
        label="Role"
        defaultValue={admin?.roles?.[0] || "admin"}
        error={errors.role}
      >
        <option value="">No role change</option>
        {ADMIN_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="password"
          type="password"
          label={admin ? "New password (optional)" : "Password"}
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
      </div>
      {!admin ? (
        <div className="space-y-2 text-sm text-muted">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="mark_email_verified" />
            Mark email verified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="mark_phone_verified" />
            Mark phone verified
          </label>
        </div>
      ) : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : admin ? "Save changes" : "Create admin"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            router.push(admin ? `/admin/admins/${admin.id}` : "/admin/admins")
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
