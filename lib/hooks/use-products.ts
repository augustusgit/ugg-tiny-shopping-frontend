"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as productsApi from "@/lib/api/products";
import * as adminApi from "@/lib/api/admin";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { ProductInput } from "@/lib/types";

export const productKeys = {
  all: ["products"] as const,
  detail: (id: string) => ["products", id] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: productsApi.getProducts,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => adminApi.adminCreateProduct(token, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct(id: string) {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) =>
      adminApi.adminUpdateProduct(token, id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.adminDeleteProduct(token, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

