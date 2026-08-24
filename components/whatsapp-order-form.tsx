"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Truck } from "lucide-react";
import { cartKey, useCart } from "@/components/cart";
import { districtList, money, whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Statik demo siparişi.
 *
 * Sunucu, API veya veritabanı YOKTUR. Müşteri bilgileri yalnızca tarayıcıda
 * tutulur ve hazır bir WhatsApp mesajına dönüştürülür; sipariş hiçbir yere
 * kaydedilmez.
 */

type Delivery = "courier" | "shipping";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Kapıda nakit",
  card_at_door: "Kapıda kartla (fiziksel POS)",
  bank_transfer: "Havale / EFT",
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-brand";

export function WhatsAppOrderForm({ settings: s, createOrders = false }: { settings: Record<string, string>; createOrders?: boolean }) {
  const { items, subtotal, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("shipping");
  const [payment, setPayment] = useState("cash");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [ordering, setOrdering] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  /**
   * IBAN panoya BOŞLUKSUZ kopyalanır; işlem tamamen istemci tarafındadır.
   * navigator.clipboard güvenli olmayan bağlamda veya sayfa odakta değilken
   * hata verebildiği için geçici textarea ile yedek yöntem kullanılır.
   */
  async function copyIban() {
    const plain = (s.iban ?? "").replace(/\s+/g, "");
    if (!plain) return;

    let ok = false;
    try {
      await navigator.clipboard.writeText(plain);
      ok = true;
    } catch {
      ok = false;
    }

    if (!ok) {
      try {
        const field = document.createElement("textarea");
        field.value = plain;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        ok = document.execCommand("copy");
        document.body.removeChild(field);
      } catch {
        ok = false;
      }
    }

    setCopyState(ok ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  }

  const courierDistricts = useMemo(
    () => districtList(s.courier_districts),
    [s.courier_districts],
  );
  const courierAllowed =
    city.toLocaleLowerCase("tr-TR") === "istanbul" &&
    courierDistricts.some(
      (item) =>
        item.toLocaleLowerCase("tr-TR") === district.trim().toLocaleLowerCase("tr-TR"),
    );

  const freeCourierLimit = Number(s.free_courier_limit) || 0;
  const courierFee = Number(s.courier_fee) || 0;
  const freeShippingLimit = Number(s.free_shipping_limit) || 0;
  const shippingFee = Number(s.shipping_fee) || 0;

  const effectiveDelivery: Delivery = courierAllowed ? delivery : "shipping";
  const deliveryFee =
    effectiveDelivery === "courier"
      ? subtotal >= freeCourierLimit
        ? 0
        : courierFee
      : subtotal >= freeShippingLimit
        ? 0
        : shippingFee;

  const message = useMemo(() => {
    const lines = [
      "Merhaba, PastaMarket'ten sipariş vermek istiyorum.",
      "",
      "Ürünler:",
      ...items.map(
        (item) =>
          `• ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""} × ${item.quantity} = ${money(item.unitPrice * item.quantity)}`,
      ),
      "",
      `Ara toplam: ${money(subtotal)}`,
      `Teslimat: ${effectiveDelivery === "courier" ? "Aynı gün kurye" : "Türkiye geneli kargo"} — ${deliveryFee > 0 ? money(deliveryFee) : "Ücretsiz"}`,
      `Genel toplam: ${money(subtotal + deliveryFee)}`,
      `Ödeme tercihi: ${PAYMENT_LABELS[payment] ?? payment}`,
      "",
      name ? `Ad Soyad: ${name}` : "",
      phone ? `Telefon: ${phone}` : "",
      address ? `Adres: ${address}, ${district}/${city}` : "",
      note ? `Not: ${note}` : "",
    ];
    return lines.filter(Boolean).join("\n");
  }, [items, subtotal, effectiveDelivery, deliveryFee, payment, name, phone, address, district, city, note]);

  const href = whatsappLink(s.whatsapp, message);
  const ready = items.length > 0 && name.trim() && phone.trim() && address.trim();

  async function submitOrder() {
    if (!ready || ordering) return;
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return setOrderMessage("Lütfen ad ve soyadınızı yazın.");
    setOrdering(true); setOrderMessage("");
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: parts[0], lastName: parts.slice(1).join(" "), phone, city, district, address, customerNote: note, deliveryMethod: effectiveDelivery, paymentMethod: payment, idempotencyKey: crypto.randomUUID(), items: items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })) }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setOrderMessage(data.error || "Sipariş oluşturulamadı.");
      clear(); setOrderMessage(`Siparişiniz alındı. Sipariş numaranız: ${data.number}`);
    } catch { setOrderMessage("Bağlantı hatası. Lütfen tekrar deneyin."); } finally { setOrdering(false); }
  }

  if (!items.length) {
    return (
      <p className="rounded-2xl bg-brand-soft p-8 text-center text-sm text-muted">
        Sepetiniz boş. Sipariş oluşturmak için önce ürün ekleyin.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="text-lg font-extrabold text-ink">İletişim ve Teslimat</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              Ad Soyad
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Telefon
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              İl
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              İlçe
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Örn. Fatih"
                className={inputClass}
              />
            </label>
          </div>

          {courierDistricts.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted">
                Aynı gün kurye yapılan ilçeler (seçmek için tıklayın):
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {courierDistricts.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setCity("İstanbul");
                      setDistrict(item);
                      setDelivery("courier");
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      district.trim().toLocaleLowerCase("tr-TR") ===
                      item.toLocaleLowerCase("tr-TR")
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-line text-muted hover:border-brand hover:text-brand"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="mt-4 block text-sm font-semibold text-ink">
            Açık adres
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1.5 min-h-24 w-full rounded-xl border border-line p-3 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-ink">
            Sipariş notu <span className="font-normal text-muted">(isteğe bağlı)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5 min-h-20 w-full rounded-xl border border-line p-3 text-sm outline-none focus:border-brand"
            />
          </label>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-extrabold text-ink">Teslimat Yöntemi</h2>
          <div className="mt-4 space-y-3">
            <label
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                effectiveDelivery === "courier" ? "border-brand bg-brand-soft" : "border-line"
              } ${!courierAllowed ? "cursor-not-allowed opacity-55" : ""}`}
            >
              <input
                type="radio"
                name="delivery"
                className="mt-1 accent-[var(--color-brand)]"
                checked={effectiveDelivery === "courier"}
                disabled={!courierAllowed}
                onChange={() => setDelivery("courier")}
              />
              <span>
                <b className="block text-sm text-ink">Aynı gün kurye</b>
                <span className="mt-0.5 block text-xs leading-4 text-muted">
                  {courierAllowed
                    ? `${money(courierFee)} · ${money(freeCourierLimit)} ve üzeri ücretsiz`
                    : "Yalnızca listedeki İstanbul ilçelerinde kullanılabilir."}
                </span>
              </span>
            </label>

            <label
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                effectiveDelivery === "shipping" ? "border-brand bg-brand-soft" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="delivery"
                className="mt-1 accent-[var(--color-brand)]"
                checked={effectiveDelivery === "shipping"}
                onChange={() => setDelivery("shipping")}
              />
              <span>
                <b className="block text-sm text-ink">Türkiye geneli kargo</b>
                <span className="mt-0.5 block text-xs leading-4 text-muted">
                  {money(freeShippingLimit)} ve üzeri ücretsiz, altında {money(shippingFee)}.
                </span>
              </span>
            </label>
          </div>

          {effectiveDelivery === "courier" && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-xs leading-5 text-muted">
              <Truck size={15} className="mt-0.5 shrink-0 text-brand" />
              Aynı gün teslimat için son sipariş saati {s.same_day_cutoff}.
            </p>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-extrabold text-ink">Ödeme Tercihi</h2>
          <div className="mt-4 space-y-2.5 text-sm">
            {Object.entries(PAYMENT_LABELS)
              .filter(([key]) => key !== "bank_transfer" || Boolean(s.iban?.trim()))
              .map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    className="accent-[var(--color-brand)]"
                    checked={payment === key}
                    onChange={() => setPayment(key)}
                  />
                  {label}
                </label>
              ))}
          </div>

          {/* Havale/EFT seçildiğinde alıcı ve IBAN gösterilir. Bilgiler
              data/demo-catalog.json içindeki settings alanından gelir. */}
          {payment === "bank_transfer" && s.iban?.trim() && (
            <div className="mt-4 rounded-xl bg-brand-soft p-4">
              {s.iban_receiver?.trim() && (
                <p className="text-sm text-ink">
                  <span className="text-muted">Alıcı:</span>{" "}
                  <b>{s.iban_receiver}</b>
                </p>
              )}
              {s.iban_bank?.trim() && (
                <p className="mt-1 text-sm text-ink">
                  <span className="text-muted">Banka:</span> <b>{s.iban_bank}</b>
                </p>
              )}

              <p className="mt-3 text-xs font-semibold text-muted">IBAN</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-[13px] font-semibold leading-6 tracking-wide text-ink">
                  {s.iban}
                </code>
                <button
                  type="button"
                  onClick={copyIban}
                  aria-label="IBAN numarasını kopyala"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand px-3 py-2 text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
                >
                  {copyState === "copied" ? <Check size={14} /> : <Copy size={14} />}
                  {copyState === "copied"
                    ? "Kopyalandı"
                    : copyState === "failed"
                      ? "Kopyalanamadı"
                      : "Kopyala"}
                </button>
              </div>

              <p aria-live="polite" className="sr-only">
                {copyState === "copied"
                  ? "IBAN panoya kopyalandı"
                  : copyState === "failed"
                    ? "IBAN kopyalanamadı, elle seçebilirsiniz"
                    : ""}
              </p>

              <p className="mt-2 text-xs leading-5 text-muted">
                {copyState === "failed"
                  ? "Kopyalanamadı — IBAN'ı elle seçip kopyalayabilirsiniz."
                  : "Ödeme açıklamasına ad soyadınızı yazmanız yeterlidir."}
              </p>
            </div>
          )}

          <p className="mt-3 text-xs text-muted">Online kredi kartı ödemesi alınmaz.</p>
        </section>
      </div>

      <aside className="card h-fit p-5 lg:sticky lg:top-28">
        <h2 className="font-bold text-ink">Sipariş Özeti</h2>

        <ul className="mt-4 space-y-2.5 text-sm">
          {items.map((item) => (
            <li key={cartKey(item)} className="flex justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate text-ink">{item.name}</span>
                <span className="text-xs text-muted">
                  {item.variantLabel ? `${item.variantLabel} · ` : ""}
                  {item.quantity} adet
                </span>
              </span>
              <b className="shrink-0">{money(item.unitPrice * item.quantity)}</b>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-3 border-t border-line-soft pt-4 text-sm">
          <p className="flex justify-between">
            <span className="text-muted">Ara toplam</span>
            <b>{money(subtotal)}</b>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Teslimat</span>
            <b>{deliveryFee > 0 ? money(deliveryFee) : "Ücretsiz"}</b>
          </p>
          <p className="flex justify-between border-t border-line-soft pt-3 text-base">
            <b>Genel toplam</b>
            <b className="text-brand">{money(subtotal + deliveryFee)}</b>
          </p>
        </div>

        {createOrders ? (
          <button type="button" disabled={!ready || ordering} onClick={submitOrder} className="mt-5 flex w-full items-center justify-center rounded-full bg-brand py-3.5 text-sm font-bold text-white disabled:opacity-50">
            {ordering ? "Sipariş gönderiliyor…" : "Siparişi Tamamla"}
          </button>
        ) : href ? (
          <a
            href={ready ? href : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!ready}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-bold text-white transition ${
              ready ? "hover:brightness-95" : "pointer-events-none opacity-50"
            }`}
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp ile Sipariş Ver
          </a>
        ) : (
          <p className="mt-5 rounded-xl bg-brand-soft p-3 text-xs leading-5 text-muted">
            WhatsApp numarası tanımlanmadığı için sipariş gönderimi kullanılamıyor.
          </p>
        )}

        {!ready && (href || createOrders) && (
          <p className="mt-3 text-center text-[11px] leading-4 text-muted">
            Ad, telefon ve adres alanlarını doldurun.
          </p>
        )}

        {orderMessage && <p role="status" className="mt-3 rounded-xl bg-brand-soft p-3 text-center text-xs text-ink">{orderMessage}</p>}
        <p className="mt-3 text-center text-[11px] leading-4 text-muted">{createOrders ? "Siparişiniz güvenle kaydedilir ve panelden takip edilir." : "Siparişiniz WhatsApp üzerinden iletilir; bu sayfada kayıt tutulmaz."}</p>
      </aside>
    </div>
  );
}
