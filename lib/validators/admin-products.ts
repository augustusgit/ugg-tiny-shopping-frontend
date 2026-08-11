import { z } from "zod";
import {
  DISTANCE_UNITS,
  INVENTORY_CONDITIONS,
  WEIGHT_UNITS,
} from "@/lib/types/products";

const optionalString = z.string().optional().or(z.literal(""));
const optionalNumber = z.coerce.number().min(0).optional().or(z.nan()).transform((v) =>
  Number.isNaN(v) ? undefined : v,
);

export const productStepOneSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  slug: optionalString,
  brand: optionalString,
  model_number: optionalString,
  mpn: optionalString,
  gtin: optionalString,
  gtin_type: optionalString,
  description: optionalString,
  requires_shipping: z.boolean().optional(),
  downloadable: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  has_variant: z.boolean().optional(),
  meta_title: optionalString,
  meta_description: optionalString,
});

export const inventoryItemSchema = z
  .object({
    title: optionalString,
    sku: z.string().min(1, "SKU is required").max(200),
    slug: optionalString,
    brand: optionalString,
    condition: z.enum(INVENTORY_CONDITIONS),
    condition_note: optionalString,
    description: optionalString,
    key_features: optionalString,
    stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
    damaged_quantity: optionalNumber,
    alert_quantity: optionalNumber,
    download_limit: optionalNumber,
    purchase_price: optionalNumber,
    sale_price: z.coerce.number().min(0, "Sale price is required"),
    offer_price: optionalNumber,
    offer_start: optionalString,
    offer_end: optionalString,
    shipping_weight: optionalNumber,
    shipping_width: optionalNumber,
    shipping_height: optionalNumber,
    shipping_depth: optionalNumber,
    distance_unit: z.enum(DISTANCE_UNITS).optional().or(z.literal("")),
    weight_unit: z.enum(WEIGHT_UNITS).optional().or(z.literal("")),
    free_shipping: z.boolean().optional(),
    available_from: optionalString,
    has_expiry: z.boolean().optional(),
    expiry_date: optionalString,
    min_order_quantity: z.coerce.number().int().min(1).optional().or(z.nan()).transform((v) =>
      Number.isNaN(v) ? undefined : v,
    ),
    meta_title: optionalString,
    meta_description: optionalString,
    stuff_pick: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.offer_start && data.offer_end) {
      if (new Date(data.offer_end) < new Date(data.offer_start)) {
        ctx.addIssue({
          code: "custom",
          message: "Offer end must be on or after offer start",
          path: ["offer_end"],
        });
      }
    }
    if (data.has_expiry && !data.expiry_date) {
      ctx.addIssue({
        code: "custom",
        message: "Expiry date is required when expiry is enabled",
        path: ["expiry_date"],
      });
    }
    if (
      data.offer_price != null &&
      data.sale_price != null &&
      data.offer_price > data.sale_price
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Offer price should not exceed sale price",
        path: ["offer_price"],
      });
    }
  });

export const wizardStepTwoSchema = z
  .object({
    inventories: z.array(inventoryItemSchema).min(1, "Add at least one inventory"),
  })
  .superRefine((data, ctx) => {
    const skus = data.inventories.map((i) => i.sku.trim().toLowerCase());
    const seen = new Set<string>();
    skus.forEach((sku, index) => {
      if (seen.has(sku)) {
        ctx.addIssue({
          code: "custom",
          message: "SKU must be unique within this product",
          path: ["inventories", index, "sku"],
        });
      }
      seen.add(sku);
    });
  });

export const submitWizardSchema = z.object({
  publish: z.boolean().optional(),
  meta_title: optionalString,
  meta_description: optionalString,
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  slug: optionalString,
  brand: optionalString,
  model_number: optionalString,
  mpn: optionalString,
  gtin: optionalString,
  gtin_type: optionalString,
  description: optionalString,
  requires_shipping: z.boolean().optional(),
  downloadable: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  has_variant: z.boolean().optional(),
  meta_title: optionalString,
  meta_description: optionalString,
  active: z.boolean().optional(),
  is_banned: z.boolean().optional(),
  ban_reason: optionalString,
  ban_start_date: optionalString,
  ban_end_date: optionalString,
  min_price: optionalNumber,
  max_price: optionalNumber,
});

export type ProductStepOneForm = z.infer<typeof productStepOneSchema>;
export type InventoryItemForm = z.infer<typeof inventoryItemSchema>;
