import { settings } from "@/lib/data";
import { SettingsForm } from "@/components/panel/settings-form";
export const dynamic = "force-dynamic";
export default async function PanelSettings() { return <><h1 className="mb-6 text-2xl font-extrabold text-ink">Site ayarları</h1><SettingsForm initial={await settings()}/></>; }
