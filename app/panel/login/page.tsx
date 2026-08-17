import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { isProduction, readAdminAuthConfig } from "@/lib/config";
import { LoginForm } from "@/components/panel/login-form";

// Giriş durumu asla önbelleğe alınmaz veya build sırasında dondurulmaz.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export const metadata: Metadata = { title: "Panel girişi | PastaMarket" };

export default async function PanelLoginPage() {
  // ADMIN_* değerleri her istekte sunucu runtime'ından okunsun.
  noStore();

  if (await requireAdmin()) redirect("/panel");

  const auth = readAdminAuthConfig();

  return (
    <main className="grid min-h-screen place-items-center bg-brand-soft p-4">
      <div className="w-full max-w-sm">
        {/* Form her koşulda kullanılabilir; alanlar hiçbir zaman kilitlenmez. */}
        <LoginForm />

        {!auth.configured && !isProduction && (
          <div className="card mt-4 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <b className="block">Yapılandırma uyarısı (yalnızca geliştirme)</b>
            <p className="mt-1.5 leading-6">
              Şu ortam değişkenleri eksik veya geçersiz görünüyor:
            </p>
            <ul className="mt-2 list-inside list-disc font-mono text-xs">
              {auth.missing.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
            <p className="mt-3 leading-6">
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                npm run admin:create-password
              </code>{" "}
              komutunu çalıştırıp <code>.env.local</code> dosyasını doldurun, ardından
              sunucuyu yeniden başlatın.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
