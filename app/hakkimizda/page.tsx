import type { Metadata } from "next";
import { settings } from "@/lib/db";
import { InfoPage } from "@/components/info-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hakkımızda | PastaMarket" };

export default function AboutPage() {
  return (
    <InfoPage
      title="Hakkımızda"
      content={settings().page_about}
      settingLabel="Hakkımızda metni"
    />
  );
}
