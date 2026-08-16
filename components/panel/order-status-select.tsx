"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/constants";

export function OrderStatusSelect({
  id,
  status,
  orderNumber,
  readOnly = false,
}: {
  id: number;
  status: string;
  orderNumber: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    if (readOnly) return;
    const previous = value;
    setValue(next);
    setBusy(true);
    setError("");

    const response = await fetch("/api/panel/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    setBusy(false);

    if (!response.ok) {
      setValue(previous);
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Durum güncellenemedi.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <select
        value={value}
        disabled={busy || readOnly}
        onChange={(event) => change(event.target.value)}
        aria-label={`${orderNumber} sipariş durumu`}
        className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand disabled:opacity-60"
      >
        {ORDER_STATUSES.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
