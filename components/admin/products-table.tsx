"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteProduct, useProducts } from "@/lib/hooks/use-products";

export function ProductsTable() {
  const { data, isLoading, isError, error } = useProducts();
  const deleteMutation = useDeleteProduct();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-danger">
        {(error as Error).message || "Failed to load products"}
      </p>
    );
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-soft/40 text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((product) => (
            <tr key={product.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 overflow-hidden rounded bg-brand-soft">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <span className="font-medium">{product.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted">{product.category}</td>
              <td className="px-4 py-3">${product.price.toFixed(2)}</td>
              <td className="px-4 py-3">{product.stock}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="inline-flex h-9 items-center rounded-md border border-border px-3 hover:bg-brand-soft"
                  >
                    Edit
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={deletingId === product.id}
                    onClick={() => onDelete(product.id)}
                  >
                    {deletingId === product.id ? "…" : "Delete"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {!data?.length ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted">
                No products yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
