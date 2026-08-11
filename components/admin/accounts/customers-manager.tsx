"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatsStrip } from "@/components/admin/accounts/stats-strip";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  useAdminCustomerStats,
  useAdminCustomers,
  useCustomerAccountActions,
} from "@/lib/hooks/use-admin-customers";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import { displayName, formatDate, isActiveFlag } from "@/lib/utils/empty";

export function CustomersManager() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
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
      active: active || undefined,
      verified: verified || undefined,
      trashed: trashed || undefined,
      page,
      per_page: 15,
      sort_by: "created_at",
      sort_dir: "desc" as const,
    }),
    [search, active, verified, trashed, page],
  );

  const list = useAdminCustomers(filters);
  const stats = useAdminCustomerStats();
  const actions = useCustomerAccountActions();
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
            { label: "Total", value: stats.data.total_users },
            { label: "Active", value: stats.data.active_users },
            { label: "Inactive", value: stats.data.inactive_users },
            { label: "Email verified", value: stats.data.verified_users },
            { label: "Trashed", value: stats.data.trashed_users },
            { label: "Last 30 days", value: stats.data.recent_users },
          ]}
        />
      ) : null}

      {flash ? (
        <Alert variant={flash.variant} title={flash.title} items={flash.items} />
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Name, email, mobile, referral…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <Select
          label="Status"
          value={active}
          onChange={(e) => {
            setPage(1);
            setActive(e.target.value);
          }}
        >
          <option value="">Any</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
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
          href="/admin/users/new"
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          New user
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
                  <th className="px-2 py-3 font-medium">User</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Country</th>
                  <th className="px-2 py-3 font-medium">Created</th>
                  <th className="px-2 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.data?.items.map((user) => {
                  const activeUser = isActiveFlag(user.active);
                  return (
                    <tr key={user.id} className="border-b border-border/70">
                      <td className="px-2 py-3">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-medium hover:text-brand"
                        >
                          {displayName(user)}
                        </Link>
                        <p className="text-xs text-muted">{user.email}</p>
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`text-xs ${activeUser ? "text-brand" : "text-danger"}`}
                        >
                          {activeUser ? "Active" : "Inactive"}
                        </span>
                        {user.ban_reason ? (
                          <p className="text-xs text-muted">{user.ban_reason}</p>
                        ) : null}
                      </td>
                      <td className="px-2 py-3 text-muted">
                        {user.country_code || "—"}
                      </td>
                      <td className="px-2 py-3 text-muted">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="inline-flex h-8 items-center rounded-md border border-border px-2 text-xs hover:bg-brand-soft"
                          >
                            Manage
                          </Link>
                          {user.deleted_at ? (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  runAction("User restored", () =>
                                    actions.restoreCustomer.mutateAsync(user.id),
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
                                    "User permanently deleted",
                                    () =>
                                      actions.forceDeleteCustomer.mutateAsync(
                                        user.id,
                                      ),
                                    "Permanently delete this user?",
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
                                  "User moved to trash",
                                  () =>
                                    actions.deleteCustomer.mutateAsync(user.id),
                                  "Move this user to trash?",
                                )
                              }
                            >
                              Trash
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!list.data?.items.length ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-10 text-center text-muted">
                      No users found.
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
