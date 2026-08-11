/**
 * Customer storefront catalog API.
 * Prefer importing from `@/lib/api/catalog` in new code.
 */
export {
  getCatalogProduct as getProduct,
  listCatalogProducts as getProducts,
  listFeaturedProducts,
  listCatalogBrands,
  getRelatedProducts,
  productHref,
  formatPrice,
  priceLabel,
} from "@/lib/api/catalog";
