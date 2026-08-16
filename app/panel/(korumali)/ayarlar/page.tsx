import type { Metadata } from "next";
import { settings } from "@/lib/db";
import { PageHeader } from "@/components/panel/ui";
import { SettingsForm } from "@/components/panel/settings-form";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ayarlar | PastaMarket" };

export default function PanelSettings() {
  return (
    <>
      <PageHeader
        title="Ayarlar"
        description="Site genelinde kullanılan iletişim, teslimat ve içerik bilgileri"
      />
      <SettingsForm initial={settings()} readOnly={demoReadOnly} />
    </>
  );
}
