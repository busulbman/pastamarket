import type { Metadata } from "next";
import { categories, categoryProductCount } from "@/lib/data";
import { PageHeader } from "@/components/panel/ui";
import { CategoryManager } from "@/components/panel/category-manager";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kategoriler | PastaMarket" };

export default async function PanelCategories() {
  const all = await categories(false);
  const list = await Promise.all(
    all.map(async (category) => ({
      ...category,
      productCount: await categoryProductCount(category.id),
    })),
  );

  return (
    <>
      <PageHeader
        title="Kategoriler"
        description="Mağaza menüsünde ve ana sayfada görünen kategoriler"
      />
      <CategoryManager initial={list} readOnly={demoReadOnly} />
    </>
  );
}
