/** Sunucu ve istemci tarafında ortak kullanılan sabitler (veritabanına bağlı değildir). */

export const ORDER_STATUSES = [
  "Yeni Sipariş",
  "Hazırlanıyor",
  "Kuryeye Verildi",
  "Kargoya Verildi",
  "Teslim Edildi",
  "İptal Edildi",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Kapıda nakit ödeme",
  card_at_door: "Kapıda kartla ödeme (fiziksel POS)",
  bank_transfer: "Havale / EFT",
};

export const DELIVERY_LABELS: Record<string, string> = {
  courier: "Aynı gün kurye",
  shipping: "Türkiye geneli kargo",
};

/**
 * WhatsApp butonlarının varsayılan başlangıç mesajı.
 * Numara site ayarlarından okunur; buraya sabit numara yazılmaz.
 */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Merhaba, PastaMarket ürünleri hakkında bilgi almak istiyorum.";
