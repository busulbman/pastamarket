import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/constants";

/**
 * Panel API'lerinin gövde doğrulaması.
 * Oturum açmış olmak yeterli sayılmaz; gelen tipler ve aralıklar sunucuda
 * ayrıca doğrulanır (fiyat, kimlik, uzunluk).
 */

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

const price = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .pipe(z.number().finite().min(0).max(1_000_000));

const optionalPrice = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value) =>
    value === null || value === undefined || value === "" ? null : Number(value),
  )
  .pipe(z.number().finite().min(0).max(1_000_000).nullable());

export const variantSchema = z.object({
  name: z.string().trim().min(1).max(60).default("Seçenek"),
  optionLabel: z.string().trim().min(1).max(60),
  price,
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
  description: optionalText(4000),
  brand: optionalText(120),
  categoryId: z.coerce.number().int().positive(),
  mainImage: optionalText(600),
  images: z.array(z.string().trim().max(600)).max(12).optional().default([]),
  price,
  salePrice: optionalPrice,
  unit: optionalText(60),
  weight: optionalText(60),
  productType: optionalText(80),
  active: z.boolean().optional().default(true),
  isBestSeller: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  variants: z.array(variantSchema).max(30).optional().default([]),
});

export const productUpdateSchema = productSchema.extend({
  id: z.coerce.number().int().positive(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
  image: optionalText(600),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
  active: z.boolean().optional().default(true),
});

export const categoryUpdateSchema = categorySchema.extend({
  id: z.coerce.number().int().positive(),
});

export const orderStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(ORDER_STATUSES),
});

export const idSchema = z.object({ id: z.coerce.number().int().positive() });

/** Ayarlarda yalnızca bilinen anahtarlar güncellenebilir. */
export const SETTING_KEYS = [
  "brand_name",
  "tagline",
  "announcement",
  "whatsapp",
  "phone",
  "instagram",
  "address",
  "hours",
  "iban",
  "iban_receiver",
  "iban_bank",
  "courier_districts",
  "free_courier_limit",
  "courier_fee",
  "free_shipping_limit",
  "shipping_fee",
  "same_day_cutoff",
  "hero_title",
  "hero_text",
  "hero_image",
  "hero_link",
  "banner_title",
  "banner_text",
  "banner_image",
  "banner_link",
  "page_about",
  "page_delivery",
  "page_distance_sales",
  "page_privacy",
] as const;

export function pickSettings(input: unknown) {
  const source = (input ?? {}) as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    if (key in source) result[key] = String(source[key] ?? "").slice(0, 8000);
  }
  return result;
}

/** Zod hatasını kullanıcıya gösterilebilir tek satıra indirger. */
export function firstIssue(error: z.ZodError) {
  const issue = error.issues[0];
  return issue?.message || "Gönderilen bilgiler geçersiz.";
}
