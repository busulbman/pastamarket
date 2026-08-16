import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { settings } from "@/lib/db";
import { whatsappLink } from "@/lib/format";
import { WHATSAPP_DEFAULT_MESSAGE } from "@/lib/constants";
import { StoreShell } from "@/components/store-shell";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "İletişim | PastaMarket" };

export default function ContactPage() {
  const s = settings();
  const whatsappHref = whatsappLink(s.whatsapp, WHATSAPP_DEFAULT_MESSAGE);

  // Yalnızca yönetim panelinden girilmiş gerçek bilgiler gösterilir.
  const channels = [
    whatsappHref && {
      key: "whatsapp",
      icon: <WhatsAppIcon className="h-5 w-5" />,
      title: "WhatsApp",
      value: "Sipariş ve sorularınız için yazın",
      href: whatsappHref,
      external: true,
    },
    s.phone && {
      key: "phone",
      icon: <Phone size={19} />,
      title: "Telefon",
      value: s.phone,
      href: `tel:${s.phone.replace(/\s/g, "")}`,
    },
    s.instagram && {
      key: "instagram",
      icon: <InstagramIcon className="h-[19px] w-[19px]" />,
      title: "Instagram",
      value: "Instagram sayfamız",
      href: s.instagram,
      external: true,
    },
    s.address && {
      key: "address",
      icon: <MapPin size={19} />,
      title: "Adres",
      value: s.address,
    },
    s.hours && {
      key: "hours",
      icon: <Clock size={19} />,
      title: "Çalışma saatleri",
      value: s.hours,
    },
  ].filter(Boolean) as {
    key: string;
    icon: React.ReactNode;
    title: string;
    value: string;
    href?: string;
    external?: boolean;
  }[];

  return (
    <StoreShell>
      <main className="container max-w-3xl py-10">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">İletişim</h1>
        <p className="mt-2 text-sm text-muted">
          Sipariş, ürün ve teslimat sorularınız için bize ulaşabilirsiniz.
        </p>

        {channels.length > 0 ? (
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {channels.map((channel) => {
              const body = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                    {channel.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink">{channel.title}</span>
                    <span className="mt-0.5 block break-words text-sm text-muted">
                      {channel.value}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={channel.key}>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      {...(channel.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="flex h-full items-center gap-4 rounded-2xl border border-line bg-white p-5 transition hover:border-brand"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex h-full items-center gap-4 rounded-2xl border border-line bg-white p-5">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-7 rounded-2xl bg-brand-soft p-6 text-sm leading-6 text-muted">
            İletişim bilgileri henüz tanımlanmamıştır. WhatsApp numarası, telefon ve adres
            yönetim paneli → Site ayarları ekranından girildiğinde bu sayfada ve site genelinde
            görünür.
          </p>
        )}
      </main>
    </StoreShell>
  );
}
