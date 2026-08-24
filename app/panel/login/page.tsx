import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/panel/login-form";
export const dynamic = "force-dynamic";
export default async function PanelLoginPage() { if (await currentAdmin()) redirect("/panel"); return <main className="grid min-h-screen place-items-center bg-brand-soft p-4"><LoginForm /></main>; }
