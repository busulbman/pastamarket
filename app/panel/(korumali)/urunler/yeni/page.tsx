import { categories } from "@/lib/data";
import { ProductForm } from "@/components/panel/product-manager";
import { config } from "@/lib/config";
export const dynamic = "force-dynamic";
export default async function NewProduct() { return <><h1 className="mb-6 text-2xl font-extrabold text-ink">Yeni ürün</h1><ProductForm categories={await categories(false)} imageProvider={config.imageProvider}/></>; }
