import { config } from "@/lib/config";
import { BulkImporter } from "@/components/panel/bulk-importer";
import { ExistingProductImageBulk } from "@/components/panel/existing-product-image-bulk";
export const dynamic = "force-dynamic";
export default function BulkImportPage() { return <><h1 className="mb-2 text-2xl font-extrabold text-ink">Toplu Ürün Aktar</h1><p className="mb-6 text-sm text-muted">CSV ürün verilerini önizleyin, Firestore’a güvenle aktarın ve mevcut ürünlerinize Cloudinary görsellerini bağlayın.</p><BulkImporter imageProvider={config.imageProvider}/><div className="my-8 border-t border-line-soft"/><ExistingProductImageBulk imageProvider={config.imageProvider}/></>; }
