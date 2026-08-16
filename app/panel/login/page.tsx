import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminAuthConfigured, requireAdmin } from "@/lib/auth";
import { isProduction, missingAuthEnvKeys } from "@/lib/config";
import { LoginForm } from "@/components/panel/login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel girişi | PastaMarket" };

export default async function PanelLoginPage() {
  if (await requireAdmin()) redirect("/panel");

  const configured = adminAuthConfigured();
  // Eksik anahtarların yalnızca adı gösterilir; değerleri hiçbir zaman değil.
  const missing = missingAuthEnvKeys();

  return (
    <main className="grid min-h-screen place-items-center bg-brand-soft p-4">
      <div className="w-full max-w-sm">
        <LoginForm enabled={configured} />

        {!configured && (
          <div className="card mt-4 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <b className="block">Panel girişi kapalı</b>
            <p className="mt-1.5 leading-6">
              {isProduction
                ? "Sunucu yapılandırması tamamlanmadığı için giriş devre dışı."
                : "Şu ortam değişkenleri tanımlı değil:"}
            </p>
            {!isProduction && (
              <>
                <ul className="mt-2 list-inside list-disc font-mono text-xs">
                  {missing.map((key) => (
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
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
