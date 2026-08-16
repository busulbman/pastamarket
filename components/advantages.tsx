import { Banknote, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { money } from "@/lib/format";

/** Ana sayfadaki avantaj şeridi; tutarlar site ayarlarından gelir. */
export function Advantages({
  freeShippingLimit,
  hasWhatsApp,
}: {
  freeShippingLimit: number;
  hasWhatsApp: boolean;
}) {
  const items = [
    {
      icon: <Truck size={22} />,
      title: "Aynı Gün Teslimat",
      text: "Belirlenen İstanbul ilçelerine hızlı kurye",
    },
    {
      icon: <Banknote size={22} />,
      title: "Kapıda Ödeme",
      text: "Nakit veya fiziksel POS ile ödeme",
    },
    {
      icon: <PackageIcon />,
      title: "Türkiye Geneli Kargo",
      text: `${money(freeShippingLimit)} ve üzeri ücretsiz`,
    },
    ...(hasWhatsApp
      ? [
          {
            icon: <WhatsAppIcon className="h-5 w-5" />,
            title: "WhatsApp Destek",
            text: "Sorularınız için bize ulaşın",
          },
        ]
      : []),
  ];

  return (
    <ul className="grid gap-3 rounded-2xl bg-brand-soft p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.title} className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-brand">
            {item.icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-ink">{item.title}</h3>
            <p className="mt-0.5 text-xs leading-4 text-muted">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PackageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[22px] w-[22px]"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
