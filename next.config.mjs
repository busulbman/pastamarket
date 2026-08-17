/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Tamamen statik müşteri demosu.
   *
   * Çıktı `out/` klasörüne yazılır; Netlify'da hiçbir Function, SSR,
   * API route, middleware, server action veya native modül çalışmaz.
   * Ürün ve kategori verisi build sırasında data/demo-catalog.json
   * dosyasından okunur.
   */
  output: "export",

  // Statik export'ta Next.js görsel optimizasyon sunucusu bulunmaz.
  images: { unoptimized: true },

  // /urunler gibi yolların /urunler/index.html olarak yazılmasını sağlar;
  // Netlify statik sunumunda temiz URL'ler için gereklidir.
  trailingSlash: true,
};

export default nextConfig;
