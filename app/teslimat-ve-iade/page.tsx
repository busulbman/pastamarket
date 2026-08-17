import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { districtList, money } from "@/lib/format";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Teslimat ve İade | PastaMarket" };

export default function DeliveryPage() {
  const s = getSettings();
  const districts = districtList(s.courier_districts);

  const rules = [
    {
      title: "Aynı gün kurye",
      text: `Saat ${s.same_day_cutoff}’a kadar verilen siparişler, aşağıdaki İstanbul ilçelerinde aynı gün teslim edilir. Sipariş tutarı ${money(Number(s.free_courier_limit) || 0)} altındaysa ${money(Number(s.courier_fee) || 0)} kurye ücreti uygulanır; bu tutar ve üzerindeki siparişlerde kurye ücretsizdir.`,
    },
    {
      title: "Türkiye geneli kargo",
      text: `${money(Number(s.free_shipping_limit) || 0)} ve üzeri siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde ${money(Number(s.shipping_fee) || 0)} kargo ücreti alınır.`,
    },
    {
      title: "Ödeme",
      text: "Kapıda nakit, kapıda fiziksel POS ile kart ve Havale/EFT seçenekleri sunulur. Sitede online kredi kartı ile ödeme alınmaz.",
    },
  ];

  return (
    <InfoPage
      title="Teslimat ve İade"
      content={s.page_delivery}
      settingLabel="Teslimat ve iade metni"
    >
      <div className="mt-6 space-y-4">
        {rules.map((rule) => (
          <section key={rule.title} className="card p-5">
            <h2 className="text-sm font-bold text-ink">{rule.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{rule.text}</p>
          </section>
        ))}

        {districts.length > 0 && (
          <section className="card p-5">
            <h2 className="text-sm font-bold text-ink">
              Aynı gün kurye yapılan ilçeler ({districts.length})
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {districts.map((district) => (
                <li
                  key={district}
                  className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand"
                >
                  {district}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </InfoPage>
  );
}
