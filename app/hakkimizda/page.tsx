import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Hakkımızda | PastaMarket" };

export default function AboutPage() {
  const s = getSettings();

  return (
    <InfoPage
      title="Hakkımızda"
      content={s.page_about}
      settingLabel="Hakkımızda metni"
    />
  );
}
