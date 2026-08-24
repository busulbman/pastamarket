import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Hakkımızda | PastaMarket" };

export const revalidate = 300;
export default async function AboutPage() {
  const s = await getSettings();

  return (
    <InfoPage
      title="Hakkımızda"
      content={s.page_about}
      settingLabel="Hakkımızda metni"
    />
  );
}
