import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | PastaMarket",
};

export default function DistanceSalesPage() {
  const s = getSettings();

  return (
    <InfoPage
      title="Mesafeli Satış Sözleşmesi"
      content={s.page_distance_sales}
      settingLabel="Mesafeli satış sözleşmesi metni"
    />
  );
}
