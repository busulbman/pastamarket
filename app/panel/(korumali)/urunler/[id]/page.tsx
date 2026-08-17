import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, productById } from "@/lib/data";
import { PageHeader, secondaryButton } from "@/components/panel/ui";
import { ProductForm } from "@/components/panel/product-form";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ürünü düzenle | PastaMarket" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Pasif ürünler de panelde düzenlenebilmelidir.
  const product = await productById(Number(id), true);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title="Ürünü düzenle"
        description={product.name}
        action={
          product.active ? (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className={secondaryButton}
            >
              Sitede görüntüle
            </Link>
          ) : undefined
        }
      />
      <ProductForm product={product} categories={await categories(false)} readOnly={demoReadOnly} />
    </>
  );
}
