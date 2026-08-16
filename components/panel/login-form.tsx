"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { panelInput, panelLabel, primaryButton } from "@/components/panel/ui";

export function LoginForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Giriş yapılamadı.");
        setBusy(false);
        return;
      }

      router.replace("/panel");
      router.refresh();
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-sm p-6">
      <h1 className="text-2xl font-extrabold text-ink">Panel girişi</h1>
      <p className="mt-2 text-sm text-muted">Yetkili erişim gereklidir.</p>

      <label className={`${panelLabel} mt-6`}>
        E-posta
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          disabled={!enabled}
          className={panelInput}
        />
      </label>

      <label className={`${panelLabel} mt-4`}>
        Parola
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={!enabled}
          className={panelInput}
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-brand-soft p-3 text-sm text-brand">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy || !enabled} className={`${primaryButton} mt-6 w-full`}>
        {busy ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
