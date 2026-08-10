import { mockGetProduct, mockListProducts } from "@/lib/mock/handlers";
import type { Product } from "@/lib/types";

/** Catalog still uses the local mock until Laravel product wiring is added. */
export async function getProducts(): Promise<Product[]> {
  return mockListProducts();
}

export async function getProduct(id: string): Promise<Product> {
  return mockGetProduct(id);
}
