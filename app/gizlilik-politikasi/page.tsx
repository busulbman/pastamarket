import type { Metadata } from "next";
import { settings } from "@/lib/data";
import { InfoPage } from "@/components/info-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gizlilik Politikası | PastaMarket" };

export default async function PrivacyPage() {
  const s = await settings();

  return (
    <InfoPage
      title="Gizlilik Politikası"
      content={s.page_privacy}
      settingLabel="Gizlilik politikası metni"
    />
  );
}
