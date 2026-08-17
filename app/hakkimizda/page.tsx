import type { Metadata } from "next";
import { settings } from "@/lib/data";
import { InfoPage } from "@/components/info-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hakkımızda | PastaMarket" };

export default async function AboutPage() {
  const s = await settings();

  return (
    <InfoPage
      title="Hakkımızda"
      content={s.page_about}
      settingLabel="Hakkımızda metni"
    />
  );
}
