import type { Metadata } from "next";
import { settings } from "@/lib/db";
import { InfoPage } from "@/components/info-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | PastaMarket",
};

export default function DistanceSalesPage() {
  return (
    <InfoPage
      title="Mesafeli Satış Sözleşmesi"
      content={settings().page_distance_sales}
      settingLabel="Mesafeli satış sözleşmesi metni"
    />
  );
}
