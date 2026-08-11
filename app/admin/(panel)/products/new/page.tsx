import type { Metadata } from "next";
import { ProductWizard } from "@/components/admin/products/product-wizard";

export const metadata: Metadata = {
  title: "New product",
};

export default function NewProductPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          Product creation wizard
        </h1>
        <p className="mt-2 text-sm text-muted">
          Step 1: product basics → Step 2: inventories → Step 3: review & submit.
        </p>
      </div>
      <ProductWizard />
    </div>
  );
}
