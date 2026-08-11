import { apiFetch, apiList, toQueryString } from "@/lib/api/client";
import type {
  CatalogInventory,
  CatalogListFilters,
  CatalogProduct,
} from "@/lib/types/catalog";

/** Laravel JsonResource may nest a single model under `{ data: T }`. */
function unwrapResource<T>(value: unknown): T {
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    (value as { data: unknown }).data &&
    typeof (value as { data: unknown }).data === "object" &&
    !Array.isArray((value as { data: unknown }).data) &&
    "id" in ((value as { data: object }).data as object)
  ) {
    return (value as { data: T }).data;
  }
  return value as T;
}

/** Resource collections may arrive as `T[]` or `{ data: T[] }`. */
function unwrapCollection<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }
  return [];
}

function normalizeProduct(raw: unknown): CatalogProduct {
  const product = unwrapResource<CatalogProduct>(raw);
  return {
    ...product,
    inventories: unwrapCollection<CatalogInventory>(product.inventories),
  };
}

export async function listCatalogProducts(filters: CatalogListFilters = {}) {
  const qs = toQueryString({ ...filters });
  return apiList<CatalogProduct>(`/customer/products${qs}`, { method: "GET" });
}

export async function listFeaturedProducts(limit = 8) {
  const qs = toQueryString({ limit });
  return apiList<CatalogProduct>(`/customer/products/featured${qs}`, {
    method: "GET",
  });
}

export async function listCatalogBrands() {
  const result = await apiList<string>("/customer/products/brands", {
    method: "GET",
  });
  return result.items;
}

export async function getCatalogProduct(
  idOrSlug: string,
): Promise<CatalogProduct> {
  const data = await apiFetch<{ product: unknown }>(
    `/customer/products/${encodeURIComponent(idOrSlug)}`,
    { method: "GET" },
  );
  return normalizeProduct(data.product);
}

export async function getCatalogInventories(idOrSlug: string) {
  return apiList<CatalogInventory>(
    `/customer/products/${encodeURIComponent(idOrSlug)}/inventories`,
    { method: "GET" },
  );
}

export async function getRelatedProducts(idOrSlug: string, limit = 8) {
  const qs = toQueryString({ limit });
  return apiList<CatalogProduct>(
    `/customer/products/${encodeURIComponent(idOrSlug)}/related${qs}`,
    { method: "GET" },
  );
}

export function productHref(product: Pick<CatalogProduct, "id" | "slug">) {
  return `/products/${encodeURIComponent(product.slug || String(product.id))}`;
}

export function formatPrice(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `$${Number(value).toFixed(2)}`;
}

export function priceLabel(product: CatalogProduct) {
  const min = product.min_price;
  const max = product.max_price;
  if (min == null && max == null) return "—";
  if (min != null && max != null && Number(min) !== Number(max)) {
    return `${formatPrice(min)} – ${formatPrice(max)}`;
  }
  return formatPrice(min ?? max);
}
