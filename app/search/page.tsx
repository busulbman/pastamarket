import { redirect } from "next/navigation";

/** Eski /search bağlantıları ürün listesine taşındı. */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value) query.set(key, value);
  });
  const search = query.toString();
  redirect(search ? `/urunler?${search}` : "/urunler");
}
