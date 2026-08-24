# PastaMarket

Next.js App Router ile hazırlanmış PastaMarket vitrini ve yönetim paneli.
Canlı mağaza Firebase Firestore’dan okunur. Görsel sağlayıcısı geçişi için ImgBB
korunur; production akışı Cloudinary signed upload kullanacak şekilde tasarlanmıştır.
Firebase Admin SDK yalnızca Node.js sunucu kodunda kullanılır; Firebase
Authentication kullanılmaz.

## Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın. Gerçek değerleri asla
repoya eklemeyin.

| Değişken | Amaç |
| --- | --- |
| `DATA_PROVIDER` | Yerel/demo için `json`, canlı ortam için `firestore` |
| `IMAGE_PROVIDER` | `imgbb` veya production için `cloudinary` |
| `ADMIN_USERNAME` | Panel kullanıcı adı |
| `ADMIN_PASSWORD` | Varsa öncelikli kullanılan düz panel parolası; yalnızca Netlify environment ayarında saklayın |
| `ADMIN_PASSWORD_HASH` | `ADMIN_PASSWORD` boşsa kullanılan bcrypt parola hash’i |
| `ADMIN_SESSION_SECRET` | En az 32 karakterlik oturum imzalama anahtarı |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Sunucu tarafı Firebase Admin yapılandırması |
| `IMGBB_API_KEY` | Yalnızca korumalı upload route’unun kullandığı anahtar |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary signed upload ve silme işlemleri için sunucu yapılandırması |

Parola hash’i üretmek için:

```bash
npm run admin:create-password -- 'uzun-ve-benzersiz-parolaniz'
```

## Geliştirme ve kontroller

```bash
DATA_PROVIDER=json IMAGE_PROVIDER=local npm run dev
DATA_PROVIDER=json IMAGE_PROVIDER=local npm run typecheck
DATA_PROVIDER=json IMAGE_PROVIDER=local npm run build
```

JSON modu `data/demo-catalog.json` içindeki 9 kategori, 44 ürün, 18 varyasyon
ve mağaza ayarını salt-okunur demo olarak kullanır. Firestore modunda panel,
checkout ve ürün yönetimi yazılabilirdir.

## Firestore aktarımı

Firebase ortam değişkenleri tanımlandıktan sonra:

```bash
DATA_PROVIDER=firestore npm run firestore:migrate-demo
```

Aktarım, sabit belge kimlikleri ve `settings/migrations` işaretleyicisi kullanır;
tekrar çalıştırıldığında yeni kopya kayıt oluşturmaz.

## Cloudinary ve toplu aktarım

Production için `IMAGE_PROVIDER=cloudinary` kullanın. Paneldeki tekli ve toplu
yüklemeler önce oturum korumalı imza endpoint’inden kısa ömürlü bir imza alır;
dosya tarayıcıdan doğrudan Cloudinary'ye `pastamarket/products` klasörüne gider.
API secret tarayıcıya gönderilmez. Yalnızca JPG, PNG ve WebP ile dosya başına
10 MB kabul edilir.

`/panel/toplu-urun-aktar` ekranı şu CSV başlıklarını bekler:

`name,slug,category_slug,price,compare_at_price,brand,weight,description,active,image_filename`

Önizleme doğrulama yapar; aktarım slug üzerinden idempotent olarak ürün oluşturur
veya günceller. Görsel dosyasının uzantısız adı slug ya da `image_filename` ile
eşleşmelidir. Cloudinary doğrudan yüklemeleri aynı anda en fazla dört dosya çalıştırır.

Firestore cursor sorguları için [firestore.indexes.json](firestore.indexes.json)
dosyasındaki ürün indekslerini Firebase projesine uygulayın.

## Netlify

Node sürümü 22’dir. `output: "export"` kullanılmaz: Netlify’nin güncel Next.js
OpenNext desteği App Router, Route Handler, SSR ve cache revalidation’ı çalıştırır.
Netlify ortamında `DATA_PROVIDER=firestore`, `IMAGE_PROVIDER=cloudinary` ve gerekli
Firebase, oturum, Cloudinary (ve geçiş gerekiyorsa ImgBB) değerleri yalnızca
platformun environment ayarlarına eklenmelidir.
