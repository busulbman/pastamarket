import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Gizlilik Politikası | PastaMarket" };

export default function PrivacyPage() {
  const s = getSettings();

  return (
    <InfoPage
      title="Gizlilik Politikası"
      content={s.page_privacy}
      settingLabel="Gizlilik politikası metni"
    />
  );
}
