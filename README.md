# PastaMarket

Next.js 15 (App Router), React 19, Tailwind CSS v4 ve SQLite ile çalışan pastacılık
malzemeleri mağazası. Şu an **demo modunda**: veriler SQLite'ta, görseller yerel
`public/uploads` klasöründe tutulur.

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run admin:create-password   # panel parolası için bcrypt hash üretir
npm run dev                     # http://localhost:3000
```

### Panel parolası

`npm run admin:create-password` parolayı ekranda göstermeden sorar, bcrypt hash'ini
üretir ve isterseniz `.env.local` dosyasına yazar. **Parolanın kendisi hiçbir yere
yazılmaz** — ne dosyaya, ne terminal geçmişine, ne loglara.

Ardından `.env.local` içinde `ADMIN_EMAIL` değerini de doldurun ve dev sunucusunu
yeniden başlatın.

> **Dikkat:** bcrypt hash'i `$` karakteri içerir. Next.js `.env` dosyalarını
> dotenv-expand ile okuduğu için kaçırılmamış `$2b` bir değişken sanılır ve hash
> bozulur (giriş sessizce başarısız olur). Bu yüzden `$` karakterleri `\$` olarak
> yazılmalıdır:
>
> ```
> ADMIN_PASSWORD_HASH='\$2b\$12\$abc...'
> ```
>
> Script bu kaçışı otomatik uygular. Hash bozuksa sunucu günlüğünde açık bir uyarı
> yazılır.

### Oturum anahtarı

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Çıktıyı `ADMIN_SESSION_SECRET` değerine yazın. En az 16 karakter olmalıdır.

### Üretim davranışı

Gerekli ENV değerlerinden biri eksik veya bozuksa panel girişi **reddedilir**;
hiçbir koşulda varsayılan bir parolaya düşülmez. Geliştirme ortamında giriş
ekranında hangi anahtarların eksik olduğu (değerleri değil, yalnızca adları)
gösterilir.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Derlenmiş uygulamayı çalıştırır |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run admin:create-password` | Panel parolası için bcrypt hash üretir |

## Panel adresleri

| Adres | Ekran |
| --- | --- |
| `/panel/login` | Giriş (korumalı alanın dışındadır) |
| `/panel` | Kontrol paneli — özet sayılar ve son siparişler |
| `/panel/urunler` | Ürün listesi (arama, kategori/durum filtresi, sayfalama) |
| `/panel/urunler/yeni` | Yeni ürün |
| `/panel/urunler/[id]` | Ürün düzenleme |
| `/panel/kategoriler` | Kategori yönetimi |
| `/panel/siparisler` | Sipariş listesi, detay ve durum değiştirme |
| `/panel/ayarlar` | İletişim, teslimat, ödeme ve içerik ayarları |

Eski `/admin/*` adresleri karşılıklarına kalıcı (308) yönlendirilir.

## Yapı

| Klasör | İçerik |
| --- | --- |
| `app/` | Sayfalar ve API route'ları |
| `app/panel/(korumali)/` | Oturum korumalı panel ekranları |
| `app/api/panel/` | Panel API'leri (her biri oturumu ayrıca doğrular) |
| `components/panel/` | Panel arayüz bileşenleri |
| `lib/auth/` | Oturum ve kimlik doğrulama sağlayıcısı |
| `lib/images/` | Görsel yükleme sağlayıcısı |
| `lib/db.ts` | SQLite veri erişim katmanı |
| `data/backups/` | Tarihli veritabanı yedekleri |

## Tema

Tüm renkler `app/globals.css` içindeki `@theme` bloğunda tanımlıdır
(`--color-brand`, `--color-ink`, `--color-line` …). Bileşenlerde `bg-brand`,
`text-ink`, `border-line` sınıfları kullanılır; dosyalara hex kodu yazılmaz.

## İş kuralları

- Üyelik yoktur; müşteri kayıt olmadan sipariş verir.
- Online kredi kartı ödemesi alınmaz. Ödeme: kapıda nakit, kapıda fiziksel POS,
  Havale/EFT (IBAN tanımlıysa gösterilir).
- Kurye: ayarlarda tanımlı İstanbul ilçelerinde. 2.500 TL altı 120 TL, üzeri ücretsiz.
- Kargo: Türkiye geneli. 3.500 TL ve üzeri ücretsiz, altında ayarlardaki ücret.
- Ürünlerde gramaj, tür ve varyasyona göre fiyat desteklenir.
- Sipariş tutarları **her zaman sunucuda** yeniden hesaplanır; istemciden gelen
  fiyatlara güvenilmez. Tekrarlanan gönderimler idempotency anahtarıyla engellenir.

## Ürün görselleri

Görseller tamamen yereldir; dış kaynak (Unsplash vb.) kullanılmaz.

- Ürün görselleri: `public/images/products/<slug>.jpg`
- Eksik görsellerde `public/images/product-placeholder.svg` gösterilir.

Dosyanın diskte olup olmadığı sunucuda (`lib/product-images.ts`) kontrol edilir ve
sonuç veri katmanında çözülür. Bu sayede tarayıcıya hiçbir zaman var olmayan bir
yol gönderilmez — 404 ve yeniden deneme döngüsü oluşmaz.

Bir ürünün görselini yayına almak için dosyayı ilgili slug adıyla
`public/images/products/` klasörüne kopyalamanız yeterlidir; kod değişikliği
gerekmez.

## Görsel yükleme (demo)

`IMAGE_PROVIDER=local` iken görseller `public/uploads` altına, sunucuda üretilen
benzersiz adlarla kaydedilir. Kullanıcıdan gelen dosya adı hiçbir zaman
kullanılmaz. Sunucu tarafında MIME türü, uzantı ve boyut (en fazla 8 MB) doğrulanır;
izin verilen türler JPEG, PNG, WEBP ve GIF'tir.

Bu yöntem yalnızca tek makinede çalışan demo/geliştirme içindir. Vercel gibi
efemer dosya sistemine sahip ortamlarda yüklenen görseller kalıcı olmaz.


## Netlify'a demo yayını

Next.js runtime'ı (OpenNext tabanlı, **v5**) Netlify tarafından otomatik algılanır.
`netlify.toml` içine bilerek `[[plugins]]` bloğu **eklenmemiştir** ve hiçbir sürüm
sabitlenmemiştir. `publish` klasörü de tanımlı değildir — çıktının yerini runtime
belirler. Static export kullanılmaz: App Router, API route'ları, sepet, checkout ve
panel sunucu tarafında çalışmaya devam eder.

### Build ayarları

| Ayar | Değer | Nerede tanımlı |
| --- | --- | --- |
| Build command | `npm run build` | `netlify.toml` |
| Publish directory | *(tanımlanmaz)* | runtime belirler |
| Node.js sürümü | `20` | `netlify.toml` + `.nvmrc` + `package.json > engines` |
| Functions runtime | Node.js | tüm API route'larında `export const runtime = "nodejs"` |

`netlify.toml` içindeki `[functions]` bloğu şunları sağlar:

- `external_node_modules = ["better-sqlite3"]` — native `.node` dosyası bundle
  edilmek yerine olduğu gibi paketlenir.
- `included_files` — `data/pastamarket.db`, `public/images/**` ve
  `better-sqlite3` modülü fonksiyon paketine dahil edilir.

### Netlify panelinde tanımlanacak environment variable'lar

| Değişken | Değer | Zorunlu |
| --- | --- | --- |
| `DEMO_READ_ONLY` | `true` | evet |
| `ADMIN_EMAIL` | panel giriş e-postanız | evet |
| `ADMIN_PASSWORD_HASH` | `npm run admin:create-password` çıktısı | evet |
| `ADMIN_SESSION_SECRET` | 32 baytlık rastgele hex | evet |

Bu dört değişken **hem build hem runtime** için tanımlı olmalıdır (Netlify'da
varsayılan davranış budur). `DEMO_READ_ONLY` build sırasında da okunur; böylece
derleme adımı veritabanına yazmaya çalışmaz.

`ADMIN_PASSWORD_HASH` değerini Netlify arayüzüne yapıştırırken `$` karakterlerini
**kaçırmayın** — Netlify değeri olduğu gibi saklar. Kaçış (`\$`) yalnızca yerel
`.env` dosyaları için gereklidir.

İsteğe bağlı (varsayılanları vardır, tanımlamasanız da çalışır):
`DEMO_MODE`, `DATA_PROVIDER`, `IMAGE_PROVIDER`, `SQLITE_DATABASE_PATH`,
`LOCAL_UPLOAD_DIR`.

### Deploy öncesi: veritabanını hazırlayın

```bash
npm run db:prepare-demo
```

Yerel geliştirmede veritabanı WAL modunda çalışır ve veriler `-wal` yan dosyasında
bekleyebilir. Bu komut WAL içeriğini ana dosyaya yazar, `journal_mode`'u `delete`
yapar ve dosyayı küçültür; böylece deploy edilen tek `.db` dosyası kendi kendine
yeter ve salt-okunur açılabilir. **Veritabanını commit etmeden önce çalıştırın.**

### Canlı demoda kapalı olan işlemler

`DEMO_READ_ONLY=true` iken aşağıdakiler 403 ve şu mesajla reddedilir:
*"Demo sürümünde değişiklikler kapalıdır. Kalıcı yönetim Firebase ve ImgBB
bağlantısından sonra aktif olacaktır."*

- Ürün ekleme / düzenleme / silme / aktif-pasif
- Kategori ekleme / düzenleme / silme
- Sipariş durumu değiştirme
- Ayar değiştirme
- Görsel yükleme
- Sipariş oluşturma (checkout)

Çalışmaya devam edenler: mağaza sayfaları, arama, kategori ve ürün detayı, sepet
(tarayıcıda tutulur), checkout formunun görüntülenmesi, panel girişi ve tüm panel
ekranlarının okunması.

Yerel geliştirmede `DEMO_READ_ONLY` tanımsızdır; tüm yazma özellikleri aynen çalışır.

## İleride Firebase / ImgBB geçişi

Arayüzü yeniden yazmadan geçebilmek için üç katman ayrılmıştır:

| Katman | Bugün | Geçişte değişecek dosya |
| --- | --- | --- |
| Veri | SQLite | `lib/db.ts` (fonksiyon imzaları korunur) |
| Görsel | `public/uploads` | `lib/images/index.ts` + yeni `lib/images/imgbb.ts` |
| Kimlik | ENV + bcrypt | `lib/auth/provider.ts` (yeni sağlayıcı eklenir) |

Panel bileşenleri, route guard'ları ve oturum katmanı bu geçişlerden etkilenmez.
