import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { StoreShell } from "@/components/store-shell";
import { WhatsAppOrderForm } from "@/components/whatsapp-order-form";

export const metadata: Metadata = { title: "Siparişi Tamamla | PastaMarket" };

export default function OrderPage() {
  return (
    <StoreShell>
      <main className="container py-8">
        <h1 className="mb-6 text-2xl font-extrabold text-ink sm:text-3xl">
          Siparişi Tamamla
        </h1>
        <WhatsAppOrderForm settings={getSettings()} />
      </main>
    </StoreShell>
  );
}
