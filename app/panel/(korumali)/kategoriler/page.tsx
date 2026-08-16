import type { Metadata } from "next";
import { categories, categoryProductCount } from "@/lib/db";
import { PageHeader } from "@/components/panel/ui";
import { CategoryManager } from "@/components/panel/category-manager";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kategoriler | PastaMarket" };

export default function PanelCategories() {
  const list = categories(false).map((category) => ({
    ...category,
    productCount: categoryProductCount(category.id),
  }));

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
