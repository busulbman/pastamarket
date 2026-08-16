export const money = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);

/** Görsel alanı boş bırakılan ürünler için sade, nötr bir yer tutucu. */
export const imagePlaceholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="%23fff3f6"/></svg>`,
  );

export const productImage = (src?: string | null) =>
  src && src.trim() ? src : imagePlaceholder;

/** WhatsApp numarasını yalnızca rakamlardan oluşan biçime indirger. */
export const whatsappNumber = (raw?: string | null) =>
  (raw || "").replace(/\D/g, "");

export function whatsappLink(raw?: string | null, message?: string) {
  const number = whatsappNumber(raw);
  if (!number) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/** İndirim yüzdesi; indirim yoksa null döner. */
export function discountPercent(price: number, salePrice?: number | null) {
  if (!salePrice || salePrice >= price || price <= 0) return null;
  return Math.round((1 - salePrice / price) * 100);
}

export const districtList = (raw?: string | null) =>
  (raw || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
