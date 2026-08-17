import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { dashboardStats, recentOrders } from "@/lib/data";
import { money } from "@/lib/format";
import { PageHeader, StatCard, EmptyState, primaryButton } from "@/components/panel/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kontrol paneli | PastaMarket" };

export default async function PanelHome() {
  const stats = await dashboardStats();
  const latest = await recentOrders(8);

  return (
    <>
      <PageHeader
        title="Kontrol paneli"
        description="Mağazanın güncel durumu"
        action={
          <Link href="/panel/urunler/yeni" className={primaryButton}>
            <Plus size={16} />
            Yeni ürün ekle
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Toplam ürün" value={stats.totalProducts} href="/panel/urunler" />
        <StatCard label="Aktif ürün" value={stats.activeProducts} href="/panel/urunler" />
        <StatCard label="Kategori" value={stats.categories} href="/panel/kategoriler" />
        <StatCard label="Toplam sipariş" value={stats.totalOrders} href="/panel/siparisler" />
        <StatCard label="Bekleyen sipariş" value={stats.openOrders} href="/panel/siparisler" />
        <StatCard label="Bugünkü ciro" value={money(stats.revenueToday)} />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Son siparişler</h2>
          <Link href="/panel/siparisler" className="text-sm font-semibold text-brand">
            Tümünü gör
          </Link>
        </div>

        {latest.length === 0 ? (
          <EmptyState>Henüz sipariş yok.</EmptyState>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line-soft bg-zinc-50 text-xs text-muted">
                  <tr>
                    <th className="p-3 font-semibold">Sipariş no</th>
                    <th className="p-3 font-semibold">Müşteri</th>
                    <th className="p-3 font-semibold">Tutar</th>
                    <th className="p-3 font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {latest.map((order) => (
                    <tr key={order.id} className="border-b border-line-soft last:border-0">
                      <td className="p-3">
                        <Link
                          href={`/panel/siparisler?q=${encodeURIComponent(order.order_number)}`}
                          className="font-semibold text-brand"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="p-3">
                        {order.first_name} {order.last_name}
                      </td>
                      <td className="p-3 font-semibold">{money(order.total)}</td>
                      <td className="p-3 text-muted">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
