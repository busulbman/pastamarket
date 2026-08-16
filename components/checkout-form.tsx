"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Truck } from "lucide-react";
import { useCart } from "@/components/cart";
import { districtList, money } from "@/lib/format";
import { OrderSummary } from "@/components/order-summary";
import { DEMO_WRITE_MESSAGE } from "@/lib/demo-guard";

type Delivery = "courier" | "shipping";
type Payment = "cash" | "card_at_door" | "bank_transfer";

const IDEMPOTENCY_STORAGE_KEY = "pm-checkout-key";

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-line px-3 text-sm font-normal outline-none focus:border-brand";

function Field({
  name,
  label,
  type = "text",
  required = true,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      <input name={name} type={type} required={required} className={inputClass} />
    </label>
  );
}

function OptionCard({
  checked,
  disabled,
  onSelect,
  title,
  description,
  name,
}: {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  name: string;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
        checked ? "border-brand bg-brand-soft" : "border-line"
      } ${disabled ? "cursor-not-allowed opacity-55" : ""}`}
    >
      <input
        type="radio"
        name={name}
        className="mt-1 accent-[var(--color-brand)]"
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
      />
      <span>
        <b className="block text-sm text-ink">{title}</b>
        <span className="mt-0.5 block text-xs leading-4 text-muted">{description}</span>
      </span>
    </label>
  );
}

export function CheckoutForm({
  settings: s,
  readOnly = false,
}: {
  settings: Record<string, string>;
  /** Canlı demoda sipariş veritabanına yazılmaz. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const [delivery, setDelivery] = useState<Delivery>("shipping");
  const [payment, setPayment] = useState<Payment>("cash");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

  // Havale seçeneği yalnızca IBAN bilgisi tanımlıysa gösterilir.
  const bankTransferAvailable = Boolean(s.iban?.trim());

  useEffect(() => {
    if (!courierAllowed && delivery === "courier") setDelivery("shipping");
  }, [courierAllowed, delivery]);

  useEffect(() => {
    if (!bankTransferAvailable && payment === "bank_transfer") setPayment("cash");
  }, [bankTransferAvailable, payment]);

  const freeCourierLimit = Number(s.free_courier_limit) || 0;
  const courierFee = Number(s.courier_fee) || 0;
  const freeShippingLimit = Number(s.free_shipping_limit) || 0;
  const shippingFee = Number(s.shipping_fee) || 0;

  const deliveryFee =
    delivery === "courier"
      ? subtotal >= freeCourierLimit
        ? 0
        : courierFee
      : subtotal >= freeShippingLimit
        ? 0
        : shippingFee;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || loading) return;

    if (readOnly) {
      setError(DEMO_WRITE_MESSAGE);
      return;
    }

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    let idempotencyKey = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, idempotencyKey);
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          phone: form.get("phone"),
          email: form.get("email"),
          city,
          district: district.trim(),
          address: form.get("address"),
          addressNote: form.get("addressNote"),
          customerNote: form.get("customerNote"),
          deliveryMethod: delivery,
          paymentMethod: payment,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          idempotencyKey,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Sipariş oluşturulamadı.");
        setLoading(false);
        return;
      }

      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
      clear();
      router.push(`/order/${data.number}`);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <p className="rounded-2xl bg-brand-soft p-8 text-center text-sm text-muted">
        Sepetiniz boş. Sipariş oluşturmak için önce ürün ekleyin.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="text-lg font-extrabold text-ink">Teslimat Bilgileri</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field name="firstName" label="Ad" />
            <Field name="lastName" label="Soyad" />
            <Field name="phone" label="Telefon" type="tel" />
            <Field name="email" label="E-posta (isteğe bağlı)" type="email" required={false} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              İl
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              İlçe
              <input
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                required
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
              name="address"
              required
              minLength={10}
              className="mt-1.5 min-h-24 w-full rounded-xl border border-line p-3 text-sm font-normal outline-none focus:border-brand"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-ink">
            Adres tarifi <span className="font-normal text-muted">(isteğe bağlı)</span>
            <input name="addressNote" className={inputClass} />
          </label>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-extrabold text-ink">Teslimat Yöntemi</h2>
          <div className="mt-4 space-y-3">
            <OptionCard
              name="delivery"
              checked={delivery === "courier"}
              disabled={!courierAllowed}
              onSelect={() => setDelivery("courier")}
              title="Aynı gün kurye"
              description={
                courierAllowed
                  ? `${money(courierFee)} · ${money(freeCourierLimit)} ve üzeri ücretsiz`
                  : "Yalnızca listedeki İstanbul ilçelerinde kullanılabilir."
              }
            />
            <OptionCard
              name="delivery"
              checked={delivery === "shipping"}
              onSelect={() => setDelivery("shipping")}
              title="Türkiye geneli kargo"
              description={`${money(freeShippingLimit)} ve üzeri ücretsiz, altındaki siparişlerde ${money(shippingFee)}.`}
            />
          </div>

          {delivery === "courier" && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-xs leading-5 text-muted">
              <Truck size={15} className="mt-0.5 shrink-0 text-brand" />
              Aynı gün teslimat için son sipariş saati {s.same_day_cutoff}. Bu saatten sonraki
              siparişler bir sonraki teslimat gününe kalabilir.
            </p>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-extrabold text-ink">Ödeme Yöntemi</h2>
          <div className="mt-4 space-y-3">
            <OptionCard
              name="payment"
              checked={payment === "cash"}
              onSelect={() => setPayment("cash")}
              title="Kapıda nakit ödeme"
              description="Teslimat sırasında nakit olarak ödersiniz."
            />
            <OptionCard
              name="payment"
              checked={payment === "card_at_door"}
              onSelect={() => setPayment("card_at_door")}
              title="Kapıda kartla ödeme (fiziksel POS)"
              description="Teslimatta kurye/kargo POS cihazı ile kartınızdan ödeme alınır."
            />
            {bankTransferAvailable && (
              <OptionCard
                name="payment"
                checked={payment === "bank_transfer"}
                onSelect={() => setPayment("bank_transfer")}
                title="Havale / EFT"
                description="Sipariş sonrası IBAN’a ödeme yaparsınız."
              />
            )}
          </div>

          {payment === "bank_transfer" && bankTransferAvailable && (
            <div className="mt-4 rounded-xl bg-brand-soft p-4 text-sm">
              {s.iban_receiver && (
                <p>
                  <b>Alıcı:</b> {s.iban_receiver}
                </p>
              )}
              {s.iban_bank && (
                <p>
                  <b>Banka:</b> {s.iban_bank}
                </p>
              )}
              <p className="mt-1 flex flex-wrap items-center gap-2">
                <b>IBAN:</b> {s.iban}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(s.iban);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand underline"
                >
                  <Copy size={13} />
                  {copied ? "Kopyalandı" : "Kopyala"}
                </button>
              </p>
              <p className="mt-2 text-xs text-muted">
                Ödeme açıklamasına sipariş numaranızı yazın; numara sipariş oluşturulduktan
                sonra gösterilir.
              </p>
            </div>
          )}
        </section>

        <label className="block text-sm font-semibold text-ink">
          Sipariş notu <span className="font-normal text-muted">(isteğe bağlı)</span>
          <textarea
            name="customerNote"
            maxLength={1000}
            className="mt-1.5 min-h-20 w-full rounded-xl border border-line p-3 text-sm font-normal outline-none focus:border-brand"
          />
        </label>
      </div>

      <OrderSummary
        items={items}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        error={error || (readOnly ? DEMO_WRITE_MESSAGE : "")}
        loading={loading}
        disabled={readOnly}
      />
    </form>
  );
}
