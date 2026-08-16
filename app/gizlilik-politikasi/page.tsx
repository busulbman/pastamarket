import type { Metadata } from "next";
import { settings } from "@/lib/db";
import { InfoPage } from "@/components/info-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gizlilik Politikası | PastaMarket" };

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Gizlilik Politikası"
      content={settings().page_privacy}
      settingLabel="Gizlilik politikası metni"
    />
  );
}
