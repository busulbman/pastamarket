import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, ShieldCheck, Truck } from "lucide-react";
import { getCategories, getProductsByTag, getSettings } from "@/lib/catalog";
import { money, whatsappNumber } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { hasImage } from "@/lib/product-images";
import { StoreShell } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { CategoryCircles } from "@/components/category-circles";
import { Advantages } from "@/components/advantages";

export const revalidate = 300;

export default async function Home() {
  const [s, nav, bestSellers, newArrivals] = await Promise.all([getSettings(), getCategories(), getProductsByTag("best", 10), getProductsByTag("new", 10)]);

  return (
    <StoreShell>
      <main>
        {/* Ana sayfaya özel kampanya hero'su: metinler HTML, görsel ise yazısız fon olarak tutulur. */}
        <section className="relative isolate overflow-hidden bg-[#f62c69]">
          <Image
            src="/images/banners/pastamarket-hero-composition-v1.png"
            alt="Çikolatalı pasta ve pastacılık ürünleri"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,250,242,0.2)_0%,rgba(255,244,239,0.03)_42%,rgba(245,29,91,0.1)_100%)]" />

          <div className="container relative z-10 flex min-h-[610px] flex-col items-center px-1 pb-9 pt-7 text-center sm:min-h-[680px] sm:pb-11 sm:pt-9 lg:min-h-[720px] lg:pb-14">
            <Image
              src="/images/pastamarket-logo.png"
              alt="PastaMarket"
              width={360}
              height={130}
              priority
              className="h-auto w-[154px] drop-shadow-[0_2px_0_rgba(255,255,255,0.35)] sm:w-[190px] lg:w-[220px]"
            />

            <div className="mt-7 w-full max-w-[690px] text-[#171b3a] sm:mt-10">
              <p className="px-1 text-[12px] font-extrabold uppercase tracking-[0.04em] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] sm:px-0 sm:text-xl lg:text-2xl">
                Pastacılık Malzemelerinde
              </p>
              <h1 className="mt-1 text-[48px] font-black leading-[0.86] tracking-[-0.065em] drop-shadow-[0_2px_0_rgba(255,255,255,0.55)] sm:mt-2 sm:text-[78px] lg:text-[106px]">
                HER ŞEY
              </h1>
              <p className="mt-2 text-[26px] font-black leading-none tracking-[-0.045em] text-[#ef2d66] drop-shadow-[0_2px_0_rgba(255,255,255,0.45)] sm:mt-3 sm:text-[43px] lg:text-[55px]">
                ELİNİZİN ALTINDA!
              </p>
            </div>

            <ul className="mt-6 grid w-full max-w-[590px] grid-cols-1 gap-2 text-[#171b3a] sm:mt-8 sm:grid-cols-3 sm:gap-5">
              {[
                { icon: <Truck aria-hidden="true" />, label: "Aynı Gün Teslimat" },
                { icon: <ShieldCheck aria-hidden="true" />, label: "Güvenli Alışveriş" },
                { icon: <Award aria-hidden="true" />, label: "Kaliteli Ürün" },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-center gap-2 text-center text-[11px] font-extrabold leading-tight sm:text-sm">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-[#ef2d66] shadow-[0_2px_6px_rgba(23,27,58,0.14)] sm:h-9 sm:w-9">{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            <Link href="/urunler" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ed3268] px-7 py-3 text-xs font-black tracking-[0.04em] text-white shadow-[0_8px_20px_rgba(173,18,69,0.35)] transition hover:bg-[#cf2455] sm:mt-8 sm:px-9 sm:py-3.5 sm:text-sm">
              ALIŞVERİŞE BAŞLA
              <ArrowRight size={18} strokeWidth={3} />
            </Link>
          </div>
        </section>

        <section className="bg-[#171b3a] text-white">
          <div className="container grid divide-y divide-[#ff6790]/35 py-1 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-0">
            {[
              { icon: <Truck aria-hidden="true" size={22} />, title: "Aynı Gün Teslimat", detail: s.same_day_cutoff ? `Son sipariş ${s.same_day_cutoff}` : "Belirlenen teslimat saatlerinde" },
              { icon: <ShieldCheck aria-hidden="true" size={22} />, title: "Güvenli Alışveriş", detail: "Güvenli ödeme seçenekleri" },
              { icon: <Award aria-hidden="true" size={22} />, title: "Türkiye Geneli Kargo", detail: Number(s.free_shipping_limit) ? `${money(Number(s.free_shipping_limit))} üzeri ücretsiz` : "Özenle paketlenmiş gönderim" },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-center gap-3 px-3 py-3.5 text-center sm:px-5 sm:py-5">
                <span className="text-[#ff5a85]">{item.icon}</span>
                <span className="flex flex-col text-left"><b className="text-xs font-extrabold tracking-wide sm:text-sm">{item.title}</b><small className="mt-0.5 text-[10px] text-white/70 sm:text-xs">{item.detail}</small></span>
              </div>
            ))}
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
