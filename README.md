# PastaMarket

Next.js App Router ile hazırlanmış PastaMarket vitrini ve yönetim paneli.
Canlı mağaza Firebase Firestore’dan, ürün görselleri ImgBB’den okunacak şekilde
tasarlanmıştır. Firebase Admin SDK yalnızca Node.js sunucu kodunda kullanılır;
Firebase Authentication kullanılmaz.

## Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın. Gerçek değerleri asla
repoya eklemeyin.

| Değişken | Amaç |
| --- | --- |
| `DATA_PROVIDER` | Yerel/demo için `json`, canlı ortam için `firestore` |
| `IMAGE_PROVIDER` | Canlı ortam için `imgbb` |
| `ADMIN_USERNAME` | Panel kullanıcı adı |
| `ADMIN_PASSWORD_HASH` | bcrypt parola hash’i |
| `ADMIN_SESSION_SECRET` | En az 32 karakterlik oturum imzalama anahtarı |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Sunucu tarafı Firebase Admin yapılandırması |
| `IMGBB_API_KEY` | Yalnızca korumalı upload route’unun kullandığı anahtar |

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

## Netlify

Node sürümü 22’dir. `output: "export"` kullanılmaz: Netlify’nin güncel Next.js
OpenNext desteği App Router, Route Handler, SSR ve cache revalidation’ı çalıştırır.
Netlify ortamında `DATA_PROVIDER=firestore` ve `IMAGE_PROVIDER=imgbb` ile gerekli
secret değerleri yalnızca platformun environment ayarlarına eklenmelidir.
