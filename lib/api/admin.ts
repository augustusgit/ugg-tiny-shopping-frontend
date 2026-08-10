import { apiFetch, USE_MOCK } from "@/lib/api/client";
import {
  mockCreateProduct,
  mockDeleteProduct,
  mockListProducts,
  mockListUsers,
  mockUpdateProduct,
} from "@/lib/mock/handlers";
import type { Product, ProductInput, User } from "@/lib/types";

export async function adminListProducts(token?: string | null) {
  if (USE_MOCK) return mockListProducts();
  return apiFetch<Product[]>("/admin/products", { token });
}

export async function adminCreateProduct(
  token: string | null | undefined,
  input: ProductInput,
) {
  if (USE_MOCK) return mockCreateProduct(token, input);
  return apiFetch<Product>("/admin/products", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export async function adminUpdateProduct(
  token: string | null | undefined,
  id: string,
  input: ProductInput,
) {
  if (USE_MOCK) return mockUpdateProduct(token, id, input);
  return apiFetch<Product>(`/admin/products/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
}

export async function adminDeleteProduct(
  token: string | null | undefined,
  id: string,
) {
  if (USE_MOCK) return mockDeleteProduct(token, id);
  return apiFetch<void>(`/admin/products/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function adminListUsers(token?: string | null) {
  if (USE_MOCK) return mockListUsers(token);
  return apiFetch<User[]>("/admin/users", { token });
}
