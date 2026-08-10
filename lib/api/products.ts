import { apiFetch, USE_MOCK } from "@/lib/api/client";
import { mockGetProduct, mockListProducts } from "@/lib/mock/handlers";
import type { Product } from "@/lib/types";

export async function getProducts() {
  if (USE_MOCK) return mockListProducts();
  return apiFetch<Product[]>("/products");
}

export async function getProduct(id: string) {
  if (USE_MOCK) return mockGetProduct(id);
  return apiFetch<Product>(`/products/${id}`);
}
