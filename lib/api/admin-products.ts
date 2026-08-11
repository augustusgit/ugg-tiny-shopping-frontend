import { apiFetch, apiList, apiMessage, toQueryString } from "@/lib/api/client";
import type {
  AdminProduct,
  InventoryInput,
  InventoryItem,
  ProductListFilters,
  ProductStats,
  ProductStepOneInput,
  SubmitWizardInput,
  WizardResponse,
} from "@/lib/types/products";

function auth(token?: string | null) {
  return { token };
}

export async function listProducts(
  token: string | null | undefined,
  filters: ProductListFilters = {},
) {
  const qs = toQueryString({ ...filters });
  return apiList<AdminProduct>(`/admin/products${qs}`, {
    method: "GET",
    ...auth(token),
  });
}

export async function getProductStats(token?: string | null) {
  return apiFetch<ProductStats>("/admin/products/stats", {
    method: "GET",
    ...auth(token),
  });
}

export async function getProduct(token: string | null | undefined, id: number) {
  return apiFetch<WizardResponse>(`/admin/products/${id}`, {
    method: "GET",
    ...auth(token),
  });
}

export async function updateProduct(
  token: string | null | undefined,
  id: number,
  input: Record<string, unknown>,
) {
  const data = await apiFetch<{ product: AdminProduct }>(
    `/admin/products/${id}`,
    {
      method: "PUT",
      ...auth(token),
      body: JSON.stringify(input),
    },
  );
  return data.product;
}

export async function deleteProduct(
  token: string | null | undefined,
  id: number,
) {
  return apiMessage(`/admin/products/${id}`, {
    method: "DELETE",
    ...auth(token),
  });
}

export async function restoreProduct(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ product: AdminProduct }>(
    `/admin/products/${id}/restore`,
    { method: "POST", ...auth(token) },
  );
  return data.product;
}

export async function forceDeleteProduct(
  token: string | null | undefined,
  id: number,
) {
  return apiMessage(`/admin/products/${id}/force`, {
    method: "DELETE",
    ...auth(token),
  });
}

export async function toggleProductStatus(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ product: AdminProduct }>(
    `/admin/products/${id}/toggle-status`,
    { method: "POST", ...auth(token) },
  );
  return data.product;
}

export async function duplicateProduct(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ product: AdminProduct }>(
    `/admin/products/${id}/duplicate`,
    { method: "POST", ...auth(token) },
  );
  return data.product;
}

export async function createInventory(
  token: string | null | undefined,
  productId: number,
  input: InventoryInput,
) {
  const data = await apiFetch<{ inventory: InventoryItem }>(
    `/admin/products/${productId}/inventories`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify(input),
    },
  );
  return data.inventory;
}

export async function updateInventory(
  token: string | null | undefined,
  productId: number,
  inventoryId: number,
  input: Partial<InventoryInput>,
) {
  const data = await apiFetch<{ inventory: InventoryItem }>(
    `/admin/products/${productId}/inventories/${inventoryId}`,
    {
      method: "PUT",
      ...auth(token),
      body: JSON.stringify(input),
    },
  );
  return data.inventory;
}

export async function deleteInventory(
  token: string | null | undefined,
  productId: number,
  inventoryId: number,
) {
  return apiMessage(
    `/admin/products/${productId}/inventories/${inventoryId}`,
    { method: "DELETE", ...auth(token) },
  );
}

/** Wizard */
export async function wizardStepOneCreate(
  token: string | null | undefined,
  input: ProductStepOneInput,
) {
  return apiFetch<WizardResponse>("/admin/products/wizard/step-1", {
    method: "POST",
    ...auth(token),
    body: JSON.stringify(input),
  });
}

export async function wizardStepOneUpdate(
  token: string | null | undefined,
  productId: number,
  input: ProductStepOneInput,
) {
  return apiFetch<WizardResponse>(
    `/admin/products/wizard/${productId}/step-1`,
    {
      method: "PUT",
      ...auth(token),
      body: JSON.stringify(input),
    },
  );
}

export async function wizardStepTwo(
  token: string | null | undefined,
  productId: number,
  inventories: InventoryInput[],
) {
  return apiFetch<WizardResponse>(
    `/admin/products/wizard/${productId}/step-2`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify({ inventories }),
    },
  );
}

export async function wizardReview(
  token: string | null | undefined,
  productId: number,
) {
  return apiFetch<WizardResponse>(
    `/admin/products/wizard/${productId}/step-3`,
    { method: "GET", ...auth(token) },
  );
}

export async function wizardSubmit(
  token: string | null | undefined,
  productId: number,
  input: SubmitWizardInput = {},
) {
  return apiFetch<WizardResponse>(
    `/admin/products/wizard/${productId}/submit`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify(input),
    },
  );
}

export async function wizardProgress(
  token: string | null | undefined,
  productId: number,
) {
  return apiFetch<WizardResponse>(
    `/admin/products/wizard/${productId}/progress`,
    { method: "GET", ...auth(token) },
  );
}
