import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Gizlilik Politikası | PastaMarket" };

export const revalidate = 300;
export default async function PrivacyPage() {
  const s = await getSettings();

  return (
    <InfoPage
      title="Gizlilik Politikası"
      content={s.page_privacy}
      settingLabel="Gizlilik politikası metni"
    />
  );
}
