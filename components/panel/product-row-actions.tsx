"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function ProductRowActions({
  id,
  name,
  active,
  readOnly = false,
}: {
  id: number;
  name: string;
  active: boolean;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggleActive(next: boolean) {
    if (readOnly) return;
    setBusy(true);
    setError("");
    const response = await fetch("/api/panel/products/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: next }),
    });
    setBusy(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Durum güncellenemedi.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (readOnly) return;
    if (
      !window.confirm(
        `“${name}” ürünü kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    const response = await fetch("/api/panel/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      // Siparişte kullanılan ürünler silinemez; sunucu bunu 409 ile bildirir.
      setError(data.error || "Ürün silinemedi.");
      return;
    }
    startTransition(() => router.refresh());
  }

  const disabled = busy || pending || readOnly;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted">
          <input
            type="checkbox"
            checked={active}
            disabled={disabled}
            onChange={(event) => toggleActive(event.target.checked)}
            className="accent-[var(--color-brand)]"
          />
          {active ? "Aktif" : "Pasif"}
        </label>

        <button
          type="button"
          onClick={remove}
          disabled={disabled}
          aria-label={`${name} ürününü sil`}
          className="text-rose-600 transition hover:text-rose-700 disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {error && (
        <p role="alert" className="max-w-56 text-right text-[11px] leading-4 text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
