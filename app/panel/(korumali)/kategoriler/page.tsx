import { categories } from "@/lib/data";
import { CategoryManager } from "@/components/panel/category-manager";
export const dynamic = "force-dynamic";
export default async function PanelCategories() { return <><h1 className="mb-6 text-2xl font-extrabold text-ink">Kategoriler</h1><CategoryManager initial={await categories(false)}/></>; }
