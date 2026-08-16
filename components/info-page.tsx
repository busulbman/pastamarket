import { StoreShell } from "@/components/store-shell";

/**
 * Yönetim panelinden düzenlenen kurumsal metin sayfaları.
 * Metin girilmediyse uydurma içerik gösterilmez; alanın nereden
 * doldurulacağı açıkça belirtilir.
 */
export function InfoPage({
  title,
  content,
  settingLabel,
  children,
}: {
  title: string;
  content?: string;
  settingLabel: string;
  children?: React.ReactNode;
}) {
  const text = (content || "").trim();

  return (
    <StoreShell>
      <main className="container max-w-3xl py-10">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>

        {children}

        {text ? (
          <div className="mt-6 whitespace-pre-line text-sm leading-7 text-muted">{text}</div>
        ) : (
          <p className="mt-6 rounded-2xl bg-brand-soft p-6 text-sm leading-6 text-muted">
            Bu sayfanın metni henüz eklenmemiştir. İçerik, yönetim paneli → Site ayarları →{" "}
            <b className="text-ink">{settingLabel}</b> alanından girildiğinde burada yayınlanır.
          </p>
        )}
      </main>
    </StoreShell>
  );
}
