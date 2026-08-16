import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { allOrderItems, orders } from "@/lib/db";
import { money, whatsappLink } from "@/lib/format";
import { DELIVERY_LABELS, PAYMENT_LABELS } from "@/lib/constants";
import { EmptyState, PageHeader } from "@/components/panel/ui";
import { OrderFilters } from "@/components/panel/order-filters";
import { OrderStatusSelect } from "@/components/panel/order-status-select";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Siparişler | PastaMarket" };

type Search = { q?: string; durum?: string; baslangic?: string; bitis?: string };

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function PanelOrders({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const list = orders({
    q: params.q,
    status: params.durum,
    from: params.baslangic,
    to: params.bitis,
  });

  // Tüm kalemler tek sorguda alınıp bellekte eşleştirilir (N+1 sorgu yok).
  const items = allOrderItems();

  return (
    <>
      <PageHeader title="Siparişler" description={`${list.length} sipariş listeleniyor`} />

      <Suspense fallback={null}>
        <OrderFilters />
      </Suspense>

      {list.length === 0 ? (
        <EmptyState>
          Filtrelere uyan sipariş bulunamadı.{" "}
          <Link href="/panel/siparisler" className="font-semibold text-brand">
            Filtreleri temizle
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {list.map((order) => {
            const lines = items.filter((item) => item.order_id === order.id);
            const customerHref = whatsappLink(
              order.phone,
              `Merhaba, ${order.order_number} numaralı siparişiniz hakkında bilgi vermek istiyoruz.`,
            );

            return (
              <article key={order.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <b className="text-ink">{order.order_number}</b>
                    <p className="mt-0.5 text-xs text-muted">
                      {dateFormat.format(new Date(order.created_at.replace(" ", "T") + "Z"))}
                    </p>
                    <p className="mt-2 text-sm text-ink">
                      {order.first_name} {order.last_name} · {order.phone}
                      {order.email ? ` · ${order.email}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {order.address}, {order.district}/{order.city}
                      {order.address_note ? ` (${order.address_note})` : ""}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <b className="text-lg text-ink">{money(order.total)}</b>
                    <OrderStatusSelect
                      id={order.id}
                      status={order.status}
                      orderNumber={order.order_number}
                      readOnly={demoReadOnly}
                    />
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
                  {lines.map((line) => (
                    <li key={line.id} className="flex justify-between gap-4 py-2.5 text-sm">
                      <span>
                        {line.product_name}
                        {line.variant_label && (
                          <small className="block text-muted">{line.variant_label}</small>
                        )}
                      </span>
                      <span className="shrink-0 text-muted">
                        {line.quantity} × {money(line.unit_price)} ={" "}
                        <b className="text-ink">{money(line.line_total)}</b>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 grid gap-1 text-xs text-muted sm:grid-cols-2">
                  <p>
                    Teslimat: {DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method}
                    {" · "}
                    {order.delivery_fee > 0 ? money(order.delivery_fee) : "Ücretsiz"}
                  </p>
                  <p>Ödeme: {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p>
                  <p>Ara toplam: {money(order.subtotal)}</p>
                  {customerHref && (
                    <a
                      href={customerHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand"
                    >
                      Müşteriye WhatsApp’tan yaz
                    </a>
                  )}
                </div>

                {order.customer_note && (
                  <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                    <b>Müşteri notu:</b> {order.customer_note}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
