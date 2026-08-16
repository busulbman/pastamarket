"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { slugify } from "@/components/panel/product-form";
import { DemoInlineNotice } from "@/components/demo-notice";
import {
  Badge,
  panelInput,
  panelLabel,
  primaryButton,
  secondaryButton,
} from "@/components/panel/ui";

export type PanelCategory = {
  id: number;
  name: string;
  slug: string;
  image: string;
  active: number;
  sort_order: number;
  productCount: number;
};

type Draft = {
  id?: number;
  name: string;
  slug: string;
  image: string;
  sortOrder: string;
  active: boolean;
};

const emptyDraft: Draft = {
  name: "",
  slug: "",
  image: "",
  sortOrder: "0",
  active: true,
};

export function CategoryManager({
  initial,
  readOnly = false,
}: {
  initial: PanelCategory[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  const isEdit = Boolean(draft.id);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((old) => ({ ...old, [key]: value }));

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setError("");

    const response = await fetch("/api/panel/categories", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEdit ? { id: draft.id } : {}),
        name: draft.name.trim(),
        slug: draft.slug.trim() || slugify(draft.name),
        image: draft.image.trim(),
        sortOrder: Number(draft.sortOrder) || 0,
        active: draft.active,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "Kaydedilemedi.");
      return;
    }

    setDraft(emptyDraft);
    startTransition(() => router.refresh());
  }

  async function remove(category: PanelCategory) {
    if (readOnly) return;
    if (category.productCount > 0) {
      setError(
        `“${category.name}” kategorisinde ${category.productCount} ürün var. Önce ürünleri başka kategoriye taşıyın.`,
      );
      return;
    }
    if (!window.confirm(`“${category.name}” kategorisi silinsin mi?`)) return;

    setError("");
    const response = await fetch("/api/panel/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category.id }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Kategori silinemedi.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card overflow-hidden">
        <ul className="divide-y divide-line-soft">
          {initial.map((category) => (
            <li key={category.id} className="flex items-center gap-3 p-3">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-soft">
                <ProductImage
                  src={category.image}
                  alt=""
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </span>

              <div className="min-w-0 flex-1">
                <b className="block text-sm text-ink">{category.name}</b>
                <span className="text-xs text-muted">
                  /{category.slug} · sıra {category.sort_order} · {category.productCount} ürün
                </span>
              </div>

              <Badge tone={category.active ? "success" : "neutral"}>
                {category.active ? "Aktif" : "Pasif"}
              </Badge>

              <button
                type="button"
                onClick={() =>
                  setDraft({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    image: category.image || "",
                    sortOrder: String(category.sort_order),
                    active: !!category.active,
                  })
                }
                className="text-sm font-semibold text-brand"
              >
                Düzenle
              </button>

              <button
                type="button"
                onClick={() => remove(category)}
                disabled={readOnly}
                aria-label={`${category.name} kategorisini sil`}
                className="text-muted transition hover:text-rose-600"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={save} className="card h-fit p-5">
        <h2 className="text-lg font-bold text-ink">
          {isEdit ? "Kategoriyi düzenle" : "Yeni kategori"}
        </h2>

        <label className={`${panelLabel} mt-4`}>
          Ad
          <input
            required
            value={draft.name}
            onChange={(event) => {
              const value = event.target.value;
              setDraft((old) => ({
                ...old,
                name: value,
                slug: old.id ? old.slug : slugify(value),
              }));
            }}
            className={panelInput}
          />
        </label>

        <label className={`${panelLabel} mt-3`}>
          Slug
          <input
            required
            value={draft.slug}
            onChange={(event) => set("slug", event.target.value)}
            className={panelInput}
          />
        </label>

        <label className={`${panelLabel} mt-3`}>
          Görsel adresi
          <input
            value={draft.image}
            onChange={(event) => set("image", event.target.value)}
            placeholder="https://… veya /uploads/…"
            className={panelInput}
          />
        </label>

        <label className={`${panelLabel} mt-3`}>
          Sıra
          <input
            type="number"
            min="0"
            value={draft.sortOrder}
            onChange={(event) => set("sortOrder", event.target.value)}
            className={panelInput}
          />
        </label>

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(event) => set("active", event.target.checked)}
            className="accent-[var(--color-brand)]"
          />
          Aktif
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        {readOnly && <div className="mt-4"><DemoInlineNotice /></div>}

        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={saving || readOnly}
            className={`${primaryButton} flex-1`}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={() => {
                setDraft(emptyDraft);
                setError("");
              }}
              className={secondaryButton}
            >
              Vazgeç
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
