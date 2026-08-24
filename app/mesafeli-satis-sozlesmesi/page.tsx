import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | PastaMarket",
};

export const revalidate = 300;
export default async function DistanceSalesPage() {
  const s = await getSettings();

  return (
    <InfoPage
      title="Mesafeli Satış Sözleşmesi"
      content={s.page_distance_sales}
      settingLabel="Mesafeli satış sözleşmesi metni"
    />
  );
}
