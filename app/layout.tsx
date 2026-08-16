import "./globals.css";
import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart";

export const metadata: Metadata = {
  title: {
    default: "PastaMarket | Pastacılık Malzemeleri",
    template: "%s",
  },
  description:
    "Pastacılığın tüm ihtiyaçları tek adreste. Belirlenen İstanbul ilçelerinde aynı gün teslimat, Türkiye geneli kargo.",
};

export const viewport: Viewport = {
  themeColor: "#e83f67",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
