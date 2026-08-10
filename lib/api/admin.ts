import {
  mockCreateProduct,
  mockDeleteProduct,
  mockListProducts,
  mockListUsers,
  mockUpdateProduct,
} from "@/lib/mock/handlers";
import type { ProductInput, User } from "@/lib/types";

/** Admin catalog/users list stays on mock until Laravel admin product APIs are wired. */
export async function adminListProducts(token?: string | null) {
  void token;
  return mockListProducts();
}

export async function adminCreateProduct(
  token: string | null | undefined,
  input: ProductInput,
) {
  return mockCreateProduct(token, input);
}

export async function adminUpdateProduct(
  token: string | null | undefined,
  id: string,
  input: ProductInput,
) {
  return mockUpdateProduct(token, id, input);
}

export async function adminDeleteProduct(
  token: string | null | undefined,
  id: string,
) {
  return mockDeleteProduct(token, id);
}

export async function adminListUsers(token?: string | null): Promise<User[]> {
  return mockListUsers(token);
}
