import type { Metadata } from "next";
import { ProductDetail } from "@/components/store/product-detail";

export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: decodeURIComponent(id).replace(/-/g, " "),
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
