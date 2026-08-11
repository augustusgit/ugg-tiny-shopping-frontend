"use client";

import Link from "next/link";
import { use } from "react";
import { ProductWizard } from "@/components/admin/products/product-wizard";

export default function ProductWizardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
            Product wizard
          </h1>
          <p className="mt-2 text-sm text-muted">
            Resume draft creation for product #{id}.
          </p>
        </div>
        <Link
          href={`/admin/products/${id}`}
          className="text-sm text-brand underline"
        >
          Open management view
        </Link>
      </div>
      <ProductWizard productId={Number(id)} />
    </div>
  );
}
