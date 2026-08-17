import type { Metadata } from "next";
import { StoreShell } from "@/components/store-shell";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = { title: "Sepetim | PastaMarket" };

export default function Cart() {
  return (
    <StoreShell>
      <main className="container py-8">
        <CartPage />
      </main>
    </StoreShell>
  );
}
