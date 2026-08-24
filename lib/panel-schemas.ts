import { z } from "zod";
import type { OrderStatus } from "@/lib/data";

const text = (max: number) => z.string().trim().max(max).optional().default("");
const price = z.coerce.number().finite().min(0).max(1_000_000);
export const productSchema = z.object({ name: z.string().trim().min(2).max(200), slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9-]+$/), description: text(4000), brand: text(120), categoryId: z.coerce.number().int().positive(), mainImage: text(600), images: z.array(z.string().trim().max(600)).max(12).default([]), price, salePrice: z.union([z.coerce.number().finite().min(0).max(1_000_000), z.literal(""), z.null()]).optional().transform((value) => value === "" || value === undefined || value === null ? null : value), unit: text(60), weight: text(60), productType: text(80), active: z.boolean().default(true), isBestSeller: z.boolean().default(false), isNew: z.boolean().default(false), variants: z.array(z.object({ name: z.string().trim().min(1).max(60), optionLabel: z.string().trim().min(1).max(60), price })).max(30).default([]) });
export const productUpdateSchema = productSchema.extend({ id: z.coerce.number().int().positive() });
export const categorySchema = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/), image: text(600), sortOrder: z.coerce.number().int().min(0).max(999).default(0), active: z.boolean().default(true) });
export const categoryUpdateSchema = categorySchema.extend({ id: z.coerce.number().int().positive() });
export const idSchema = z.object({ id: z.coerce.number().int().positive() });
export const orderStatusSchema = z.object({ id: z.coerce.number().int().positive(), status: z.enum(["Yeni Sipariş", "Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal Edildi"]) });
export const SETTING_KEYS = ["brand_name", "tagline", "announcement", "whatsapp", "phone", "instagram", "address", "hours", "iban", "iban_receiver", "iban_bank", "courier_districts", "free_courier_limit", "courier_fee", "free_shipping_limit", "shipping_fee", "same_day_cutoff", "hero_title", "hero_text", "hero_image", "hero_link", "banner_title", "banner_text", "banner_image", "banner_link", "page_about", "page_delivery", "page_distance_sales", "page_privacy"] as const;
export const firstIssue = (error: z.ZodError) => error.issues[0]?.message || "Gönderilen bilgiler geçersiz.";
export function pickSettings(input: unknown) { const values: Record<string, string> = {}; const source = (input ?? {}) as Record<string, unknown>; for (const key of SETTING_KEYS) if (key in source) values[key] = String(source[key] ?? "").slice(0, 8000); return values; }
export const toOrderStatus = (value: string) => value as OrderStatus;
