"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/lib/data/countries";
import { CURRENCIES } from "@/lib/data/currencies";
import {
  useCreateCustomer,
  useUpdateCustomer,
} from "@/lib/hooks/use-admin-customers";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import type { CustomerAccount } from "@/lib/types/accounts";
import { isActiveFlag, omitEmpty } from "@/lib/utils/empty";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import {
  storeCustomerSchema,
  updateCustomerSchema,
} from "@/lib/validators/admin-accounts";

const CUSTOMER_ROLES = ["customer"];

export function CustomerForm({ user }: { user?: CustomerAccount }) {
  const router = useRouter();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer(user?.id ?? 0);
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
      country_code: String(form.get("country_code") || ""),
      currency_code: String(form.get("currency_code") || ""),
      timezone: String(form.get("timezone") || ""),
      sex: String(form.get("sex") || ""),
      dob: String(form.get("dob") || ""),
      description: String(form.get("description") || ""),
      role: String(form.get("role") || ""),
      active: form.get("active") === "on",
      ban_reason: String(form.get("ban_reason") || ""),
      mark_email_verified: form.get("mark_email_verified") === "on",
      mark_phone_verified: form.get("mark_phone_verified") === "on",
    };

    try {
      if (user) {
        const parsed = updateCustomerSchema.safeParse(raw);
        if (!parsed.success) {
          setErrors(zodFieldErrors(parsed.error));
          return;
        }
        await updateMutation.mutateAsync(omitEmpty({ ...parsed.data }));
        router.push(`/admin/users/${user.id}`);
      } else {
        const parsed = storeCustomerSchema.safeParse(raw);
        if (!parsed.success) {
          setErrors(zodFieldErrors(parsed.error));
          return;
        }
        const created = await createMutation.mutateAsync(
          omitEmpty({ ...parsed.data }) as typeof parsed.data,
        );
        router.push(`/admin/users/${created.id}`);
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
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      {alert ? (
        <Alert variant={alert.variant} title={alert.title} items={alert.items} />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="firstname"
          label="First name"
          defaultValue={user?.firstname ?? ""}
          error={errors.firstname}
        />
        <Input
          name="lastname"
          label="Last name"
          defaultValue={user?.lastname ?? ""}
          error={errors.lastname}
        />
      </div>
      <Input
        name="username"
        label="Username"
        defaultValue={user?.username ?? ""}
        error={errors.username}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        defaultValue={user?.email ?? ""}
        error={errors.email}
      />
      <Input
        name="mobile"
        label="Mobile"
        defaultValue={user?.mobile ?? ""}
        error={errors.mobile}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="country_code"
          label="Country"
          defaultValue={user?.country_code ?? "NG"}
          error={errors.country_code}
        >
          <option value="">—</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.country}
            </option>
          ))}
        </Select>
        <Select
          name="currency_code"
          label="Currency"
          defaultValue={user?.currency_code ?? "NGN"}
          error={errors.currency_code}
        >
          <option value="">—</option>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          name="dob"
          type="date"
          label="Date of birth"
          defaultValue={user?.dob ? String(user.dob).slice(0, 10) : ""}
          error={errors.dob}
        />
        <Select name="sex" label="Sex" defaultValue={user?.sex ?? ""}>
          <option value="">—</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
        <Input
          name="timezone"
          label="Timezone"
          defaultValue={user?.timezone ?? "Africa/Lagos"}
          error={errors.timezone}
        />
      </div>
      <Select
        name="role"
        label="Role"
        defaultValue={user?.roles?.[0] || "customer"}
        error={errors.role}
      >
        <option value="">No role change</option>
        {CUSTOMER_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </Select>
      <Textarea
        name="description"
        label="Description"
        defaultValue={user?.description ?? ""}
        error={errors.description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="password"
          type="password"
          label={user ? "New password (optional)" : "Password"}
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
      <div className="space-y-2 text-sm text-muted">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={user ? isActiveFlag(user.active) : true}
          />
          Active account
        </label>
        {user ? (
          <Input
            name="ban_reason"
            label="Ban reason"
            defaultValue={user.ban_reason ?? ""}
            error={errors.ban_reason}
          />
        ) : (
          <>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="mark_email_verified" />
              Mark email verified
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="mark_phone_verified" />
              Mark phone verified
            </label>
          </>
        )}
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : user ? "Save changes" : "Create user"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            router.push(user ? `/admin/users/${user.id}` : "/admin/users")
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
