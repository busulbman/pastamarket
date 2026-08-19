import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, Truck } from "lucide-react";
import { getCategories, getProductsByTag, getSettings } from "@/lib/catalog";
import { whatsappNumber } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { hasImage } from "@/lib/product-images";
import { StoreShell } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { CategoryCircles } from "@/components/category-circles";
import { Advantages } from "@/components/advantages";

export default function Home() {
  const s = getSettings();
  const nav = getCategories();
  const bestSellers = getProductsByTag("best", 10);
  const newArrivals = getProductsByTag("new", 10);

  return (
    <StoreShell>
      <main>
        {/* Ana banner */}
        <section className="bg-brand-soft">
          <div className="container grid items-center gap-8 py-10 md:grid-cols-2 md:py-14">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
                {s.hero_title}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted sm:text-base">
                {s.hero_text}
              </p>

              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { icon: <Truck size={17} />, label: "Aynı Gün Teslimat" },
                  { icon: <ShieldCheck size={17} />, label: "Güvenli Alışveriş" },
                  { icon: <Clock size={17} />, label: `Son sipariş ${s.same_day_cutoff}` },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <span className="text-brand">{item.icon}</span>
                    {item.label}
                  </li>
                ))}
              </ul>

              <Link
                href={s.hero_link || "/urunler"}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark"
              >
                Alışverişe Başla
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Görsel tanımlanmadıysa tasarımı bozmayan dekoratif panel gösterilir. */}
            <div className="overflow-hidden rounded-2xl bg-white">
              {hasImage(s.hero_image) ? (
                <ProductImage
                  src={s.hero_image}
                  alt="Pastacılık malzemeleri"
                  width={900}
                  height={600}
                  sizes="(min-width: 768px) 560px, 100vw"
                  priority
                  // Görselin içeriği sağ tarafta; kırpma boş pembe alandan yapılır.
                  className="h-56 w-full object-cover object-right sm:h-72 md:h-[380px]"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="h-56 w-full bg-[linear-gradient(135deg,#fff7f9_0%,#ffe3ec_55%,#ffd0de_100%)] sm:h-72 md:h-[380px]"
                />
              )}
            </div>
          </div>
        </section>

        {/* Kategoriler */}
        <section className="container py-10 sm:py-12">
          <CategoryCircles categories={nav} />
        </section>

        {/* Çok satanlar */}
        {bestSellers.length > 0 && (
          <section className="container pb-12">
            <SectionHeading title="Çok Satanlar" href="/urunler?tag=best" />
            <div className="product-grid">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Avantajlar */}
        <section className="container pb-12">
          <Advantages
            freeShippingLimit={Number(s.free_shipping_limit) || 0}
            hasWhatsApp={Boolean(whatsappNumber(s.whatsapp))}
          />
        </section>

        {/* Yeni ürünler */}
        {newArrivals.length > 0 && (
          <section className="container pb-12">
            <SectionHeading title="Yeni Ürünler" href="/urunler?tag=new" />
            <div className="product-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Alt banner */}
        <section className="container pb-14">
          <div className="grid overflow-hidden rounded-2xl bg-brand-soft md:grid-cols-2">
            <div className="p-7 sm:p-10">
              <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
                {s.banner_title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                {s.banner_text}
              </p>
              <Link
                href={s.banner_link || "/urunler"}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
              >
                Hemen Keşfet
                <ArrowRight size={17} />
              </Link>
            </div>
            {hasImage(s.banner_image) ? (
              <ProductImage
                src={s.banner_image}
                alt="Pastacılık ürünleri"
                width={800}
                height={500}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-52 w-full object-cover md:h-full"
              />
            ) : (
              <div
                aria-hidden="true"
                className="h-52 w-full bg-[linear-gradient(135deg,#ffe3ec_0%,#ffd0de_100%)] md:h-full"
              />
            )}
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
