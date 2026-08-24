import { config } from "@/lib/config";
import { BulkImporter } from "@/components/panel/bulk-importer";
export const dynamic = "force-dynamic";
export default function BulkImportPage() { return <><h1 className="mb-2 text-2xl font-extrabold text-ink">Toplu Ürün Aktar</h1><p className="mb-6 text-sm text-muted">CSV ürün verilerini önizleyin, Firestore’a güvenle aktarın ve eşleşen görselleri Cloudinary’ye doğrudan yükleyin.</p><BulkImporter imageProvider={config.imageProvider}/></>; }
