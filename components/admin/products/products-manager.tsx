"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatsStrip } from "@/components/admin/accounts/stats-strip";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  useAdminProductStats,
  useAdminProducts,
  useProductMutations,
} from "@/lib/hooks/use-admin-products";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import { PRODUCT_STATUSES } from "@/lib/types/products";
import { formatDate, isActiveFlag } from "@/lib/utils/empty";

export function ProductsManager() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [active, setActive] = useState("");
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
      status: status || undefined,
      active: active || undefined,
      trashed: trashed || undefined,
      page,
      per_page: 15,
      sort_by: "created_at",
      sort_dir: "desc" as const,
    }),
    [search, status, active, trashed, page],
  );

  const list = useAdminProducts(filters);
  const stats = useAdminProductStats();
  const actions = useProductMutations();
  const totalPages = Math.max(
    1,
    Math.ceil((list.data?.total ?? 0) / (filters.per_page || 15)),
  );

  async function run(
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
            { label: "Total", value: stats.data.total_products },
            { label: "Draft", value: stats.data.draft_products },
            { label: "Pending", value: stats.data.pending_review_products },
            { label: "Published", value: stats.data.published_products },
            { label: "Active", value: stats.data.active_products },
            { label: "Recent", value: stats.data.recent_products },
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
            placeholder="Name, brand, slug…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <Select
          label="Status"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">Any</option>
          {PRODUCT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Select>
        <Select
          label="Active"
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
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
        >
          New product wizard
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
                  <th className="px-2 py-3 font-medium">Product</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Price</th>
                  <th className="px-2 py-3 font-medium">Wizard</th>
                  <th className="px-2 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.data?.items.map((product) => {
                  const incomplete =
                    product.status === "draft" ||
                    product.status === "pending_review";
                  return (
                    <tr key={product.id} className="border-b border-border/70">
                      <td className="px-2 py-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium hover:text-brand"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted">
                          {product.brand || "No brand"} ·{" "}
                          {isActiveFlag(product.active) ? "Active" : "Inactive"}
                        </p>
                      </td>
                      <td className="px-2 py-3">
                        {product.status_label || product.status}
                      </td>
                      <td className="px-2 py-3 text-muted">
                        {product.min_price != null
                          ? `$${Number(product.min_price).toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="px-2 py-3 text-muted">
                        Step {product.wizard_step || 1}/3
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex h-8 items-center rounded-md border border-border px-2 text-xs hover:bg-brand-soft"
                          >
                            Manage
                          </Link>
                          {incomplete && !product.deleted_at ? (
                            <Link
                              href={`/admin/products/${product.id}/wizard`}
                              className="inline-flex h-8 items-center rounded-md border border-border px-2 text-xs hover:bg-brand-soft"
                            >
                              Resume wizard
                            </Link>
                          ) : null}
                          {!product.deleted_at ? (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  run("Status toggled", () =>
                                    actions.toggleStatus.mutateAsync(product.id),
                                  )
                                }
                              >
                                Toggle
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={async () => {
                                  try {
                                    const dup = await actions.duplicate.mutateAsync(
                                      product.id,
                                    );
                                    setFlash({
                                      variant: "success",
                                      title: "Product duplicated as draft",
                                    });
                                    router.push(
                                      `/admin/products/${dup.id}/wizard`,
                                    );
                                  } catch (error) {
                                    const formatted = formatApiError(error);
                                    setFlash({
                                      variant: "error",
                                      title: formatted.message,
                                      items: formatted.errors,
                                    });
                                  }
                                }}
                              >
                                Duplicate
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() =>
                                  run(
                                    "Product moved to trash",
                                    () => actions.remove.mutateAsync(product.id),
                                    "Move this product to trash?",
                                  )
                                }
                              >
                                Trash
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  run("Product restored", () =>
                                    actions.restore.mutateAsync(product.id),
                                  )
                                }
                              >
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() =>
                                  run(
                                    "Product permanently deleted",
                                    () =>
                                      actions.forceDelete.mutateAsync(
                                        product.id,
                                      ),
                                    "Permanently delete this product?",
                                  )
                                }
                              >
                                Force delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!list.data?.items.length ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-2 py-10 text-center text-muted"
                    >
                      No products found.{" "}
                      <Link href="/admin/products/new" className="text-brand underline">
                        Start the wizard
                      </Link>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted">
            <p>
              {list.data?.total ?? 0} total · page {page} of {totalPages}
              {list.data?.items[0] ? (
                <span className="ml-2">
                  · updated {formatDate(list.data.items[0].updated_at)}
                </span>
              ) : null}
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
