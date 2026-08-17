# PastaMarket — statik müşteri demosu

Next.js 15 (App Router), React 19 ve Tailwind CSS v4 ile hazırlanmış pastacılık
malzemeleri mağazası. Bu branch (`main`) **tamamen statik** bir vitrindir:
sunucu, veritabanı, API route ve native modül yoktur.

Panel, SQLite, sipariş veritabanı ve kimlik doğrulama içeren tam sürüm
**`fullstack-backup`** branch'inde durmaktadır. Firebase/ImgBB bağlandığında
oradan geri alınacaktır.

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # statik çıktı -> out/
```

Build sonrası çıktıyı yerelde denemek için:

```bash
npx serve out
```

## Mimari

| Konu | Nasıl |
| --- | --- |
| Veri kaynağı | `data/demo-catalog.json` — **build sırasında** okunur ve sayfalara gömülür |
| Çıktı | `output: "export"` → `out/` klasörü |
| Ürün sayfaları | `generateStaticParams` ile 44 ürün için önceden üretilir |
| Kategori sayfaları | `generateStaticParams` ile 9 kategori için önceden üretilir |
| Arama / filtre / sıralama | Tarayıcıda, gömülü katalog üzerinde (`components/product-list.tsx`) |
| Sepet | `localStorage` (`components/cart.tsx`) |
| Sipariş | Veritabanına yazmaz; hazır WhatsApp mesajı üretir (`/siparis`) |
| Görseller | `public/images/products/` — dosya yoksa `product-placeholder.svg` |

Statik export'ta `next/image` optimizasyon sunucusu bulunmadığı için
`images: { unoptimized: true }` kullanılır.

## Katalog güncelleme

`data/demo-catalog.json` bu branch'te verinin tek kaynağıdır. Ürün/kategori
değişikliği için ya dosyayı doğrudan düzenleyin ya da `fullstack-backup`
branch'inde `npm run demo:export` çalıştırıp üretilen dosyayı buraya kopyalayın.

Dosya biçimi:

```json
{
  "meta":       { "exportedAt": "...", "counts": { … } },
  "settings":   { "brand_name": "...", "whatsapp": "...", … },
  "categories": [ { "id": 1, "name": "...", "slug": "...", … } ],
  "products":   [ { "id": 1, "slug": "...", "price": 210, "variants": [ … ] } ]
}
```

## Netlify ayarları

| Ayar | Değer |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `out` |
| Node.js sürümü | 20 |
| Functions | **yok** |
| `@netlify/plugin-nextjs` | **yok** |
| Environment variable | **gerekmiyor** |

`netlify.toml` yalnızca build komutu, publish klasörü, Node sürümü ve statik
dosya cache başlıklarını içerir.

## Site içeriği

- 9 kategori, 44 ürün, 18 varyasyon
- Ana sayfa: duyuru çubuğu, banner, kategori şeridi, çok satanlar, avantajlar,
  yeni ürünler, alt banner
- Ürün listesi, kategori sayfaları, ürün detayı, markalar
- Sepet ve WhatsApp siparişi
- İletişim ve kurumsal sayfalar (metinler `data/demo-catalog.json` içindeki
  `settings` alanından gelir; boş olanlar gösterilmez)

## Tema

Tüm renkler `app/globals.css` içindeki `@theme` bloğunda tanımlıdır
(`--color-brand`, `--color-ink`, `--color-line` …). Bileşenlerde `bg-brand`,
`text-ink`, `border-line` sınıfları kullanılır; dosyalara hex kodu yazılmaz.
