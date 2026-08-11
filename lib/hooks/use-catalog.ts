"use client";

import { useQuery } from "@tanstack/react-query";
import * as catalogApi from "@/lib/api/catalog";
import type { CatalogListFilters } from "@/lib/types/catalog";

const CATALOG_ROOT = ["catalog"] as const;

export const catalogKeys = {
  all: CATALOG_ROOT,
  list: (filters: CatalogListFilters) =>
    [...CATALOG_ROOT, "list", filters] as const,
  featured: (limit: number) => [...CATALOG_ROOT, "featured", limit] as const,
  brands: [...CATALOG_ROOT, "brands"] as const,
  detail: (idOrSlug: string) => [...CATALOG_ROOT, "detail", idOrSlug] as const,
  inventories: (idOrSlug: string) =>
    [...CATALOG_ROOT, "inventories", idOrSlug] as const,
  related: (idOrSlug: string, limit: number) =>
    [...CATALOG_ROOT, "related", idOrSlug, limit] as const,
};

export function useCatalogProducts(filters: CatalogListFilters) {
  return useQuery({
    queryKey: catalogKeys.list(filters),
    queryFn: () => catalogApi.listCatalogProducts(filters),
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: catalogKeys.featured(limit),
    queryFn: () => catalogApi.listFeaturedProducts(limit),
  });
}

export function useCatalogBrands() {
  return useQuery({
    queryKey: catalogKeys.brands,
    queryFn: catalogApi.listCatalogBrands,
  });
}

export function useCatalogProduct(idOrSlug: string) {
  return useQuery({
    queryKey: catalogKeys.detail(idOrSlug),
    queryFn: () => catalogApi.getCatalogProduct(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}

export function useCatalogInventories(idOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: catalogKeys.inventories(idOrSlug),
    queryFn: () => catalogApi.getCatalogInventories(idOrSlug),
    enabled: Boolean(idOrSlug) && enabled,
  });
}

export function useRelatedProducts(idOrSlug: string, limit = 8) {
  return useQuery({
    queryKey: catalogKeys.related(idOrSlug, limit),
    queryFn: () => catalogApi.getRelatedProducts(idOrSlug, limit),
    enabled: Boolean(idOrSlug),
  });
}
