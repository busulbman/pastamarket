import {
  CakeSlice,
  Milk,
  Package,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";

/**
 * Kategori ikonları — mobil yan menüde kullanılır.
 *
 * Mevcut ikon sistemi (lucide-react) önceliklidir; pastacılığa özgü karşılığı
 * bulunmayanlar için sade, çizgi stilinde inline SVG tanımlanmıştır.
 * Hepsi `stroke="currentColor"` kullanır; renk dışarıdan (text-brand) gelir.
 */

type IconProps = { className?: string };

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Çikolata kalıbı */
function ChocolateIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 12h16M12 4v16" />
    </svg>
  );
}

/** Krema sıkma torbası */
function PipingBagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      <path d="M6 3h12l-4.5 12a2 2 0 0 1-3 0z" />
      <path d="M10.5 15v3.5a1.5 1.5 0 0 0 3 0V15" />
      <path d="M9 7h6" />
    </svg>
  );
}

/** Süsleme kavanozu */
function SprinkleJarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      <path d="M8 3h8v2H8z" />
      <path d="M7 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
      <path d="M10.5 11h.01M13.5 12.5h.01M11 15h.01M13.5 17h.01" />
    </svg>
  );
}

/** Gıda boyası şişesi */
function BottleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      <path d="M10 2h4v3h-4z" />
      <path d="M9 8a3 3 0 0 1 1.2-2.4L10.5 5h3l.3.6A3 3 0 0 1 15 8v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
      <path d="M9 13h6" />
    </svg>
  );
}

/** Kek kalıbı */
function MoldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      <path d="M3 8h18l-1.6 10.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8z" />
      <ellipse cx="12" cy="8" rx="9" ry="2.5" />
      <path d="M12 10.5v9" />
    </svg>
  );
}

/** Toz krema / çırpma teli */
function WhiskIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      <path d="M12 3v6" />
      <path d="M8 15c0-3.3 1.8-6 4-6s4 2.7 4 6a4 4 0 0 1-8 0z" />
      <path d="M12 9v10M9.2 10.8 14.8 19M14.8 10.8 9.2 19" />
    </svg>
  );
}

type IconComponent = (props: IconProps) => React.ReactElement;

/** Lucide ikonlarını aynı imzaya uydurur. */
const fromLucide =
  (Icon: LucideIcon): IconComponent =>
  ({ className }) => <Icon className={className} strokeWidth={1.7} />;

/** Kategori slug'ına göre ikon. Bilinmeyen kategoriler için etiket ikonu. */
const BY_SLUG: Record<string, IconComponent> = {
  cikolata: ChocolateIcon,
  "krema-ve-dolgu": PipingBagIcon,
  "seker-hamuru": fromLucide(CakeSlice),
  "kalip-ve-ekipman": MoldIcon,
  "susleme-urunleri": SprinkleJarIcon,
  "ambalaj-urunleri": fromLucide(Package),
  "gida-boyalari": BottleIcon,
  "sivi-santi": fromLucide(Milk),
  "toz-santi-ve-toz-krema": WhiskIcon,
};

const FALLBACK = fromLucide(Tag);

export function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = BY_SLUG[slug] ?? FALLBACK;
  return <Icon className={className} />;
}

export { Sparkles };
