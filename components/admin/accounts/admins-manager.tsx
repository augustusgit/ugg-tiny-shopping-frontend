"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { StatsStrip } from "@/components/admin/accounts/stats-strip";
import {
  useAdminAccountActions,
  useAdminAccountStats,
  useAdminAccounts,
} from "@/lib/hooks/use-admin-accounts";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import { displayName, formatDate } from "@/lib/utils/empty";

export function AdminsManager() {
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState("");
  const [trashed, setTrashed] = useState("");
  const [page, setPage] = useState(1);
  const [flash, setFlash] = useState<{
    variant: "error" | "success";
    title: string;
    items?: string[];
  } | null>(null);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      verified: verified || undefined,
      trashed: trashed || undefined,
      page,
      per_page: 15,
      sort_by: "created_at",
      sort_dir: "desc" as const,
    }),
    [search, verified, trashed, page],
  );

  const list = useAdminAccounts(filters);
  const stats = useAdminAccountStats();
  const actions = useAdminAccountActions();

  const totalPages = Math.max(
    1,
    Math.ceil((list.data?.total ?? 0) / (filters.per_page || 15)),
  );

  async function runAction(
    label: string,
    fn: () => Promise<unknown>,
    confirmText?: string,
  ) {
    if (confirmText && !confirm(confirmText)) return;
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

  return (
    <div className="space-y-6">
      {stats.data ? (
        <StatsStrip
          items={[
            { label: "Total", value: stats.data.total_admins },
            { label: "Verified", value: stats.data.verified_admins },
            { label: "Unverified", value: stats.data.unverified_admins },
            { label: "Phone verified", value: stats.data.phone_verified_admins },
            { label: "Trashed", value: stats.data.trashed_admins },
            { label: "Last 30 days", value: stats.data.recent_admins },
          ]}
        />
      ) : null}

      {flash ? (
        <Alert variant={flash.variant} title={flash.title} items={flash.items} />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Name, email, username…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <Select
          label="Email verified"
          value={verified}
          onChange={(e) => {
            setPage(1);
            setVerified(e.target.value);
          }}
        >
          <option value="">Any</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </Select>
        <Select
          label="Trash"
          value={trashed}
          onChange={(e) => {
            setPage(1);
            setTrashed(e.target.value);
          }}
        >
          <option value="">Active</option>
          <option value="only">Trashed only</option>
        </Select>
        <Link
          href="/admin/admins/new"
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          New admin
        </Link>
      </div>

      {list.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : list.isError ? (
        <Alert
          variant="error"
          title={formatApiError(list.error).message}
          items={formatApiError(list.error).errors}
        />
      ) : (
        <>
          <div className="overflow-x-auto border-y border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-border">
                  <th className="px-2 py-3 font-medium">Admin</th>
                  <th className="px-2 py-3 font-medium">Roles</th>
                  <th className="px-2 py-3 font-medium">Verified</th>
                  <th className="px-2 py-3 font-medium">Created</th>
                  <th className="px-2 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.data?.items.map((admin) => (
                  <tr key={admin.id} className="border-b border-border/70">
                    <td className="px-2 py-3">
                      <Link
                        href={`/admin/admins/${admin.id}`}
                        className="font-medium text-foreground hover:text-brand"
                      >
                        {displayName(admin)}
                      </Link>
                      <p className="text-xs text-muted">{admin.email}</p>
                    </td>
                    <td className="px-2 py-3 text-muted">
                      {(admin.roles || []).join(", ") || "—"}
                    </td>
                    <td className="px-2 py-3">
                      <span className="text-xs">
                        {admin.is_email_verified ? "Email ✓" : "Email —"} ·{" "}
                        {admin.is_phone_verified ? "Phone ✓" : "Phone —"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-muted">
                      {formatDate(admin.created_at)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/admins/${admin.id}`}
                          className="inline-flex h-8 items-center rounded-md border border-border px-2 text-xs hover:bg-brand-soft"
                        >
                          Manage
                        </Link>
                        {admin.deleted_at ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                runAction("Admin restored", () =>
                                  actions.restoreAdmin.mutateAsync(admin.id),
                                )
                              }
                            >
                              Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() =>
                                runAction(
                                  "Admin permanently deleted",
                                  () =>
                                    actions.forceDeleteAdmin.mutateAsync(
                                      admin.id,
                                    ),
                                  "Permanently delete this admin?",
                                )
                              }
                            >
                              Force delete
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              runAction(
                                "Admin moved to trash",
                                () => actions.deleteAdmin.mutateAsync(admin.id),
                                "Move this admin to trash?",
                              )
                            }
                          >
                            Trash
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!list.data?.items.length ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-10 text-center text-muted">
                      No admins found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted">
            <p>
              {list.data?.total ?? 0} total · page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
