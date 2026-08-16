import { categories, settings } from "@/lib/db";
import { whatsappLink } from "@/lib/format";
import { WHATSAPP_DEFAULT_MESSAGE } from "@/lib/constants";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Mağaza tarafındaki tüm sayfaların ortak çerçevesi.
 * Ayarlar ve kategoriler yalnızca burada okunur, alt bileşenlere prop olarak geçer.
 */
export function StoreShell({ children }: { children: React.ReactNode }) {
  const s = settings();
  const nav = categories();
  const whatsappHref = whatsappLink(s.whatsapp, WHATSAPP_DEFAULT_MESSAGE);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        brand={s.brand_name}
        tagline={s.tagline}
        announcement={s.announcement}
        whatsappHref={whatsappHref}
        categories={nav}
      />

      <div className="flex-1">{children}</div>

      <Footer
        brand={s.brand_name}
        tagline={s.tagline}
        phone={s.phone}
        address={s.address}
        hours={s.hours}
        instagram={s.instagram}
        whatsappHref={whatsappHref}
        categories={nav}
      />

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile iletişime geçin"
          className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
