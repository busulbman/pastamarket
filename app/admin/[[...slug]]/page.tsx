import { permanentRedirect } from "next/navigation";

/**
 * Panel /admin adresinden /panel adresine taşındı.
 * Eski bağlantılar (yer imleri, paylaşılmış linkler) boşa düşmesin diye
 * karşılıklarına kalıcı olarak yönlendirilir.
 */
const ROUTE_MAP: Record<string, string> = {
  "": "/panel",
  login: "/panel/login",
  products: "/panel/urunler",
  categories: "/panel/kategoriler",
  orders: "/panel/siparisler",
  settings: "/panel/ayarlar",
};

export default async function AdminRedirect({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const key = (slug ?? []).join("/");
  permanentRedirect(ROUTE_MAP[key] ?? "/panel");
}
