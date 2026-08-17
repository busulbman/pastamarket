import crypto from "node:crypto";
import { z } from "zod";
import { productById, providerWritable, settings } from "@/lib/data";

/**
 * Sipariş doğrulama ve hesaplama.
 *
 * ÖNEMLİ: Bu dosya better-sqlite3'ü veya @/lib/db'yi top-level import ETMEZ.
 * Yazma yalnızca createOrder() içinde, sağlayıcı yazılabilir olduğunda
 * dinamik import ile yapılır. DATA_PROVIDER=json iken sipariş yazılmaz.
 */

export const checkoutSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10).max(20),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().min(2),
  district: z.string().min(2),
  address: z.string().min(10),
  addressNote: z.string().max(500).optional(),
  customerNote: z.string().max(1000).optional(),
  deliveryMethod: z.enum(["courier", "shipping"]),
  paymentMethod: z.enum(["cash", "card_at_door", "bank_transfer"]),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive().nullable(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  idempotencyKey: z.string().min(12).max(100),
});

export type Checkout = z.infer<typeof checkoutSchema>;

/** Fiyatlar her zaman sunucuda yeniden hesaplanır; istemciden gelen tutara güvenilmez. */
export async function calculateOrder(input: Checkout) {
  const s = await settings();
  const courierDistricts = new Set(
    (s.courier_districts || "")
      .split(",")
      .map((x) => x.trim().toLocaleLowerCase("tr-TR")),
  );

  if (
    input.deliveryMethod === "courier" &&
    (input.city.toLocaleLowerCase("tr-TR") !== "istanbul" ||
      !courierDistricts.has(input.district.toLocaleLowerCase("tr-TR")))
  ) {
    throw new Error("Kurye teslimatı bu ilçe için kullanılamıyor.");
  }

  const lines = [];
  for (const item of input.items) {
    const product = await productById(item.productId);
    if (!product) throw new Error("Sepetinizdeki bir ürün artık aktif değil.");

    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : null;
    if (product.variants.length && !variant) {
      throw new Error(`${product.name} için seçenek seçmelisiniz.`);
    }
    if (item.variantId && !variant) {
      throw new Error("Seçtiğiniz ürün seçeneği geçersiz.");
    }

    const price = variant?.price ?? product.salePrice ?? product.price;
    lines.push({
      product,
      variant,
      quantity: item.quantity,
      unitPrice: price,
      lineTotal: price * item.quantity,
    });
  }

  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const deliveryFee =
    input.deliveryMethod === "courier"
      ? subtotal >= Number(s.free_courier_limit)
        ? 0
        : Number(s.courier_fee)
      : subtotal >= Number(s.free_shipping_limit)
        ? 0
        : Number(s.shipping_fee);

  return { lines, subtotal, deliveryFee, total: subtotal + deliveryFee };
}

export async function createOrder(input: Checkout) {
  if (!providerWritable) {
    throw new Error(
      "Demo sürümünde sipariş kaydı yapılamaz. Siparişinizi WhatsApp üzerinden iletebilirsiniz.",
    );
  }

  // SQLite yalnızca burada, yazılabilir ortamda yüklenir.
  const { db } = await import("@/lib/db");

  const existing = db
    .prepare("SELECT order_number FROM orders WHERE idempotency_key=?")
    .get(input.idempotencyKey) as { order_number: string } | undefined;
  if (existing) return { number: existing.order_number, duplicate: true };

  const calc = await calculateOrder(input);
  const number = `PM-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto
    .randomUUID()
    .slice(0, 6)
    .toUpperCase()}`;

  db.transaction(() => {
    const order = db
      .prepare(
        "INSERT INTO orders (order_number,idempotency_key,first_name,last_name,phone,email,city,district,address,address_note,customer_note,delivery_method,payment_method,subtotal,delivery_fee,total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .run(
        number,
        input.idempotencyKey,
        input.firstName,
        input.lastName,
        input.phone,
        input.email || null,
        input.city,
        input.district,
        input.address,
        input.addressNote || null,
        input.customerNote || null,
        input.deliveryMethod,
        input.paymentMethod,
        calc.subtotal,
        calc.deliveryFee,
        calc.total,
      );

    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id,product_id,product_name,image,variant_id,variant_label,unit_price,quantity,line_total) VALUES (?,?,?,?,?,?,?,?,?)",
    );
    calc.lines.forEach((line) =>
      insertItem.run(
        order.lastInsertRowid,
        line.product.id,
        line.product.name,
        line.product.mainImage,
        line.variant?.id || null,
        line.variant ? `${line.variant.name}: ${line.variant.optionLabel}` : null,
        line.unitPrice,
        line.quantity,
        line.lineTotal,
      ),
    );
  })();

  return { number, duplicate: false };
}
