"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/lib/hooks/use-products";
import type { Product } from "@/lib/types";
import { productSchema } from "@/lib/validators/product";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const pending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    const form = new FormData(e.currentTarget);
    const parsed = productSchema.safeParse({
      name: form.get("name"),
      description: form.get("description"),
      price: form.get("price"),
      image: form.get("image"),
      category: form.get("category"),
      stock: form.get("stock"),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? "form");
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (product) {
        await updateMutation.mutateAsync(parsed.data);
        router.push("/admin/products");
      } else {
        await createMutation.mutateAsync(parsed.data);
        router.push("/admin/products");
      }
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <Input
        name="name"
        label="Name"
        defaultValue={product?.name}
        error={errors.name}
      />
      <Textarea
        name="description"
        label="Description"
        defaultValue={product?.description}
        error={errors.description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="price"
          type="number"
          step="0.01"
          label="Price"
          defaultValue={product?.price ?? ""}
          error={errors.price}
        />
        <Input
          name="stock"
          type="number"
          label="Stock"
          defaultValue={product?.stock ?? 0}
          error={errors.stock}
        />
      </div>
      <Input
        name="category"
        label="Category"
        defaultValue={product?.category}
        error={errors.category}
      />
      <Input
        name="image"
        label="Image URL"
        defaultValue={product?.image}
        placeholder="https://..."
        error={errors.image}
      />
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
