"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Link2, Star, Trash2, Upload, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";
import { DemoInlineNotice } from "@/components/demo-notice";
import {
  panelInput,
  panelLabel,
  primaryButton,
  secondaryButton,
} from "@/components/panel/ui";

type VariantDraft = { name: string; optionLabel: string; price: string };

type Draft = {
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  mainImage: string;
  images: string[];
  price: string;
  salePrice: string;
  unit: string;
  weight: string;
  productType: string;
  active: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  variants: VariantDraft[];
};

/** Türkçe karakterleri de doğru çeviren slug üretici. */
export function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDraft(product?: Product): Draft {
  if (!product) {
    return {
      name: "",
      slug: "",
      description: "",
      brand: "",
      categoryId: "",
      mainImage: "",
      images: [],
      price: "",
      salePrice: "",
      unit: "adet",
      weight: "",
      productType: "",
      active: true,
      isBestSeller: false,
      isNew: false,
      variants: [],
    };
  }

  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    categoryId: String(product.categoryId),
    mainImage: product.mainImage,
    images: product.images,
    price: String(product.price),
    salePrice: product.salePrice != null ? String(product.salePrice) : "",
    unit: product.unit,
    weight: product.weight,
    productType: product.productType,
    active: product.active,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
    variants: product.variants.map((variant) => ({
      name: variant.name,
      optionLabel: variant.optionLabel,
      price: String(variant.price),
    })),
  };
}

export function ProductForm({
  product,
  categories,
  readOnly = false,
}: {
  product?: Product;
  categories: { id: number; name: string }[];
  /** Canlı demoda kaydetme ve görsel yükleme kapalıdır. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(product));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const isEdit = Boolean(product);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((old) => ({ ...old, [key]: value }));

  function addImages(urls: string[]) {
    const merged = Array.from(new Set([...draft.images, ...urls])).slice(0, 12);
    setDraft((old) => ({
      ...old,
      images: merged,
      mainImage: old.mainImage || merged[0] || "",
    }));
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || readOnly) return;
    setUploading(true);
    setError("");
    setNotice("");

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/panel/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || `${file.name} yüklenemedi.`);
        break;
      }
      uploaded.push(data.url);
    }

    if (uploaded.length) {
      addImages(uploaded);
      setNotice(`${uploaded.length} görsel eklendi.`);
    }
    setUploading(false);
  }

  function addUrl() {
    const value = urlInput.trim();
    if (!value) return;
    if (!/^https?:\/\//i.test(value) && !value.startsWith("/")) {
      setError("Görsel adresi http(s):// ile başlamalı veya /uploads/... biçiminde olmalı.");
      return;
    }
    addImages([value]);
    setUrlInput("");
    setError("");
  }

  function removeImage(url: string) {
    setDraft((old) => {
      const images = old.images.filter((item) => item !== url);
      return {
        ...old,
        images,
        mainImage: old.mainImage === url ? images[0] || "" : old.mainImage,
      };
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...(isEdit ? { id: product!.id } : {}),
      name: draft.name.trim(),
      slug: draft.slug.trim() || slugify(draft.name),
      description: draft.description.trim(),
      brand: draft.brand.trim(),
      categoryId: Number(draft.categoryId),
      mainImage: draft.mainImage || draft.images[0] || "",
      images: draft.images,
      price: Number(draft.price),
      salePrice: draft.salePrice === "" ? null : Number(draft.salePrice),
      unit: draft.unit.trim() || "adet",
      weight: draft.weight.trim(),
      productType: draft.productType.trim(),
      active: draft.active,
      isBestSeller: draft.isBestSeller,
      isNew: draft.isNew,
      variants: draft.variants
        .filter((variant) => variant.optionLabel.trim() && variant.price !== "")
        .map((variant) => ({
          name: variant.name.trim() || "Seçenek",
          optionLabel: variant.optionLabel.trim(),
          price: Number(variant.price),
        })),
    };

    if (payload.salePrice != null && payload.salePrice >= payload.price) {
      setError("İndirimli fiyat, normal fiyattan düşük olmalıdır.");
      setSaving(false);
      return;
    }

    const response = await fetch("/api/panel/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "Kaydedilemedi.");
      return;
    }

    router.push("/panel/urunler");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="text-lg font-bold text-ink">Ürün bilgileri</h2>

          <label className={`${panelLabel} mt-4`}>
            Ürün adı
            <input
              required
              value={draft.name}
              onChange={(event) => {
                const value = event.target.value;
                setDraft((old) => ({
                  ...old,
                  name: value,
                  slug: isEdit ? old.slug : slugify(value),
                }));
              }}
              className={panelInput}
            />
          </label>

          <label className={`${panelLabel} mt-4`}>
            Bağlantı adresi (slug)
            <input
              required
              value={draft.slug}
              onChange={(event) => set("slug", event.target.value)}
              className={panelInput}
            />
            <span className="mt-1 block text-xs font-normal text-muted">
              /product/{draft.slug || "urun-adi"}
            </span>
          </label>

          <label className={`${panelLabel} mt-4`}>
            Açıklama
            <textarea
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
              className={`${panelInput} min-h-32`}
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={panelLabel}>
              Kategori
              <select
                required
                value={draft.categoryId}
                onChange={(event) => set("categoryId", event.target.value)}
                className={panelInput}
              >
                <option value="">Seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={panelLabel}>
              Marka
              <input
                value={draft.brand}
                onChange={(event) => set("brand", event.target.value)}
                className={panelInput}
              />
            </label>

            <label className={panelLabel}>
              Gramaj / ölçü
              <input
                value={draft.weight}
                onChange={(event) => set("weight", event.target.value)}
                placeholder="Örn. 1 kg"
                className={panelInput}
              />
            </label>

            <label className={panelLabel}>
              Ürün türü
              <input
                value={draft.productType}
                onChange={(event) => set("productType", event.target.value)}
                placeholder="Örn. Kuvertür"
                className={panelInput}
              />
            </label>

            <label className={panelLabel}>
              Fiyat (TL)
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={draft.price}
                onChange={(event) => set("price", event.target.value)}
                className={panelInput}
              />
            </label>

            <label className={panelLabel}>
              İndirimli fiyat (TL)
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.salePrice}
                onChange={(event) => set("salePrice", event.target.value)}
                className={panelInput}
              />
              <span className="mt-1 block text-xs font-normal text-muted">
                Doldurulursa normal fiyat üstü çizili gösterilir.
              </span>
            </label>

            <label className={panelLabel}>
              Satış birimi
              <input
                value={draft.unit}
                onChange={(event) => set("unit", event.target.value)}
                placeholder="adet, paket, set…"
                className={panelInput}
              />
            </label>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Varyasyonlar</h2>
            <button
              type="button"
              onClick={() =>
                set("variants", [
                  ...draft.variants,
                  { name: "Gramaj", optionLabel: "", price: "" },
                ])
              }
              className="text-sm font-semibold text-brand"
            >
              + Seçenek ekle
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">
            Seçenek eklerseniz müşteri sepete eklemeden önce seçim yapmak zorunda kalır ve
            fiyat seçeneğe göre belirlenir.
          </p>

          {draft.variants.length === 0 ? (
            <p className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-muted">
              Seçenek yok. Ürün tek fiyatla satılır.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {draft.variants.map((variant, index) => (
                <div key={index} className="flex flex-wrap gap-2">
                  <input
                    value={variant.name}
                    onChange={(event) => {
                      const next = [...draft.variants];
                      next[index] = { ...variant, name: event.target.value };
                      set("variants", next);
                    }}
                    placeholder="Tür (Gramaj)"
                    aria-label="Varyasyon türü"
                    className="w-28 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <input
                    value={variant.optionLabel}
                    onChange={(event) => {
                      const next = [...draft.variants];
                      next[index] = { ...variant, optionLabel: event.target.value };
                      set("variants", next);
                    }}
                    placeholder="Seçenek (500 g)"
                    aria-label="Varyasyon adı"
                    className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={(event) => {
                      const next = [...draft.variants];
                      next[index] = { ...variant, price: event.target.value };
                      set("variants", next);
                    }}
                    placeholder="Fiyat"
                    aria-label="Varyasyon fiyatı"
                    className="w-28 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "variants",
                        draft.variants.filter((_, position) => position !== index),
                      )
                    }
                    aria-label="Seçeneği kaldır"
                    className="px-2 text-muted hover:text-rose-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="text-lg font-bold text-ink">Görseller</h2>
          <p className="mt-1 text-xs text-muted">
            JPEG, PNG, WEBP veya GIF · en fazla 8 MB. Yıldıza tıklayarak ana görseli seçin.
          </p>

          <label
            className={`${secondaryButton} mt-4 w-full ${readOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <Upload size={16} />
            {uploading ? "Yükleniyor…" : "Dosya yükle"}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading || readOnly}
              onChange={(event) => {
                uploadFiles(event.target.files);
                event.target.value = "";
              }}
              className="sr-only"
            />
          </label>

          <div className="mt-3 flex gap-2">
            <input
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addUrl();
                }
              }}
              placeholder="veya görsel adresi (https://…)"
              aria-label="Görsel adresi"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={addUrl}
              disabled={readOnly}
              className={secondaryButton}
            >
              <Link2 size={15} />
              Ekle
            </button>
          </div>

          {draft.images.length > 0 && (
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {draft.images.map((url) => (
                <li key={url} className="relative">
                  <span className="block aspect-square overflow-hidden rounded-lg border border-line bg-brand-soft">
                    <ProductImage
                      src={url}
                      alt=""
                      width={120}
                      height={120}
                      className="h-full w-full object-contain"
                    />
                  </span>

                  <button
                    type="button"
                    onClick={() => set("mainImage", url)}
                    aria-label="Ana görsel yap"
                    aria-pressed={draft.mainImage === url}
                    className={`absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full ${
                      draft.mainImage === url
                        ? "bg-brand text-white"
                        : "bg-white/90 text-muted"
                    }`}
                  >
                    <Star size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Görseli kaldır"
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-rose-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold text-ink">Yayın</h2>
          <div className="mt-3 space-y-2.5 text-sm">
            {(
              [
                ["active", "Satışta (aktif)"],
                ["isBestSeller", "Çok satan olarak işaretle"],
                ["isNew", "Yeni ürün olarak işaretle"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft[key]}
                  onChange={(event) => set(key, event.target.checked)}
                  className="accent-[var(--color-brand)]"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {notice && !error && (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>
        )}

        {readOnly && <DemoInlineNotice />}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || readOnly}
            className={`${primaryButton} flex-1`}
          >
            {saving ? "Kaydediliyor…" : isEdit ? "Değişiklikleri kaydet" : "Ürünü kaydet"}
          </button>
          <Link href="/panel/urunler" className={secondaryButton}>
            Vazgeç
          </Link>
        </div>
      </div>
    </form>
  );
}
