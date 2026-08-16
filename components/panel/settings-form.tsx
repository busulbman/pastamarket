"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SETTING_KEYS } from "@/lib/panel-schemas";
import { panelInput, panelLabel, primaryButton } from "@/components/panel/ui";
import { DemoInlineNotice } from "@/components/demo-notice";

type Field = { key: string; label: string; area?: boolean; hint?: string };

const GROUPS: { title: string; description?: string; fields: Field[] }[] = [
  {
    title: "İletişim",
    description: "Boş bırakılan alanlar müşteri sitesinde hiç gösterilmez.",
    fields: [
      {
        key: "whatsapp",
        label: "WhatsApp numarası (ülke kodlu)",
        hint: "Örn. 90 ile başlayan numara. Boşken WhatsApp butonları gizlenir.",
      },
      { key: "phone", label: "Telefon" },
      { key: "instagram", label: "Instagram bağlantısı" },
      { key: "address", label: "Adres", area: true },
      { key: "hours", label: "Çalışma saatleri" },
    ],
  },
  {
    title: "Teslimat ve ücretler",
    fields: [
      { key: "same_day_cutoff", label: "Aynı gün teslimat son saati" },
      { key: "courier_districts", label: "Kurye ilçeleri (virgülle ayırın)", area: true },
      { key: "courier_fee", label: "Kurye ücreti (TL)" },
      { key: "free_courier_limit", label: "Ücretsiz kurye limiti (TL)" },
      { key: "shipping_fee", label: "Kargo ücreti (TL)" },
      { key: "free_shipping_limit", label: "Ücretsiz kargo limiti (TL)" },
    ],
  },
  {
    title: "Havale / EFT",
    fields: [
      {
        key: "iban",
        label: "IBAN",
        hint: "Boşken Havale/EFT ödeme seçeneği müşteriye gösterilmez.",
      },
      { key: "iban_receiver", label: "Alıcı adı" },
      { key: "iban_bank", label: "Banka" },
    ],
  },
  {
    title: "Marka ve ana sayfa",
    fields: [
      { key: "brand_name", label: "Marka adı" },
      { key: "tagline", label: "Logo altı slogan" },
      { key: "announcement", label: "Duyuru çubuğu metni", area: true },
      { key: "hero_title", label: "Banner başlığı" },
      { key: "hero_text", label: "Banner açıklaması", area: true },
      { key: "hero_image", label: "Banner görsel adresi" },
      { key: "hero_link", label: "Banner buton bağlantısı" },
      { key: "banner_title", label: "Alt banner başlığı" },
      { key: "banner_text", label: "Alt banner metni", area: true },
      { key: "banner_image", label: "Alt banner görsel adresi" },
      { key: "banner_link", label: "Alt banner bağlantısı" },
    ],
  },
  {
    title: "Kurumsal sayfa metinleri",
    fields: [
      { key: "page_about", label: "Hakkımızda", area: true },
      { key: "page_delivery", label: "Teslimat ve iade", area: true },
      { key: "page_distance_sales", label: "Mesafeli satış sözleşmesi", area: true },
      { key: "page_privacy", label: "Gizlilik politikası", area: true },
    ],
  },
];

export function SettingsForm({
  initial,
  readOnly = false,
}: {
  initial: Record<string, string>;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");
    setError("");

    // Yalnızca bilinen ayar anahtarları gönderilir.
    const payload = Object.fromEntries(
      SETTING_KEYS.map((key) => [key, values[key] ?? ""]),
    );

    const response = await fetch("/api/panel/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Ayarlar kaydedilemedi.");
      return;
    }

    setMessage("Ayarlar kaydedildi.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-4xl">
      {GROUPS.map((group) => (
        <section key={group.title} className="card mb-5 p-5">
          <h2 className="text-lg font-bold text-ink">{group.title}</h2>
          {group.description && (
            <p className="mt-1 text-sm text-muted">{group.description}</p>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {group.fields.map((field) => (
              <label
                key={field.key}
                className={`${panelLabel} ${field.area ? "md:col-span-2" : ""}`}
              >
                {field.label}
                {field.area ? (
                  <textarea
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      setValues((old) => ({ ...old, [field.key]: event.target.value }))
                    }
                    className={`${panelInput} min-h-24`}
                  />
                ) : (
                  <input
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      setValues((old) => ({ ...old, [field.key]: event.target.value }))
                    }
                    className={panelInput}
                  />
                )}
                {field.hint && (
                  <span className="mt-1 block text-xs font-normal text-muted">
                    {field.hint}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>
      ))}

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {message && !error && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      {readOnly && <div className="mb-4"><DemoInlineNotice /></div>}

      <button type="submit" disabled={saving || readOnly} className={primaryButton}>
        {saving ? "Kaydediliyor…" : "Ayarları kaydet"}
      </button>
    </form>
  );
}
