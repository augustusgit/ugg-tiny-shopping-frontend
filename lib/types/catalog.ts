export interface CatalogInventory {
  id: number;
  product_id: number;
  parent_id: number | null;
  title: string | null;
  brand: string | null;
  sku: string;
  slug: string | null;
  condition: string;
  condition_label?: string | null;
  condition_note: string | null;
  description: string | null;
  key_features: string | null;
  stock_quantity: number;
  min_order_quantity: number | null;
  sale_price: number;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
  has_offer: boolean;
  current_price: number;
  is_out_of_stock: boolean;
  free_shipping: boolean | number | null;
  requires_shipping_dims?: {
    weight: number | null;
    width: number | null;
    height: number | null;
    depth: number | null;
    distance_unit: string | null;
    weight_unit: string | null;
  };
  available_from: string | null;
  has_expiry: boolean | number | null;
  expiry_date: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface CatalogProduct {
  id: number;
  name: string;
  slug: string | null;
  brand: string | null;
  model_number: string | null;
  mpn: string | null;
  gtin: string | null;
  gtin_type: string | null;
  description: string | null;
  min_price: number | null;
  max_price: number | null;
  has_variant: boolean | number | null;
  requires_shipping: boolean | number | null;
  downloadable: boolean | number | null;
  is_featured: boolean | number | null;
  meta_title: string | null;
  meta_description: string | null;
  sale_count: number | null;
  published_at: string | null;
  available_inventories_count?: number;
  inventories?: CatalogInventory[];
  created_at: string;
  updated_at: string;
}

export interface CatalogListFilters {
  search?: string;
  brand?: string;
  featured?: boolean | string;
  downloadable?: boolean | string;
  in_stock?: boolean | string;
  min_price?: number | string;
  max_price?: number | string;
  sort_by?:
    | "published_at"
    | "created_at"
    | "name"
    | "min_price"
    | "max_price"
    | "sale_count"
    | "is_featured";
  sort_dir?: "asc" | "desc";
  per_page?: number;
  page?: number;
}
