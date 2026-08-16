import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { ProductImage } from "@/components/product-image";

type Category = { name: string; slug: string; image: string };

/** Referans tasarımdaki yuvarlak kategori şeridi. */
export function CategoryCircles({ categories }: { categories: Category[] }) {
  return (
    <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-8">
      {categories.map((category) => (
        <li key={category.slug} className="w-20 shrink-0 sm:w-auto">
          <Link href={`/category/${category.slug}`} className="group block text-center">
            <span className="mx-auto block aspect-square w-20 overflow-hidden rounded-full bg-brand-soft ring-1 ring-line transition group-hover:ring-brand sm:w-full sm:max-w-24">
              <ProductImage
                src={category.image}
                alt=""
                width={112}
                height={112}
                sizes="112px"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="mt-2 block text-xs font-semibold leading-4 text-ink transition group-hover:text-brand">
              {category.name}
            </span>
          </Link>
        </li>
      ))}

      <li className="w-20 shrink-0 sm:w-auto">
        <Link href="/urunler" className="group block text-center">
          <span className="mx-auto grid aspect-square w-20 place-items-center rounded-full bg-brand-soft text-brand ring-1 ring-line transition group-hover:ring-brand sm:w-full sm:max-w-24">
            <LayoutGrid size={26} />
          </span>
          <span className="mt-2 block text-xs font-semibold leading-4 text-ink transition group-hover:text-brand">
            Tüm Kategoriler
          </span>
        </Link>
      </li>
    </ul>
  );
}
