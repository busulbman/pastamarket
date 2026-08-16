"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
} from "lucide-react";

const LINKS = [
  { href: "/panel", label: "Kontrol paneli", icon: LayoutDashboard },
  { href: "/panel/urunler", label: "Ürünler", icon: Package },
  { href: "/panel/kategoriler", label: "Kategoriler", icon: Boxes },
  { href: "/panel/siparisler", label: "Siparişler", icon: ShoppingBag },
  { href: "/panel/ayarlar", label: "Ayarlar", icon: Settings },
];

export function PanelNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const isActive = (href: string) =>
    href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/panel/login");
    router.refresh();
  }

  return (
    <aside className="flex flex-col bg-ink p-4 text-white lg:min-h-screen">
      <Link href="/panel" className="px-2 py-1 text-lg font-extrabold text-brand-2">
        PastaMarket
        <span className="block text-[10px] font-medium text-white/50">Yönetim paneli</span>
      </Link>

      <nav className="mt-6 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col lg:overflow-visible">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive(link.href) ? "bg-white/15 font-semibold" : "hover:bg-white/10"
              }`}
            >
              <Icon size={17} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-4 lg:mt-auto">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 transition hover:text-white"
        >
          <Store size={16} />
          Siteyi görüntüle
        </Link>
        <p className="truncate px-3 pt-3 text-xs text-white/40">{email}</p>
        <button
          type="button"
          onClick={logout}
          disabled={busy}
          className="mt-1 flex items-center gap-2 px-3 py-2 text-sm text-white/70 transition hover:text-white disabled:opacity-50"
        >
          <LogOut size={16} />
          {busy ? "Çıkış yapılıyor…" : "Çıkış yap"}
        </button>
      </div>
    </aside>
  );
}
