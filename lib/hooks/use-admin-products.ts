"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/admin-products";
import { useAuthStore } from "@/lib/stores/auth-store";
import type {
  InventoryInput,
  ProductListFilters,
  ProductStepOneInput,
  SubmitWizardInput,
} from "@/lib/types/products";

const PRODUCTS_ROOT = ["admin", "products"] as const;

export const productKeys = {
  all: PRODUCTS_ROOT,
  list: (filters: ProductListFilters) =>
    [...PRODUCTS_ROOT, "list", filters] as const,
  detail: (id: number) => [...PRODUCTS_ROOT, "detail", id] as const,
  stats: [...PRODUCTS_ROOT, "stats"] as const,
  wizard: (id: number) => [...PRODUCTS_ROOT, "wizard", id] as const,
};

export function useAdminProducts(filters: ProductListFilters) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => api.listProducts(token, filters),
    enabled: Boolean(token),
  });
}

export function useAdminProduct(id: number) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.getProduct(token, id),
    enabled: Boolean(token && id),
  });
}

export function useAdminProductStats() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: productKeys.stats,
    queryFn: () => api.getProductStats(token),
    enabled: Boolean(token),
  });
}

export function useWizardProgress(id: number) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: productKeys.wizard(id),
    queryFn: () => api.wizardProgress(token, id),
    enabled: Boolean(token && id),
  });
}

function useInvalidateProducts() {
  const qc = useQueryClient();
  return (id?: number) => {
    qc.invalidateQueries({ queryKey: productKeys.all });
    if (id) {
      qc.invalidateQueries({ queryKey: productKeys.detail(id) });
      qc.invalidateQueries({ queryKey: productKeys.wizard(id) });
    }
  };
}

export function useProductMutations() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidateProducts();
  const qc = useQueryClient();

  return {
    update: useMutation({
      mutationFn: ({
        id,
        input,
      }: {
        id: number;
        input: Record<string, unknown>;
      }) => api.updateProduct(token, id, input),
      onSuccess: (product) => {
        invalidate(product.id);
        qc.setQueryData(productKeys.detail(product.id), (old: unknown) => {
          if (old && typeof old === "object" && "product" in (old as object)) {
            return { ...(old as object), product };
          }
          return old;
        });
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.deleteProduct(token, id),
      onSuccess: () => invalidate(),
    }),
    restore: useMutation({
      mutationFn: (id: number) => api.restoreProduct(token, id),
      onSuccess: () => invalidate(),
    }),
    forceDelete: useMutation({
      mutationFn: (id: number) => api.forceDeleteProduct(token, id),
      onSuccess: () => invalidate(),
    }),
    toggleStatus: useMutation({
      mutationFn: (id: number) => api.toggleProductStatus(token, id),
      onSuccess: (product) => invalidate(product.id),
    }),
    duplicate: useMutation({
      mutationFn: (id: number) => api.duplicateProduct(token, id),
      onSuccess: () => invalidate(),
    }),
    createInventory: useMutation({
      mutationFn: ({
        productId,
        input,
      }: {
        productId: number;
        input: InventoryInput;
      }) => api.createInventory(token, productId, input),
      onSuccess: (_inv, vars) => invalidate(vars.productId),
    }),
    updateInventory: useMutation({
      mutationFn: ({
        productId,
        inventoryId,
        input,
      }: {
        productId: number;
        inventoryId: number;
        input: Partial<InventoryInput>;
      }) => api.updateInventory(token, productId, inventoryId, input),
      onSuccess: (_inv, vars) => invalidate(vars.productId),
    }),
    deleteInventory: useMutation({
      mutationFn: ({
        productId,
        inventoryId,
      }: {
        productId: number;
        inventoryId: number;
      }) => api.deleteInventory(token, productId, inventoryId),
      onSuccess: (_msg, vars) => invalidate(vars.productId),
    }),
  };
}

export function useWizardMutations() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidateProducts();
  const qc = useQueryClient();

  function cacheWizard(data: Awaited<ReturnType<typeof api.wizardStepOneCreate>>) {
    qc.setQueryData(productKeys.detail(data.product.id), data);
    qc.setQueryData(productKeys.wizard(data.product.id), data);
    invalidate(data.product.id);
  }

  return {
    createStepOne: useMutation({
      mutationFn: (input: ProductStepOneInput) =>
        api.wizardStepOneCreate(token, input),
      onSuccess: cacheWizard,
    }),
    updateStepOne: useMutation({
      mutationFn: ({
        productId,
        input,
      }: {
        productId: number;
        input: ProductStepOneInput;
      }) => api.wizardStepOneUpdate(token, productId, input),
      onSuccess: cacheWizard,
    }),
    saveStepTwo: useMutation({
      mutationFn: ({
        productId,
        inventories,
      }: {
        productId: number;
        inventories: InventoryInput[];
      }) => api.wizardStepTwo(token, productId, inventories),
      onSuccess: cacheWizard,
    }),
    review: useMutation({
      mutationFn: (productId: number) => api.wizardReview(token, productId),
      onSuccess: cacheWizard,
    }),
    submit: useMutation({
      mutationFn: ({
        productId,
        input,
      }: {
        productId: number;
        input?: SubmitWizardInput;
      }) => api.wizardSubmit(token, productId, input),
      onSuccess: cacheWizard,
    }),
  };
}
