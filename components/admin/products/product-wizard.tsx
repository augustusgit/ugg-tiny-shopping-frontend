"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { HybridApprovalPanel } from "@/components/admin/approvals/hybrid-approval-panel";
import {
  InventoryFields,
  draftToInventoryPayload,
  emptyInventoryDraft,
  inventoryFromApi,
  type InventoryDraft,
} from "@/components/admin/products/inventory-fields";
import { WizardStepper } from "@/components/admin/products/wizard-stepper";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  useAdminProduct,
  useWizardMutations,
} from "@/lib/hooks/use-admin-products";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import type {
  AdminProduct,
  WizardProgress,
  WizardResponse,
} from "@/lib/types/products";
import { omitEmpty } from "@/lib/utils/empty";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import {
  productStepOneSchema,
  submitWizardSchema,
  wizardStepTwoSchema,
} from "@/lib/validators/admin-products";

function canEditWizard(product?: AdminProduct | null) {
  if (!product) return true;
  return product.status === "draft" || product.status === "pending_review";
}

function initialStep(product?: AdminProduct | null): 1 | 2 | 3 {
  if (!product) return 1;
  if (!product.step_one_completed_at) return 1;
  if (!product.step_two_completed_at) return 2;
  return 3;
}

export function ProductWizard({ productId }: { productId?: number }) {
  const existing = useAdminProduct(productId ?? 0);

  if (productId) {
    if (existing.isLoading) {
      return (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      );
    }
    if (existing.isError || !existing.data) {
      const formatted = formatApiError(existing.error);
      return (
        <Alert
          variant="error"
          title={formatted.message}
          items={formatted.errors}
        />
      );
    }
    return (
      <ProductWizardInner
        key={`${productId}-${existing.data.product.updated_at}`}
        productId={productId}
        initial={existing.data}
      />
    );
  }

  return <ProductWizardInner key="new" />;
}

function ProductWizardInner({
  productId,
  initial,
}: {
  productId?: number;
  initial?: WizardResponse;
}) {
  const router = useRouter();
  const wizard = useWizardMutations();

  const [step, setStep] = useState<1 | 2 | 3>(initialStep(initial?.product));
  const [product, setProduct] = useState<AdminProduct | null>(
    initial?.product ?? null,
  );
  const [progress, setProgress] = useState<WizardProgress | null>(
    initial?.progress ?? null,
  );
  const [flash, setFlash] = useState<{
    variant: "error" | "success" | "warning" | "info";
    title: string;
    items?: string[];
  } | null>(null);
  const [stepOneErrors, setStepOneErrors] = useState<Record<string, string>>(
    {},
  );
  const [inventoryErrors, setInventoryErrors] = useState<
    Record<number, Record<string, string>>
  >({});
  const [inventories, setInventories] = useState<InventoryDraft[]>(() =>
    initial?.product.inventories?.length
      ? initial.product.inventories.map(inventoryFromApi)
      : [emptyInventoryDraft()],
  );
  const [advancedOpen, setAdvancedOpen] = useState<Record<number, boolean>>({});
  const [publish, setPublish] = useState(true);
  const [metaTitle, setMetaTitle] = useState(
    initial?.product.meta_title ?? initial?.product.name ?? "",
  );
  const [metaDescription, setMetaDescription] = useState(
    initial?.product.meta_description ?? "",
  );
  const [reviewLoaded, setReviewLoaded] = useState(
    Boolean(initial?.product.step_two_completed_at && initialStep(initial.product) === 3),
  );
  const [approvalRequestId, setApprovalRequestId] = useState<number | null>(
    null,
  );

  const pending =
    wizard.createStepOne.isPending ||
    wizard.updateStepOne.isPending ||
    wizard.saveStepTwo.isPending ||
    wizard.review.isPending ||
    wizard.submit.isPending;

  const editable = canEditWizard(product);

  const stepOneDefaults = useMemo(
    () => ({
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      brand: product?.brand ?? "",
      model_number: product?.model_number ?? "",
      mpn: product?.mpn ?? "",
      gtin: product?.gtin ?? "",
      gtin_type: product?.gtin_type ?? "",
      description: product?.description ?? "",
      requires_shipping: product?.requires_shipping !== false,
      downloadable: Boolean(product?.downloadable),
      is_featured: Boolean(product?.is_featured),
      has_variant: Boolean(product?.has_variant),
      meta_title: product?.meta_title ?? "",
      meta_description: product?.meta_description ?? "",
    }),
    [product],
  );

  async function ensureReview(current: AdminProduct) {
    if (!current.step_two_completed_at) return;
    try {
      const result = await wizard.review.mutateAsync(current.id);
      setProduct(result.product);
      setProgress(result.progress);
      setReviewLoaded(true);
    } catch (error) {
      const formatted = formatApiError(error);
      setFlash({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    }
  }

  async function goToStep3(current: AdminProduct) {
    setStep(3);
    if (!reviewLoaded) {
      await ensureReview(current);
    }
  }

  async function submitStepOne(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFlash(null);
    setStepOneErrors({});
    if (product && !editable) {
      setFlash({
        variant: "warning",
        title: "Published products cannot be edited via the wizard.",
      });
      return;
    }

    const form = new FormData(e.currentTarget);
    const raw = {
      name: String(form.get("name") || ""),
      slug: String(form.get("slug") || ""),
      brand: String(form.get("brand") || ""),
      model_number: String(form.get("model_number") || ""),
      mpn: String(form.get("mpn") || ""),
      gtin: String(form.get("gtin") || ""),
      gtin_type: String(form.get("gtin_type") || ""),
      description: String(form.get("description") || ""),
      requires_shipping: form.get("requires_shipping") === "on",
      downloadable: form.get("downloadable") === "on",
      is_featured: form.get("is_featured") === "on",
      has_variant: form.get("has_variant") === "on",
      meta_title: String(form.get("meta_title") || ""),
      meta_description: String(form.get("meta_description") || ""),
    };

    const parsed = productStepOneSchema.safeParse(raw);
    if (!parsed.success) {
      setStepOneErrors(zodFieldErrors(parsed.error));
      return;
    }

    const payload = omitEmpty({ ...parsed.data }) as typeof parsed.data;

    try {
      const result = product
        ? await wizard.updateStepOne.mutateAsync({
            productId: product.id,
            input: payload,
          })
        : await wizard.createStepOne.mutateAsync(payload);

      setProduct(result.product);
      setProgress(result.progress);
      setFlash({ variant: "success", title: "Product draft saved" });
      setStep(2);
      if (!productId) {
        router.replace(`/admin/products/${result.product.id}/wizard?step=2`);
      }
    } catch (error) {
      const formatted = formatApiError(error);
      setFlash({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    }
  }

  async function submitStepTwo(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    setInventoryErrors({});
    if (!product) {
      setFlash({
        variant: "error",
        title: "Complete step 1 before adding inventories.",
      });
      setStep(1);
      return;
    }
    if (!editable) {
      setFlash({
        variant: "warning",
        title: "This product is no longer editable in the wizard.",
      });
      return;
    }

    const payloads = inventories.map(draftToInventoryPayload);
    const parsed = wizardStepTwoSchema.safeParse({ inventories: payloads });
    if (!parsed.success) {
      const byIndex: Record<number, Record<string, string>> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0] === "inventories" && typeof issue.path[1] === "number") {
          const idx = issue.path[1];
          const field = String(issue.path[2] ?? "form");
          byIndex[idx] = byIndex[idx] || {};
          if (!byIndex[idx][field]) byIndex[idx][field] = issue.message;
        }
      });
      setInventoryErrors(byIndex);
      setFlash({
        variant: "error",
        title: "Fix inventory validation errors before continuing.",
      });
      return;
    }

    if (
      product.inventories?.length &&
      !confirm(
        "Saving step 2 replaces all existing inventories for this draft. Continue?",
      )
    ) {
      return;
    }

    try {
      const result = await wizard.saveStepTwo.mutateAsync({
        productId: product.id,
        inventories: parsed.data.inventories,
      });
      setProduct(result.product);
      setProgress(result.progress);
      if (result.product.inventories?.length) {
        setInventories(result.product.inventories.map(inventoryFromApi));
      }
      setFlash({ variant: "success", title: "Inventories saved" });
      setReviewLoaded(false);
      await goToStep3(result.product);
    } catch (error) {
      const formatted = formatApiError(error);
      setFlash({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    }
  }

  async function submitFinal(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    if (!product) return;
    if (!progress?.can_submit && !product.step_two_completed_at) {
      setFlash({
        variant: "warning",
        title: "Complete product and inventory steps before submission.",
      });
      return;
    }

    if (publish && !approvalRequestId) {
      setFlash({
        variant: "warning",
        title: "Hybrid approval required",
        items: [
          "Grant on-chain permission, then Sign approval & decide before publishing.",
        ],
      });
      return;
    }

    const parsed = submitWizardSchema.safeParse({
      publish,
      meta_title: metaTitle,
      meta_description: metaDescription,
    });
    if (!parsed.success) {
      setFlash({
        variant: "error",
        title: "Invalid submission options",
        items: Object.values(zodFieldErrors(parsed.error)),
      });
      return;
    }

    try {
      const result = await wizard.submit.mutateAsync({
        productId: product.id,
        input: omitEmpty({
          ...parsed.data,
          ...(publish && approvalRequestId
            ? { approval_request_id: approvalRequestId }
            : {}),
        }) as typeof parsed.data & { approval_request_id?: number },
      });
      setProduct(result.product);
      setProgress(result.progress);
      setFlash({
        variant: "success",
        title: publish
          ? "Product submitted and published"
          : "Product submitted for review",
      });
      router.push(`/admin/products/${result.product.id}`);
    } catch (error) {
      const formatted = formatApiError(error);
      setFlash({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    }
  }

  if (product && !editable && step < 3) {
    return (
      <div className="space-y-4">
        <Alert
          variant="warning"
          title="Wizard locked"
          items={[
            "Only draft or pending-review products can be edited in the wizard.",
            `Current status: ${product.status_label || product.status}`,
          ]}
        />
        <Link
          href={`/admin/products/${product.id}`}
          className="text-brand underline"
        >
          Open product management
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WizardStepper progress={progress} activeStep={step} />

      {flash ? (
        <Alert variant={flash.variant} title={flash.title} items={flash.items} />
      ) : null}

      {step === 1 ? (
        <form
          key={product?.id ?? "new"}
          onSubmit={submitStepOne}
          className="max-w-2xl space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="name"
              label="Product name *"
              defaultValue={stepOneDefaults.name}
              error={stepOneErrors.name}
            />
            <Input
              name="slug"
              label="Slug"
              defaultValue={stepOneDefaults.slug}
              error={stepOneErrors.slug}
            />
            <Input
              name="brand"
              label="Brand"
              defaultValue={stepOneDefaults.brand}
              error={stepOneErrors.brand}
            />
            <Input
              name="model_number"
              label="Model number"
              defaultValue={stepOneDefaults.model_number}
            />
            <Input name="mpn" label="MPN" defaultValue={stepOneDefaults.mpn} />
            <Input
              name="gtin"
              label="GTIN"
              defaultValue={stepOneDefaults.gtin}
            />
            <Input
              name="gtin_type"
              label="GTIN type"
              defaultValue={stepOneDefaults.gtin_type}
              placeholder="UPC, EAN…"
            />
            <Input
              name="meta_title"
              label="Meta title"
              defaultValue={stepOneDefaults.meta_title}
            />
          </div>
          <Textarea
            name="description"
            label="Description"
            defaultValue={stepOneDefaults.description}
          />
          <Input
            name="meta_description"
            label="Meta description"
            defaultValue={stepOneDefaults.meta_description}
          />
          <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requires_shipping"
                defaultChecked={stepOneDefaults.requires_shipping}
              />
              Requires shipping
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="downloadable"
                defaultChecked={stepOneDefaults.downloadable}
              />
              Downloadable / digital
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={stepOneDefaults.is_featured}
              />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="has_variant"
                defaultChecked={stepOneDefaults.has_variant}
              />
              Has variants
            </label>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save & continue to inventories"}
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form onSubmit={submitStepTwo} className="space-y-4">
          <Alert
            variant="info"
            title="Inventories"
            items={[
              "Add one or more SKUs. Saving replaces the draft inventory set.",
              "SKUs must be unique within this product.",
            ]}
          />
          {inventories.map((inv, index) => (
            <div key={index} className="space-y-2">
              <InventoryFields
                index={index}
                value={inv}
                errors={inventoryErrors[index]}
                showAdvanced={Boolean(advancedOpen[index])}
                onToggleAdvanced={() =>
                  setAdvancedOpen((s) => ({ ...s, [index]: !s[index] }))
                }
                onChange={(next) =>
                  setInventories((list) =>
                    list.map((item, i) => (i === index ? next : item)),
                  )
                }
              />
              {inventories.length > 1 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setInventories((list) => list.filter((_, i) => i !== index))
                  }
                >
                  Remove inventory
                </Button>
              ) : null}
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setInventories((list) => [
                  ...list,
                  emptyInventoryDraft({
                    brand: product?.brand ?? "",
                    title: product?.name ?? "",
                  }),
                ])
              }
            >
              Add inventory
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save inventories & review"}
            </Button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form onSubmit={submitFinal} className="max-w-2xl space-y-5">
          {!product?.step_two_completed_at ? (
            <Alert
              variant="warning"
              title="Inventories incomplete"
              items={["Go back to step 2 and save at least one inventory."]}
            />
          ) : null}

          <div className="space-y-2 border-y border-border py-4 text-sm">
            <p>
              <span className="text-muted">Product:</span>{" "}
              <strong>{product?.name}</strong>
            </p>
            <p>
              <span className="text-muted">Brand:</span> {product?.brand || "—"}
            </p>
            <p>
              <span className="text-muted">Inventories:</span>{" "}
              {product?.inventories?.length ?? progress?.inventory_count ?? 0}
            </p>
            <p>
              <span className="text-muted">Price range:</span>{" "}
              {product?.min_price != null
                ? `$${Number(product.min_price).toFixed(2)}`
                : "—"}
              {product?.max_price != null &&
              product.max_price !== product.min_price
                ? ` – $${Number(product.max_price).toFixed(2)}`
                : ""}
            </p>
            {product?.inventories?.length ? (
              <ul className="mt-2 space-y-1 text-muted">
                {product.inventories.map((inv) => (
                  <li key={inv.id}>
                    {inv.sku} · {inv.condition} · qty {inv.stock_quantity} · $
                    {Number(inv.sale_price).toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Input
            label="Meta title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
          />
          <Input
            label="Meta description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => {
                setPublish(e.target.checked);
                if (!e.target.checked) {
                  setApprovalRequestId(null);
                }
              }}
            />
            Publish immediately (unchecked = submit for review)
          </label>

          {product ? (
            <HybridApprovalPanel
              productId={product.id}
              enabled={publish}
              onApproved={(id) => {
                setApprovalRequestId(id);
                setFlash({
                  variant: "success",
                  title: "Hybrid approval ready",
                  items: [`Approval request #${id} can be used to publish.`],
                });
              }}
              onCleared={() => setApprovalRequestId(null)}
            />
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending || !product}
              onClick={() => product && ensureReview(product)}
            >
              Refresh review
            </Button>
            <Button
              type="submit"
              disabled={
                pending ||
                !product?.step_two_completed_at ||
                (publish && !approvalRequestId)
              }
            >
              {pending
                ? "Submitting…"
                : publish
                  ? "Submit & publish"
                  : "Submit for review"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
