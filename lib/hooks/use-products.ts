/**
 * Storefront catalog hooks live in `use-catalog.ts`.
 * This file re-exports them for older imports.
 */
export {
  catalogKeys as productKeys,
  useCatalogProduct as useProduct,
  useCatalogProducts as useProducts,
} from "@/lib/hooks/use-catalog";
