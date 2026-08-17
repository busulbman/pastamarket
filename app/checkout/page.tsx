import type { Metadata } from "next";
import { settings } from "@/lib/data";
import { StoreShell } from "@/components/store-shell";
import { CheckoutForm } from "@/components/checkout-form";
import { DemoNotice } from "@/components/demo-notice";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Siparişi Tamamla | PastaMarket" };

export default async function Checkout() {
  return (
    <StoreShell>
      <main className="container py-8">
        <h1 className="mb-6 text-2xl font-extrabold text-ink sm:text-3xl">
          Siparişi Tamamla
        </h1>
        {demoReadOnly && <DemoNotice className="mb-6" />}
        <CheckoutForm settings={await settings()} readOnly={demoReadOnly} />
      </main>
    </StoreShell>
  );
}
