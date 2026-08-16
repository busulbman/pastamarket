import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { PanelNav } from "@/components/panel/panel-nav";
import { DemoNotice } from "@/components/demo-notice";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Korumalı panel çerçevesi. Giriş sayfası bu route group'un dışındadır;
 * aksi hâlde /panel/login kendine yönlenerek döngüye girerdi.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await currentAdmin();
  if (!admin) redirect("/panel/login");

  return (
    <div className="min-h-screen bg-zinc-50 lg:grid lg:grid-cols-[240px_1fr]">
      <PanelNav email={admin.email} />
      <main className="min-w-0 p-4 md:p-8">
        {demoReadOnly && <DemoNotice className="mb-6" />}
        {children}
      </main>
    </div>
  );
}
