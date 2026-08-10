import type { Metadata } from "next";
import { ProductDetail } from "@/components/store/product-detail";

export const metadata: Metadata = {
  title: "Product",
};

export default async function ProductPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
