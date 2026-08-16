import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { db, settings } from "@/lib/db";
import { money, whatsappLink } from "@/lib/format";
import { StoreShell } from "@/components/store-shell";
import { WhatsAppIcon } from "@/components/icons";
import { DELIVERY_LABELS, PAYMENT_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Siparişiniz | PastaMarket" };

type OrderRow = {
  id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  delivery_method: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
};

type OrderItemRow = {
  id: number;
  product_name: string;
  variant_label: string | null;
  quantity: number;
  line_total: number;
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const order = db
    .prepare("SELECT * FROM orders WHERE order_number=?")
    .get(number) as OrderRow | undefined;
  if (!order) notFound();

  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id=?")
    .all(order.id) as OrderItemRow[];
  const s = settings();

  const summary = [
    `Sipariş No: ${order.order_number}`,
    `Müşteri: ${order.first_name} ${order.last_name}`,
    `Telefon: ${order.phone}`,
    `Ürünler: ${items
      .map(
        (item) =>
          `${item.product_name}${item.variant_label ? ` (${item.variant_label})` : ""} x${item.quantity}`,
      )
      .join(", ")}`,
    `Teslimat: ${DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method}`,
    `Ödeme: ${PAYMENT_LABELS[order.payment_method] ?? order.payment_method}`,
    `Toplam: ${money(order.total)}`,
  ].join("\n");

  const shareHref = whatsappLink(s.whatsapp, summary);

  return (
    <StoreShell>
      <main className="container max-w-3xl py-10">
        <div className="card p-6 sm:p-9">
          <CheckCircle2 className="text-brand" size={40} />
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand">
            Siparişiniz alındı
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Teşekkür ederiz!
          </h1>
          <p className="mt-3 text-sm text-muted">
            Sipariş numaranız:{" "}
            <b className="text-ink">{order.order_number}</b> · Durum:{" "}
            <b className="text-ink">{order.status}</b>
          </p>

          <ul className="mt-7 divide-y divide-line-soft border-y border-line-soft">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-5 py-4 text-sm">
                <span>
                  {item.product_name}
                  {item.variant_label && (
                    <small className="block text-muted">{item.variant_label}</small>
                  )}
                  <small className="text-muted">× {item.quantity}</small>
                </span>
                <b className="shrink-0">{money(item.line_total)}</b>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-muted">Ara toplam</span>
              <b>{money(order.subtotal)}</b>
            </p>
            <p className="flex justify-between">
              <span className="text-muted">Teslimat</span>
              <b>{order.delivery_fee > 0 ? money(order.delivery_fee) : "Ücretsiz"}</b>
            </p>
            <p className="flex justify-between border-t border-line-soft pt-2 text-base">
              <b>Genel toplam</b>
              <b className="text-brand">{money(order.total)}</b>
            </p>
          </div>

          <div className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <b>Teslimat:</b> {DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method}
            </p>
            <p>
              <b>Ödeme:</b> {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
            </p>
            <p className="sm:col-span-2">
              <b>Adres:</b> {order.address}, {order.district}/{order.city}
            </p>
          </div>

          {order.payment_method === "bank_transfer" && s.iban && (
            <div className="mt-6 rounded-xl bg-brand-soft p-4 text-sm">
              <b className="text-ink">Havale / EFT bilgileri</b>
              {s.iban_receiver && <p className="mt-2">{s.iban_receiver}</p>}
              {s.iban_bank && <p>{s.iban_bank}</p>}
              <p className="font-semibold">{s.iban}</p>
              <p className="mt-2 text-xs text-muted">
                Ödeme açıklamasına {order.order_number} yazınız.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {shareHref && (
              <a
                href={shareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Sipariş özetini WhatsApp ile gönder
              </a>
            )}
            <Link
              href="/urunler"
              className="inline-flex items-center rounded-full border border-line px-5 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
            >
              Alışverişe devam et
            </Link>
          </div>
        </div>
      </main>
    </StoreShell>
  );
}
