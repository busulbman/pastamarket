import { notFound } from "next/navigation";
import { categories, productById } from "@/lib/data";
import { ProductForm } from "@/components/panel/product-manager";
import { config } from "@/lib/config";
export const dynamic = "force-dynamic";
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [product, categoryList] = await Promise.all([productById(Number(id), true), categories(false)]); if (!product) notFound(); return <><h1 className="mb-6 text-2xl font-extrabold text-ink">Ürünü düzenle</h1><ProductForm product={product} categories={categoryList} imageProvider={config.imageProvider}/></>; }
