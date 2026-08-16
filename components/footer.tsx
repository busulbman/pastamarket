import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";

const SHOP_LINKS = [
  { href: "/urunler", label: "Tüm Ürünler" },
  { href: "/urunler?tag=best", label: "Çok Satanlar" },
  { href: "/urunler?tag=new", label: "Yeni Ürünler" },
  { href: "/markalar", label: "Markalar" },
];

const INFO_LINKS = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/teslimat-ve-iade", label: "Teslimat ve İade" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
];

export function Footer({
  brand,
  tagline,
  phone,
  address,
  hours,
  instagram,
  whatsappHref,
  categories,
}: {
  brand: string;
  tagline: string;
  phone: string;
  address: string;
  hours: string;
  instagram: string;
  whatsappHref: string | null;
  categories: { name: string; slug: string }[];
}) {
  return (
    <footer className="mt-16 bg-ink text-white/75">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-extrabold text-white">{brand}</p>
          <p className="mt-2 text-sm leading-6">{tagline}</p>

          <div className="mt-5 flex items-center gap-3">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram sayfamız"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brand"
              >
                <InstagramIcon className="h-[17px] w-[17px]" />
              </a>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp ile yazın"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brand"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Alışveriş bağlantıları">
          <h2 className="text-sm font-bold text-white">Alışveriş</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            {categories.slice(0, 3).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="transition hover:text-white"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Kurumsal bağlantılar">
          <h2 className="text-sm font-bold text-white">Kurumsal</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold text-white">İletişim</h2>
          <div className="mt-4 space-y-3 text-sm">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-brand-2" />
                WhatsApp ile yazın
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 transition hover:text-white"
              >
                <Phone size={15} className="shrink-0 text-brand-2" />
                {phone}
              </a>
            )}
            {address && (
              <p className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-brand-2" />
                {address}
              </p>
            )}
            {hours && (
              <p className="flex items-start gap-2">
                <Mail size={15} className="mt-0.5 shrink-0 text-brand-2" />
                {hours}
              </p>
            )}
            {!whatsappHref && !phone && !address && (
              <Link href="/iletisim" className="transition hover:text-white">
                İletişim sayfası
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand}. Tüm hakları saklıdır.
          </p>
          <p className="text-center">
            Ödeme yöntemleri: Kapıda Nakit • Kapıda POS • Havale/EFT
          </p>
        </div>
      </div>
    </footer>
  );
}
