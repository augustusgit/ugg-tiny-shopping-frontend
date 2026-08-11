export type ProductStatus = "draft" | "pending_review" | "published";

export interface WizardStepInfo {
  step: number;
  key: string;
  label: string;
  completed: boolean;
  completed_at: string | null;
  current: boolean;
}

export interface WizardProgress {
  product_id: number;
  status: string;
  current_step: number;
  total_steps: number;
  completed_steps: number;
  percent: number;
  can_submit: boolean;
  inventory_count: number;
  steps: WizardStepInfo[];
}

export interface InventoryItem {
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
  damaged_quantity: number | null;
  sold_quantity?: number | null;
  alert_quantity: number | null;
  download_limit: number | null;
  purchase_price: number | null;
  sale_price: number;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
  has_offer?: boolean;
  is_low_stock?: boolean;
  is_out_of_stock?: boolean;
  shipping_weight: number | null;
  shipping_width: number | null;
  shipping_height: number | null;
  shipping_depth: number | null;
  distance_unit: string | null;
  weight_unit: string | null;
  free_shipping: boolean | number | null;
  available_from: string | null;
  has_expiry: boolean | number | null;
  expiry_date: string | null;
  min_order_quantity: number | null;
  linked_items: unknown;
  meta_title: string | null;
  meta_description: string | null;
  stuff_pick: boolean | number | null;
  active: boolean | number | null;
  is_banned?: boolean | number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminProduct {
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
  is_banned: boolean | number | null;
  ban_reason: string | null;
  ban_start_date: string | null;
  ban_end_date: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sale_count?: number | null;
  active: boolean | number | null;
  status: ProductStatus | string;
  status_label?: string | null;
  wizard_step: number;
  wizard_step_key?: string | null;
  step_one_completed_at: string | null;
  step_two_completed_at: string | null;
  step_three_completed_at: string | null;
  submitted_at: string | null;
  published_at: string | null;
  inventories_count?: number;
  inventories?: InventoryItem[];
  creator?: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WizardResponse {
  product: AdminProduct;
  progress: WizardProgress;
}

export interface ProductStats {
  total_products: number;
  draft_products: number;
  pending_review_products: number;
  published_products: number;
  active_products: number;
  inactive_products: number;
  digital_products: number;
  physical_products: number;
  products_with_variants: number;
  products_without_variants: number;
  products_with_inventories: number;
  products_without_inventories: number;
  recent_products: number;
}

export interface ProductListFilters {
  status?: string;
  active?: string;
  brand?: string;
  search?: string;
  trashed?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface ProductStepOneInput {
  name: string;
  slug?: string;
  brand?: string;
  model_number?: string;
  mpn?: string;
  gtin?: string;
  gtin_type?: string;
  description?: string;
  requires_shipping?: boolean;
  downloadable?: boolean;
  is_featured?: boolean;
  has_variant?: boolean;
  meta_title?: string;
  meta_description?: string;
}

export interface InventoryInput {
  title?: string;
  sku: string;
  slug?: string;
  brand?: string;
  condition: "New" | "Used" | "Refurbished";
  condition_note?: string;
  description?: string;
  key_features?: string;
  stock_quantity: number;
  damaged_quantity?: number;
  alert_quantity?: number;
  download_limit?: number;
  purchase_price?: number;
  sale_price: number;
  offer_price?: number;
  offer_start?: string;
  offer_end?: string;
  shipping_weight?: number;
  shipping_width?: number;
  shipping_height?: number;
  shipping_depth?: number;
  distance_unit?: string;
  weight_unit?: string;
  free_shipping?: boolean;
  available_from?: string;
  has_expiry?: boolean;
  expiry_date?: string;
  min_order_quantity?: number;
  meta_title?: string;
  meta_description?: string;
  stuff_pick?: boolean;
  active?: boolean;
}

export interface SubmitWizardInput {
  publish?: boolean;
  meta_title?: string;
  meta_description?: string;
  approval_request_id?: number;
}

export const INVENTORY_CONDITIONS = ["New", "Used", "Refurbished"] as const;
export const DISTANCE_UNITS = ["cm", "in", "ft", "m", "yd", "mi", "km"] as const;
export const WEIGHT_UNITS = ["kg", "lbs", "oz", "g", "mg", "ton", "tonne"] as const;
export const PRODUCT_STATUSES = ["draft", "pending_review", "published"] as const;
