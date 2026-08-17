import type { Metadata } from "next";
import { settings } from "@/lib/data";
import { InfoPage } from "@/components/info-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | PastaMarket",
};

export default async function DistanceSalesPage() {
  const s = await settings();

  return (
    <InfoPage
      title="Mesafeli Satış Sözleşmesi"
      content={s.page_distance_sales}
      settingLabel="Mesafeli satış sözleşmesi metni"
    />
  );
}
