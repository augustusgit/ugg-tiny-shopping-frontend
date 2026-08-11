"use client";

import Link from "next/link";
import { useState } from "react";
import { CustomerForm } from "@/components/admin/accounts/customer-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  useAdminCustomer,
  useCustomerAccountActions,
} from "@/lib/hooks/use-admin-customers";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import { displayName, formatDate, isActiveFlag } from "@/lib/utils/empty";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import {
  banReasonSchema,
  resetPasswordSchema,
  syncRolesSchema,
} from "@/lib/validators/admin-accounts";

export function CustomerDetail({ id }: { id: number }) {
  const detail = useAdminCustomer(id);
  const actions = useCustomerAccountActions();
  const [flash, setFlash] = useState<{
    variant: "error" | "success";
    title: string;
    items?: string[];
  } | null>(null);
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [banErrors, setBanErrors] = useState<Record<string, string>>({});

  async function run(label: string, fn: () => Promise<unknown>) {
    setFlash(null);
    try {
      await fn();
      setFlash({ variant: "success", title: label });
    } catch (error) {
      const formatted = formatApiError(error);
      setFlash({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    }
  }

  if (detail.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    const formatted = formatApiError(detail.error);
    return (
      <Alert
        variant="error"
        title={formatted.message || "User not found"}
        items={formatted.errors}
      />
    );
  }

  const user = detail.data;
  const active = isActiveFlag(user.active);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            User #{user.id}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl">
            {displayName(user)}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {user.email}
            {user.mobile ? ` · ${user.mobile}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            {active ? "Active" : "Inactive"}
            {user.ban_reason ? ` · banned: ${user.ban_reason}` : ""}
            {" · "}
            created {formatDate(user.created_at)}
            {user.deleted_at ? ` · trashed ${formatDate(user.deleted_at)}` : ""}
          </p>
        </div>
        <Link href="/admin/users" className="text-sm text-brand underline">
          Back to users
        </Link>
      </div>

      {flash ? (
        <Alert variant={flash.variant} title={flash.title} items={flash.items} />
      ) : null}

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
          Account actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              run("User status toggled", () =>
                actions.toggleStatus.mutateAsync({ id: user.id }),
              )
            }
          >
            Toggle status
          </Button>
          {!user.is_email_verified ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                run("User email verified", () =>
                  actions.verifyEmail.mutateAsync(user.id),
                )
              }
            >
              Verify email
            </Button>
          ) : null}
          {!user.is_phone_verified ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                run("User phone verified", () =>
                  actions.verifyPhone.mutateAsync(user.id),
                )
              }
            >
              Verify phone
            </Button>
          ) : null}
          {active ? null : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                run("User unbanned", () => actions.unban.mutateAsync(user.id))
              }
            >
              Unban
            </Button>
          )}
          {user.deleted_at ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  run("User restored", () =>
                    actions.restoreCustomer.mutateAsync(user.id),
                  )
                }
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (!confirm("Permanently delete this user?")) return;
                  run("User permanently deleted", () =>
                    actions.forceDeleteCustomer.mutateAsync(user.id),
                  );
                }}
              >
                Force delete
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (!confirm("Move this user to trash?")) return;
                run("User moved to trash", () =>
                  actions.deleteCustomer.mutateAsync(user.id),
                );
              }}
            >
              Move to trash
            </Button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl">Ban</h2>
        <form
          className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setBanErrors({});
            const form = new FormData(e.currentTarget);
            const parsed = banReasonSchema.safeParse({
              ban_reason: form.get("ban_reason"),
            });
            if (!parsed.success) {
              setBanErrors(zodFieldErrors(parsed.error));
              return;
            }
            run("User banned", () =>
              actions.ban.mutateAsync({
                id: user.id,
                ban_reason: parsed.data.ban_reason,
              }),
            );
          }}
        >
          <div className="flex-1">
            <Input
              name="ban_reason"
              label="Ban reason"
              defaultValue={user.ban_reason ?? ""}
              error={banErrors.ban_reason}
            />
          </div>
          <Button type="submit" size="sm" variant="danger">
            Ban user
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
          Roles
        </h2>
        <form
          className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setRoleErrors({});
            const form = new FormData(e.currentTarget);
            const roles = String(form.get("roles") || "")
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean);
            const parsed = syncRolesSchema.safeParse({ roles });
            if (!parsed.success) {
              setRoleErrors(zodFieldErrors(parsed.error));
              return;
            }
            run("User roles updated", () =>
              actions.syncRoles.mutateAsync({ id: user.id, roles }),
            );
          }}
        >
          <div className="flex-1">
            <Input
              name="roles"
              label="Roles (comma-separated)"
              defaultValue={(user.roles || ["customer"]).join(", ")}
              error={roleErrors.roles}
            />
          </div>
          <Button type="submit" size="sm">
            Sync roles
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
          Reset password
        </h2>
        <form
          className="grid max-w-xl gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPasswordErrors({});
            const form = new FormData(e.currentTarget);
            const parsed = resetPasswordSchema.safeParse({
              password: form.get("password"),
              password_confirmation: form.get("password_confirmation"),
            });
            if (!parsed.success) {
              setPasswordErrors(zodFieldErrors(parsed.error));
              return;
            }
            run("User password reset", () =>
              actions.resetPassword.mutateAsync({
                id: user.id,
                ...parsed.data,
              }),
            );
            e.currentTarget.reset();
          }}
        >
          <Input
            name="password"
            type="password"
            label="New password"
            error={passwordErrors.password}
          />
          <Input
            name="password_confirmation"
            type="password"
            label="Confirm password"
            error={passwordErrors.password_confirmation}
          />
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">
              Reset password
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
          Edit profile
        </h2>
        <CustomerForm user={user} />
      </section>
    </div>
  );
}
