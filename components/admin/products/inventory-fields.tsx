"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DISTANCE_UNITS,
  INVENTORY_CONDITIONS,
  WEIGHT_UNITS,
  type InventoryItem,
} from "@/lib/types/products";

export type InventoryDraft = {
  title: string;
  sku: string;
  brand: string;
  condition: (typeof INVENTORY_CONDITIONS)[number];
  condition_note: string;
  description: string;
  key_features: string;
  stock_quantity: string;
  damaged_quantity: string;
  alert_quantity: string;
  purchase_price: string;
  sale_price: string;
  offer_price: string;
  offer_start: string;
  offer_end: string;
  shipping_weight: string;
  shipping_width: string;
  shipping_height: string;
  shipping_depth: string;
  distance_unit: string;
  weight_unit: string;
  free_shipping: boolean;
  available_from: string;
  has_expiry: boolean;
  expiry_date: string;
  min_order_quantity: string;
  meta_title: string;
  meta_description: string;
  stuff_pick: boolean;
  active: boolean;
};

export function emptyInventoryDraft(seed?: Partial<InventoryDraft>): InventoryDraft {
  return {
    title: "",
    sku: "",
    brand: "",
    condition: "New",
    condition_note: "",
    description: "",
    key_features: "",
    stock_quantity: "0",
    damaged_quantity: "",
    alert_quantity: "",
    purchase_price: "",
    sale_price: "",
    offer_price: "",
    offer_start: "",
    offer_end: "",
    shipping_weight: "",
    shipping_width: "",
    shipping_height: "",
    shipping_depth: "",
    distance_unit: "cm",
    weight_unit: "kg",
    free_shipping: false,
    available_from: "",
    has_expiry: false,
    expiry_date: "",
    min_order_quantity: "1",
    meta_title: "",
    meta_description: "",
    stuff_pick: false,
    active: true,
    ...seed,
  };
}

export function inventoryFromApi(item: InventoryItem): InventoryDraft {
  return emptyInventoryDraft({
    title: item.title ?? "",
    sku: item.sku ?? "",
    brand: item.brand ?? "",
    condition: (INVENTORY_CONDITIONS.includes(
      item.condition as (typeof INVENTORY_CONDITIONS)[number],
    )
      ? item.condition
      : "New") as InventoryDraft["condition"],
    condition_note: item.condition_note ?? "",
    description: item.description ?? "",
    key_features: item.key_features ?? "",
    stock_quantity: String(item.stock_quantity ?? 0),
    damaged_quantity:
      item.damaged_quantity != null ? String(item.damaged_quantity) : "",
    alert_quantity:
      item.alert_quantity != null ? String(item.alert_quantity) : "",
    purchase_price:
      item.purchase_price != null ? String(item.purchase_price) : "",
    sale_price: String(item.sale_price ?? ""),
    offer_price: item.offer_price != null ? String(item.offer_price) : "",
    offer_start: item.offer_start ? String(item.offer_start).slice(0, 10) : "",
    offer_end: item.offer_end ? String(item.offer_end).slice(0, 10) : "",
    shipping_weight:
      item.shipping_weight != null ? String(item.shipping_weight) : "",
    shipping_width:
      item.shipping_width != null ? String(item.shipping_width) : "",
    shipping_height:
      item.shipping_height != null ? String(item.shipping_height) : "",
    shipping_depth:
      item.shipping_depth != null ? String(item.shipping_depth) : "",
    distance_unit: item.distance_unit ?? "cm",
    weight_unit: item.weight_unit ?? "kg",
    free_shipping: Boolean(item.free_shipping),
    available_from: item.available_from
      ? String(item.available_from).slice(0, 10)
      : "",
    has_expiry: Boolean(item.has_expiry),
    expiry_date: item.expiry_date ? String(item.expiry_date).slice(0, 10) : "",
    min_order_quantity: String(item.min_order_quantity ?? 1),
    meta_title: item.meta_title ?? "",
    meta_description: item.meta_description ?? "",
    stuff_pick: Boolean(item.stuff_pick),
    active: item.active === undefined ? true : Boolean(item.active),
  });
}

function numOrUndef(value: string) {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function draftToInventoryPayload(draft: InventoryDraft) {
  return {
    title: draft.title || undefined,
    sku: draft.sku,
    brand: draft.brand || undefined,
    condition: draft.condition,
    condition_note: draft.condition_note || undefined,
    description: draft.description || undefined,
    key_features: draft.key_features || undefined,
    stock_quantity: Number(draft.stock_quantity || 0),
    damaged_quantity: numOrUndef(draft.damaged_quantity),
    alert_quantity: numOrUndef(draft.alert_quantity),
    purchase_price: numOrUndef(draft.purchase_price),
    sale_price: Number(draft.sale_price),
    offer_price: numOrUndef(draft.offer_price),
    offer_start: draft.offer_start || undefined,
    offer_end: draft.offer_end || undefined,
    shipping_weight: numOrUndef(draft.shipping_weight),
    shipping_width: numOrUndef(draft.shipping_width),
    shipping_height: numOrUndef(draft.shipping_height),
    shipping_depth: numOrUndef(draft.shipping_depth),
    distance_unit: draft.distance_unit || undefined,
    weight_unit: draft.weight_unit || undefined,
    free_shipping: draft.free_shipping,
    available_from: draft.available_from || undefined,
    has_expiry: draft.has_expiry,
    expiry_date: draft.expiry_date || undefined,
    min_order_quantity: numOrUndef(draft.min_order_quantity),
    meta_title: draft.meta_title || undefined,
    meta_description: draft.meta_description || undefined,
    stuff_pick: draft.stuff_pick,
    active: draft.active,
  };
}

export function InventoryFields({
  value,
  onChange,
  errors = {},
  index,
  showAdvanced,
  onToggleAdvanced,
}: {
  value: InventoryDraft;
  onChange: (next: InventoryDraft) => void;
  errors?: Record<string, string>;
  index?: number;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}) {
  const prefix = index != null ? `Inventory ${index + 1}` : "Inventory";
  const set = <K extends keyof InventoryDraft>(key: K, val: InventoryDraft[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-3 border-b border-border pb-4">
      <p className="text-sm font-medium text-foreground">{prefix}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Title"
          value={value.title}
          onChange={(e) => set("title", e.target.value)}
          error={errors.title}
        />
        <Input
          label="SKU *"
          value={value.sku}
          onChange={(e) => set("sku", e.target.value)}
          error={errors.sku}
        />
        <Input
          label="Brand"
          value={value.brand}
          onChange={(e) => set("brand", e.target.value)}
          error={errors.brand}
        />
        <Select
          label="Condition *"
          value={value.condition}
          onChange={(e) =>
            set("condition", e.target.value as InventoryDraft["condition"])
          }
          error={errors.condition}
        >
          {INVENTORY_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          label="Stock quantity *"
          type="number"
          min={0}
          value={value.stock_quantity}
          onChange={(e) => set("stock_quantity", e.target.value)}
          error={errors.stock_quantity}
        />
        <Input
          label="Sale price *"
          type="number"
          min={0}
          step="0.01"
          value={value.sale_price}
          onChange={(e) => set("sale_price", e.target.value)}
          error={errors.sale_price}
        />
        <Input
          label="Purchase price"
          type="number"
          min={0}
          step="0.01"
          value={value.purchase_price}
          onChange={(e) => set("purchase_price", e.target.value)}
          error={errors.purchase_price}
        />
        <Input
          label="Offer price"
          type="number"
          min={0}
          step="0.01"
          value={value.offer_price}
          onChange={(e) => set("offer_price", e.target.value)}
          error={errors.offer_price}
        />
      </div>
      <Textarea
        label="Description"
        value={value.description}
        onChange={(e) => set("description", e.target.value)}
        error={errors.description}
      />

      {onToggleAdvanced ? (
        <button
          type="button"
          className="text-sm text-brand underline"
          onClick={onToggleAdvanced}
        >
          {showAdvanced ? "Hide advanced fields" : "Show advanced fields"}
        </button>
      ) : null}

      {showAdvanced ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Condition note"
            value={value.condition_note}
            onChange={(e) => set("condition_note", e.target.value)}
          />
          <Input
            label="Alert quantity"
            type="number"
            min={0}
            value={value.alert_quantity}
            onChange={(e) => set("alert_quantity", e.target.value)}
          />
          <Input
            label="Damaged quantity"
            type="number"
            min={0}
            value={value.damaged_quantity}
            onChange={(e) => set("damaged_quantity", e.target.value)}
          />
          <Input
            label="Min order quantity"
            type="number"
            min={1}
            value={value.min_order_quantity}
            onChange={(e) => set("min_order_quantity", e.target.value)}
          />
          <Input
            label="Offer start"
            type="date"
            value={value.offer_start}
            onChange={(e) => set("offer_start", e.target.value)}
            error={errors.offer_start}
          />
          <Input
            label="Offer end"
            type="date"
            value={value.offer_end}
            onChange={(e) => set("offer_end", e.target.value)}
            error={errors.offer_end}
          />
          <Input
            label="Available from"
            type="date"
            value={value.available_from}
            onChange={(e) => set("available_from", e.target.value)}
          />
          <Input
            label="Expiry date"
            type="date"
            value={value.expiry_date}
            onChange={(e) => set("expiry_date", e.target.value)}
            error={errors.expiry_date}
          />
          <Input
            label="Shipping weight"
            type="number"
            min={0}
            value={value.shipping_weight}
            onChange={(e) => set("shipping_weight", e.target.value)}
          />
          <Select
            label="Weight unit"
            value={value.weight_unit}
            onChange={(e) => set("weight_unit", e.target.value)}
          >
            {WEIGHT_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          <Input
            label="Width"
            type="number"
            min={0}
            value={value.shipping_width}
            onChange={(e) => set("shipping_width", e.target.value)}
          />
          <Input
            label="Height"
            type="number"
            min={0}
            value={value.shipping_height}
            onChange={(e) => set("shipping_height", e.target.value)}
          />
          <Input
            label="Depth"
            type="number"
            min={0}
            value={value.shipping_depth}
            onChange={(e) => set("shipping_depth", e.target.value)}
          />
          <Select
            label="Distance unit"
            value={value.distance_unit}
            onChange={(e) => set("distance_unit", e.target.value)}
          >
            {DISTANCE_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          <Input
            label="Meta title"
            value={value.meta_title}
            onChange={(e) => set("meta_title", e.target.value)}
          />
          <Input
            label="Meta description"
            value={value.meta_description}
            onChange={(e) => set("meta_description", e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
            <input
              type="checkbox"
              checked={value.free_shipping}
              onChange={(e) => set("free_shipping", e.target.checked)}
            />
            Free shipping
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={value.has_expiry}
              onChange={(e) => set("has_expiry", e.target.checked)}
            />
            Has expiry
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={value.stuff_pick}
              onChange={(e) => set("stuff_pick", e.target.checked)}
            />
            Staff pick
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={value.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            Active inventory
          </label>
        </div>
      ) : null}
    </div>
  );
}
