"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminForm } from "@/components/admin/accounts/admin-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  useAdminAccount,
  useAdminAccountActions,
} from "@/lib/hooks/use-admin-accounts";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import { displayName, formatDate } from "@/lib/utils/empty";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import {
  resetPasswordSchema,
  syncRolesSchema,
} from "@/lib/validators/admin-accounts";

export function AdminDetail({ id }: { id: number }) {
  const detail = useAdminAccount(id);
  const actions = useAdminAccountActions();
  const [flash, setFlash] = useState<{
    variant: "error" | "success";
    title: string;
    items?: string[];
  } | null>(null);
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

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
        title={formatted.message || "Admin not found"}
        items={formatted.errors}
      />
    );
  }

  const admin = detail.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Admin #{admin.id}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl">
            {displayName(admin)}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {admin.email}
            {admin.mobile ? ` · ${admin.mobile}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            Created {formatDate(admin.created_at)}
            {admin.creator ? ` · by ${admin.creator.name}` : ""}
            {admin.deleted_at ? ` · trashed ${formatDate(admin.deleted_at)}` : ""}
          </p>
        </div>
        <Link
          href="/admin/admins"
          className="text-sm text-brand underline"
        >
          Back to admins
        </Link>
      </div>

      {flash ? (
        <Alert variant={flash.variant} title={flash.title} items={flash.items} />
      ) : null}

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-2">
          {!admin.is_email_verified ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                run("Admin email verified", () =>
                  actions.verifyEmail.mutateAsync(admin.id),
                )
              }
            >
              Verify email
            </Button>
          ) : null}
          {!admin.is_phone_verified ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                run("Admin phone verified", () =>
                  actions.verifyPhone.mutateAsync(admin.id),
                )
              }
            >
              Verify phone
            </Button>
          ) : null}
          {admin.deleted_at ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  run("Admin restored", () =>
                    actions.restoreAdmin.mutateAsync(admin.id),
                  )
                }
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (!confirm("Permanently delete this admin?")) return;
                  run("Admin permanently deleted", () =>
                    actions.forceDeleteAdmin.mutateAsync(admin.id),
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
                if (!confirm("Move this admin to trash?")) return;
                run("Admin moved to trash", () =>
                  actions.deleteAdmin.mutateAsync(admin.id),
                );
              }}
            >
              Move to trash
            </Button>
          )}
        </div>
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
            run("Admin roles updated", () =>
              actions.syncRoles.mutateAsync({ id: admin.id, roles }),
            );
          }}
        >
          <div className="flex-1">
            <Input
              name="roles"
              label="Roles (comma-separated)"
              defaultValue={(admin.roles || ["admin"]).join(", ")}
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
            run("Admin password reset", () =>
              actions.resetPassword.mutateAsync({
                id: admin.id,
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
        <AdminForm admin={admin} />
      </section>
    </div>
  );
}
