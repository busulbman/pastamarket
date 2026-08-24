import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { PanelNav } from "@/components/panel/panel-nav";
export const dynamic = "force-dynamic";
export default async function PanelLayout({ children }: { children: React.ReactNode }) { const admin = await currentAdmin(); if (!admin) redirect("/panel/login"); return <div className="min-h-screen bg-zinc-50 lg:grid lg:grid-cols-[240px_1fr]"><PanelNav username={admin.username}/><main className="min-w-0 p-4 md:p-8">{children}</main></div>; }
