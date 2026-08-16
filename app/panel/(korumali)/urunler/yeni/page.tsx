import type { Metadata } from "next";
import { categories } from "@/lib/db";
import { PageHeader } from "@/components/panel/ui";
import { ProductForm } from "@/components/panel/product-form";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Yeni ürün | PastaMarket" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Yeni ürün" description="Kataloğa yeni bir ürün ekleyin" />
      <ProductForm categories={categories(false)} readOnly={demoReadOnly} />
    </>
  );
}
