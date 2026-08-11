"use client";

import Link from "next/link";
import { useState } from "react";
import {
  InventoryFields,
  draftToInventoryPayload,
  emptyInventoryDraft,
  inventoryFromApi,
  type InventoryDraft,
} from "@/components/admin/products/inventory-fields";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminProduct,
  useProductMutations,
} from "@/lib/hooks/use-admin-products";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import type { InventoryItem } from "@/lib/types/products";
import { formatDate, isActiveFlag, omitEmpty } from "@/lib/utils/empty";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import {
  inventoryItemSchema,
  updateProductSchema,
} from "@/lib/validators/admin-products";

export function ProductDetail({ id }: { id: number }) {
  const detail = useAdminProduct(id);
  const actions = useProductMutations();
  const [flash, setFlash] = useState<{
    variant: "error" | "success" | "info" | "warning";
    title: string;
    items?: string[];
  } | null>(null);
  const [productErrors, setProductErrors] = useState<Record<string, string>>(
    {},
  );
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<InventoryDraft>(emptyInventoryDraft());
  const [invErrors, setInvErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        title={formatted.message || "Product not found"}
        items={formatted.errors}
      />
    );
  }

  const { product, progress } = detail.data;
  const wizardOpen =
    product.status === "draft" || product.status === "pending_review";

  async function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProductErrors({});
    setFlash(null);
    const form = new FormData(e.currentTarget);
    const raw = {
      name: String(form.get("name") || ""),
      slug: String(form.get("slug") || ""),
      brand: String(form.get("brand") || ""),
      model_number: String(form.get("model_number") || ""),
      mpn: String(form.get("mpn") || ""),
      gtin: String(form.get("gtin") || ""),
      gtin_type: String(form.get("gtin_type") || ""),
      description: String(form.get("description") || ""),
      meta_title: String(form.get("meta_title") || ""),
      meta_description: String(form.get("meta_description") || ""),
      requires_shipping: form.get("requires_shipping") === "on",
      downloadable: form.get("downloadable") === "on",
      is_featured: form.get("is_featured") === "on",
      has_variant: form.get("has_variant") === "on",
      active: form.get("active") === "on",
      is_banned: form.get("is_banned") === "on",
      ban_reason: String(form.get("ban_reason") || ""),
    };
    const parsed = updateProductSchema.safeParse(raw);
    if (!parsed.success) {
      setProductErrors(zodFieldErrors(parsed.error));
      return;
    }
    await run("Product updated", () =>
      actions.update.mutateAsync({
        id: product.id,
        input: omitEmpty({ ...parsed.data }),
      }),
    );
  }

  async function saveInventory(e: React.FormEvent) {
    e.preventDefault();
    setInvErrors({});
    setFlash(null);
    const payload = draftToInventoryPayload(draft);
    const parsed = inventoryItemSchema.safeParse(payload);
    if (!parsed.success) {
      setInvErrors(zodFieldErrors(parsed.error));
      return;
    }
    try {
      if (editingInventory) {
        await actions.updateInventory.mutateAsync({
          productId: product.id,
          inventoryId: editingInventory.id,
          input: parsed.data,
        });
        setFlash({ variant: "success", title: "Inventory updated" });
      } else {
        await actions.createInventory.mutateAsync({
          productId: product.id,
          input: parsed.data,
        });
        setFlash({ variant: "success", title: "Inventory created" });
      }
      setEditingInventory(null);
      setCreating(false);
      setDraft(emptyInventoryDraft());
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Product #{product.id}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {product.status_label || product.status}
            {" · "}
            {isActiveFlag(product.active) ? "Active" : "Inactive"}
            {" · "}
            wizard {progress.percent}% ({progress.completed_steps}/
            {progress.total_steps})
          </p>
          <p className="mt-1 text-xs text-muted">
            Updated {formatDate(product.updated_at)}
            {product.creator ? ` · by ${product.creator.name}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products" className="text-sm text-brand underline">
            Back to products
          </Link>
          {wizardOpen ? (
            <Link
              href={`/admin/products/${product.id}/wizard`}
              className="inline-flex h-9 items-center rounded-md bg-brand px-3 text-sm text-white hover:bg-brand-dark"
            >
              Open wizard
            </Link>
          ) : null}
        </div>
      </div>

      {flash ? (
        <Alert variant={flash.variant} title={flash.title} items={flash.items} />
      ) : null}

      <section className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            run("Status toggled", () =>
              actions.toggleStatus.mutateAsync(product.id),
            )
          }
        >
          Toggle status
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            run("Product duplicated as draft", () =>
              actions.duplicate.mutateAsync(product.id),
            )
          }
        >
          Duplicate
        </Button>
        {product.deleted_at ? (
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
              onClick={() => {
                if (!confirm("Permanently delete?")) return;
                run("Permanently deleted", () =>
                  actions.forceDelete.mutateAsync(product.id),
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
              if (!confirm("Move to trash?")) return;
              run("Moved to trash", () =>
                actions.remove.mutateAsync(product.id),
              );
            }}
          >
            Trash
          </Button>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
          Product details
        </h2>
        <form
          key={product.updated_at}
          onSubmit={saveProduct}
          className="max-w-2xl space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              name="name"
              label="Name"
              defaultValue={product.name}
              error={productErrors.name}
            />
            <Input name="slug" label="Slug" defaultValue={product.slug ?? ""} />
            <Input
              name="brand"
              label="Brand"
              defaultValue={product.brand ?? ""}
            />
            <Input
              name="model_number"
              label="Model number"
              defaultValue={product.model_number ?? ""}
            />
            <Input name="mpn" label="MPN" defaultValue={product.mpn ?? ""} />
            <Input name="gtin" label="GTIN" defaultValue={product.gtin ?? ""} />
            <Input
              name="gtin_type"
              label="GTIN type"
              defaultValue={product.gtin_type ?? ""}
            />
            <Input
              name="meta_title"
              label="Meta title"
              defaultValue={product.meta_title ?? ""}
            />
          </div>
          <Textarea
            name="description"
            label="Description"
            defaultValue={product.description ?? ""}
          />
          <Input
            name="meta_description"
            label="Meta description"
            defaultValue={product.meta_description ?? ""}
          />
          <Input
            name="ban_reason"
            label="Ban reason"
            defaultValue={product.ban_reason ?? ""}
          />
          <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requires_shipping"
                defaultChecked={product.requires_shipping !== false}
              />
              Requires shipping
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="downloadable"
                defaultChecked={Boolean(product.downloadable)}
              />
              Downloadable
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={Boolean(product.is_featured)}
              />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="has_variant"
                defaultChecked={Boolean(product.has_variant)}
              />
              Has variants
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                defaultChecked={isActiveFlag(product.active)}
              />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_banned"
                defaultChecked={Boolean(product.is_banned)}
              />
              Banned
            </label>
          </div>
          <Button type="submit" disabled={actions.update.isPending}>
            {actions.update.isPending ? "Saving…" : "Save product"}
          </Button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl">
            Inventories ({product.inventories?.length ?? 0})
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setCreating(true);
              setEditingInventory(null);
              setDraft(
                emptyInventoryDraft({
                  brand: product.brand ?? "",
                  title: product.name,
                }),
              );
              setShowAdvanced(false);
            }}
          >
            Add inventory
          </Button>
        </div>

        <div className="overflow-x-auto border-y border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-border">
                <th className="px-2 py-3 font-medium">SKU</th>
                <th className="px-2 py-3 font-medium">Condition</th>
                <th className="px-2 py-3 font-medium">Stock</th>
                <th className="px-2 py-3 font-medium">Price</th>
                <th className="px-2 py-3 font-medium">Flags</th>
                <th className="px-2 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(product.inventories || []).map((inv) => (
                <tr key={inv.id} className="border-b border-border/70">
                  <td className="px-2 py-3">
                    <p className="font-medium">{inv.sku}</p>
                    <p className="text-xs text-muted">{inv.title || "—"}</p>
                  </td>
                  <td className="px-2 py-3">{inv.condition}</td>
                  <td className="px-2 py-3">
                    {inv.stock_quantity}
                    {inv.is_low_stock ? (
                      <span className="ml-1 text-xs text-accent">low</span>
                    ) : null}
                    {inv.is_out_of_stock ? (
                      <span className="ml-1 text-xs text-danger">out</span>
                    ) : null}
                  </td>
                  <td className="px-2 py-3">
                    ${Number(inv.sale_price).toFixed(2)}
                    {inv.has_offer && inv.offer_price != null ? (
                      <span className="ml-1 text-xs text-brand">
                        offer ${Number(inv.offer_price).toFixed(2)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-3 text-xs text-muted">
                    {isActiveFlag(inv.active) ? "Active" : "Inactive"}
                    {inv.free_shipping ? " · Free ship" : ""}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingInventory(inv);
                          setDraft(inventoryFromApi(inv));
                          setCreating(true);
                          setShowAdvanced(false);
                          setInvErrors({});
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (!confirm("Delete this inventory?")) return;
                          run("Inventory deleted", () =>
                            actions.deleteInventory.mutateAsync({
                              productId: product.id,
                              inventoryId: inv.id,
                            }),
                          );
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!product.inventories?.length ? (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-muted">
                    No inventories yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {creating ? (
          <form onSubmit={saveInventory} className="max-w-2xl space-y-3">
            <h3 className="font-medium">
              {editingInventory ? "Edit inventory" : "New inventory"}
            </h3>
            <InventoryFields
              value={draft}
              onChange={setDraft}
              errors={invErrors}
              showAdvanced={showAdvanced}
              onToggleAdvanced={() => setShowAdvanced((v) => !v)}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  actions.createInventory.isPending ||
                  actions.updateInventory.isPending
                }
              >
                {editingInventory ? "Update inventory" : "Create inventory"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCreating(false);
                  setEditingInventory(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}
