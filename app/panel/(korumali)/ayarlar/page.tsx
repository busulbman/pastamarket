import type { Metadata } from "next";
import { settings } from "@/lib/data";
import { PageHeader } from "@/components/panel/ui";
import { SettingsForm } from "@/components/panel/settings-form";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ayarlar | PastaMarket" };

export default async function PanelSettings() {
  return (
    <>
      <PageHeader
        title="Ayarlar"
        description="Site genelinde kullanılan iletişim, teslimat ve içerik bilgileri"
      />
      <SettingsForm initial={await settings()} readOnly={demoReadOnly} />
    </>
  );
}
