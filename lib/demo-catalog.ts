/**
 * DEMO KATALOĞU
 *
 * Müşteriye gösterilecek örnek ürünlerdir. Bilerek üretici markası taşımaz;
 * marka alanı mağazanın kendi ürün hattını (PastaMarket Profesyonel / Hobi)
 * belirtir. Sahte kampanya, sahte stok adedi veya müşteri yorumu içermez.
 * Görseller yereldir: public/images/products/<slug>.jpg. Dosya eklenmediği
 * sürece arayüzde placeholder gösterilir; dış kaynak kullanılmaz.
 */

export type DemoVariant = { name: string; optionLabel: string; price: number };

export type DemoProduct = {
  slug: string;
  name: string;
  description: string;
  brand: string;
  categorySlug: string;
  weight: string;
  productType: string;
  price: number;
  salePrice?: number;
  unit: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  variants?: DemoVariant[];
};

const PRO = "PastaMarket Profesyonel";
const HOBBY = "PastaMarket Hobi";

export const DEMO_PRODUCTS: DemoProduct[] = [
  // --- Çikolata ---
  {
    slug: "sutlu-kuvertur-cikolata-1-kg",
    name: "Sütlü Kuvertür Çikolata 1 kg",
    description:
      "Yüksek kakao yağı oranı sayesinde kolay temperlenen sütlü kuvertür. Drip kaplama, ganaj ve çikolata süslemelerinde kullanılır. Serin ve kuru ortamda saklayınız.",
    brand: PRO,
    categorySlug: "cikolata",
    weight: "1 kg",
    productType: "Kuvertür",
    price: 649.9,
    unit: "paket",
    isBestSeller: true,
    variants: [
      { name: "Gramaj", optionLabel: "1 kg", price: 649.9 },
      { name: "Gramaj", optionLabel: "2,5 kg", price: 1549.9 },
    ],
  },
  {
    slug: "bitter-kuvertur-cikolata-1-kg",
    name: "Bitter Kuvertür Çikolata 1 kg",
    description:
      "Yoğun kakao aromalı bitter kuvertür. Ganaj, mus ve kaplama uygulamalarına uygundur.",
    brand: PRO,
    categorySlug: "cikolata",
    weight: "1 kg",
    productType: "Kuvertür",
    price: 679.9,
    unit: "paket",
    isBestSeller: true,
    variants: [
      { name: "Gramaj", optionLabel: "1 kg", price: 679.9 },
      { name: "Gramaj", optionLabel: "2,5 kg", price: 1629.9 },
    ],
  },
  {
    slug: "beyaz-kuvertur-cikolata-500-g",
    name: "Beyaz Kuvertür Çikolata 500 g",
    description:
      "Renklendirmeye uygun beyaz kuvertür. Gıda boyası ile renklendirilerek drip ve süsleme çalışmalarında kullanılabilir.",
    brand: PRO,
    categorySlug: "cikolata",
    weight: "500 g",
    productType: "Kuvertür",
    price: 379.9,
    unit: "paket",
  },
  {
    slug: "damla-cikolata-1-kg",
    name: "Fırınlanabilir Damla Çikolata 1 kg",
    description:
      "Fırında şeklini koruyan damla çikolata. Kurabiye, muffin ve kek içi kullanımına uygundur.",
    brand: PRO,
    categorySlug: "cikolata",
    weight: "1 kg",
    productType: "Damla çikolata",
    price: 289.9,
    salePrice: 259.9,
    unit: "paket",
  },
  {
    slug: "kakao-tozu-500-g",
    name: "Alkalize Kakao Tozu 500 g",
    description:
      "Koyu renkli, yüksek çözünürlüklü alkalize kakao tozu. Kek, mus ve sıcak çikolata hazırlığında kullanılır.",
    brand: PRO,
    categorySlug: "cikolata",
    weight: "500 g",
    productType: "Kakao tozu",
    price: 219.9,
    unit: "paket",
    isNew: true,
  },

  // --- Krema ve Dolgu ---
  {
    slug: "krem-santi-tozu-1-kg",
    name: "Krem Şanti Tozu 1 kg",
    description:
      "Soğuk sütle çırpılarak hazırlanan krem şanti tozu. Yüksek hacim verir, sıkma işlemlerinde formunu korur.",
    brand: PRO,
    categorySlug: "krema-ve-dolgu",
    weight: "1 kg",
    productType: "Toz krema",
    price: 189.9,
    unit: "paket",
    isBestSeller: true,
    variants: [
      { name: "Gramaj", optionLabel: "150 g", price: 27.5 },
      { name: "Gramaj", optionLabel: "1 kg", price: 189.9 },
    ],
  },
  {
    slug: "pastaci-kremasi-1-kg",
    name: "Pastacı Kreması 1 kg",
    description:
      "Soğuk hazırlanan pastacı kreması tozu. Ekler, profiterol ve yaş pasta dolgularında kullanılır.",
    brand: PRO,
    categorySlug: "krema-ve-dolgu",
    weight: "1 kg",
    productType: "Toz krema",
    price: 209.9,
    unit: "paket",
  },
  {
    slug: "findik-kremasi-1-kg",
    name: "Fındık Kreması 1 kg",
    description:
      "Sürülebilir kıvamda fındık kreması. Kat arası dolgu ve iç harç olarak kullanılır.",
    brand: PRO,
    categorySlug: "krema-ve-dolgu",
    weight: "1 kg",
    productType: "Dolgu kreması",
    price: 329.9,
    unit: "kavanoz",
  },
  {
    slug: "meyve-dolgusu-visne-1-kg",
    name: "Vişne Dolgusu 1 kg",
    description:
      "Fırına dayanıklı vişne dolgusu. Turta, kurabiye ve pasta katlarında kullanılabilir.",
    brand: PRO,
    categorySlug: "krema-ve-dolgu",
    weight: "1 kg",
    productType: "Meyve dolgusu",
    price: 249.9,
    unit: "kavanoz",
    isNew: true,
  },
  {
    slug: "jelatin-yaprak-100-g",
    name: "Yaprak Jelatin 100 g",
    description:
      "Mus, cheesecake ve jöle uygulamaları için yaprak jelatin. Soğuk suda yumuşatılarak kullanılır.",
    brand: PRO,
    categorySlug: "krema-ve-dolgu",
    weight: "100 g",
    productType: "Kıvam verici",
    price: 149.9,
    unit: "paket",
  },

  // --- Şeker Hamuru ---
  {
    slug: "beyaz-seker-hamuru-1-kg",
    name: "Beyaz Şeker Hamuru 1 kg",
    description:
      "Esnek yapıda, çatlamaya dirençli beyaz şeker hamuru. Pasta kaplama ve figür çalışmalarına uygundur.",
    brand: PRO,
    categorySlug: "seker-hamuru",
    weight: "1 kg",
    productType: "Şeker hamuru",
    price: 89.9,
    unit: "paket",
    isBestSeller: true,
    variants: [
      { name: "Gramaj", optionLabel: "500 g", price: 54.9 },
      { name: "Gramaj", optionLabel: "1 kg", price: 89.9 },
      { name: "Gramaj", optionLabel: "2,5 kg", price: 199.9 },
    ],
  },
  {
    slug: "pembe-seker-hamuru-1-kg",
    name: "Pembe Şeker Hamuru 1 kg",
    description:
      "Kullanıma hazır renkli şeker hamuru. Açma ve kaplama işlemlerinde renk homojenliğini korur.",
    brand: PRO,
    categorySlug: "seker-hamuru",
    weight: "1 kg",
    productType: "Şeker hamuru",
    price: 99.9,
    unit: "paket",
  },
  {
    slug: "cicek-hamuru-500-g",
    name: "Çiçek Hamuru 500 g",
    description:
      "İnce açılabilen, hızlı kuruyan çiçek hamuru. Yaprak ve çiçek figürleri için kullanılır.",
    brand: PRO,
    categorySlug: "seker-hamuru",
    weight: "500 g",
    productType: "Çiçek hamuru",
    price: 129.9,
    unit: "paket",
  },
  {
    slug: "cmc-toz-100-g",
    name: "CMC Toz (Kıvam Artırıcı) 100 g",
    description:
      "Şeker hamurunu sertleştirmek ve yapıştırıcı hazırlamak için kullanılan CMC tozu.",
    brand: PRO,
    categorySlug: "seker-hamuru",
    weight: "100 g",
    productType: "Yardımcı malzeme",
    price: 79.9,
    unit: "paket",
  },

  // --- Kalıp ve Ekipman ---
  {
    slug: "duy-seti-12-li",
    name: "Duy Seti 12’li",
    description:
      "Paslanmaz çelik sıkma duyu seti. Yıldız, düz ve yaprak uçları içerir; bulaşık makinesinde yıkanabilir.",
    brand: PRO,
    categorySlug: "kalip-ve-ekipman",
    weight: "1 set",
    productType: "Sıkma duyu",
    price: 129.9,
    unit: "set",
    isBestSeller: true,
  },
  {
    slug: "silikon-kek-kalibi",
    name: "Silikon Kek Kalıbı 24 cm",
    description:
      "Yapışmaz silikon kek kalıbı. −40 °C ile 230 °C arasında kullanılabilir.",
    brand: HOBBY,
    categorySlug: "kalip-ve-ekipman",
    weight: "24 cm",
    productType: "Kalıp",
    price: 179.9,
    salePrice: 149.9,
    unit: "adet",
  },
  {
    slug: "pasta-altligi-30-cm",
    name: "Pasta Altlığı 30 cm",
    description:
      "Gıdaya uygun kaplamalı mukavva pasta altlığı. Taşıma sırasında pastanın formunu korur.",
    brand: HOBBY,
    categorySlug: "kalip-ve-ekipman",
    weight: "30 cm",
    productType: "Altlık",
    price: 34.9,
    unit: "adet",
    variants: [
      { name: "Çap", optionLabel: "25 cm", price: 27.9 },
      { name: "Çap", optionLabel: "30 cm", price: 34.9 },
      { name: "Çap", optionLabel: "35 cm", price: 42.9 },
    ],
  },
  {
    slug: "donen-pasta-tablasi",
    name: "Döner Pasta Tablası",
    description:
      "Rulmanlı döner tabla. Kaplama ve süsleme işlemlerinde pastanın rahat çevrilmesini sağlar.",
    brand: PRO,
    categorySlug: "kalip-ve-ekipman",
    weight: "28 cm",
    productType: "Ekipman",
    price: 449.9,
    unit: "adet",
    isNew: true,
  },
  {
    slug: "spatula-seti-3-lu",
    name: "Pasta Spatulası Seti 3’lü",
    description:
      "Düz ve açılı paslanmaz çelik spatula seti. Krema düzeltme ve kaplama işlerinde kullanılır.",
    brand: PRO,
    categorySlug: "kalip-ve-ekipman",
    weight: "1 set",
    productType: "El aleti",
    price: 219.9,
    unit: "set",
  },

  // --- Süsleme Ürünleri ---
  {
    slug: "renkli-pasta-susu-100-g",
    name: "Renkli Pasta Süsü 100 g",
    description:
      "Karışık renkli şeker süsleme. Pasta, kurabiye ve dondurma üzerine serpilerek kullanılır.",
    brand: HOBBY,
    categorySlug: "susleme-urunleri",
    weight: "100 g",
    productType: "Şeker süsleme",
    price: 19.9,
    unit: "kutu",
    isBestSeller: true,
  },
  {
    slug: "sprey-gida-boyasi-altin",
    name: "Sprey Gıda Boyası Altın",
    description:
      "Şeker hamuru ve çikolata yüzeylerde metalik görünüm veren sprey gıda boyası.",
    brand: HOBBY,
    categorySlug: "susleme-urunleri",
    weight: "100 ml",
    productType: "Sprey boya",
    price: 159.9,
    unit: "adet",
  },
  {
    slug: "yenilebilir-inci-50-g",
    name: "Yenilebilir İnci Süsleme 50 g",
    description:
      "Parlak yüzeyli şeker inci. Pasta kenarı ve cupcake süslemelerinde kullanılır.",
    brand: HOBBY,
    categorySlug: "susleme-urunleri",
    weight: "50 g",
    productType: "Şeker süsleme",
    price: 44.9,
    unit: "kutu",
  },
  {
    slug: "cikolata-yaprak-transfer-folyo",
    name: "Çikolata Transfer Folyosu",
    description:
      "Erimiş çikolata üzerine desen aktarmaya yarayan gıdaya uygun transfer folyosu.",
    brand: PRO,
    categorySlug: "susleme-urunleri",
    weight: "10 yaprak",
    productType: "Transfer folyo",
    price: 189.9,
    unit: "paket",
    isNew: true,
  },
  {
    slug: "pasta-mumu-set",
    name: "Pasta Mumu Seti",
    description: "Rakam ve düz mum içeren doğum günü mum seti.",
    brand: HOBBY,
    categorySlug: "susleme-urunleri",
    weight: "1 set",
    productType: "Mum",
    price: 29.9,
    unit: "set",
  },

  // --- Ambalaj Ürünleri ---
  {
    slug: "pasta-kutusu-30x30",
    name: "Pasta Kutusu 30×30 cm",
    description:
      "Pencereli, gıdaya uygun mukavva pasta kutusu. Taşımaya dayanıklı yapıdadır.",
    brand: HOBBY,
    categorySlug: "ambalaj-urunleri",
    weight: "30×30 cm",
    productType: "Kutu",
    price: 34.9,
    unit: "adet",
    isBestSeller: true,
    variants: [
      { name: "Ebat", optionLabel: "25×25 cm", price: 28.9 },
      { name: "Ebat", optionLabel: "30×30 cm", price: 34.9 },
      { name: "Ebat", optionLabel: "40×40 cm", price: 49.9 },
    ],
  },
  {
    slug: "seffaf-asetat-10-metre",
    name: "Şeffaf Asetat 10 metre",
    description:
      "Pasta kenarı ve mus kalıplarında kullanılan şeffaf asetat rulo. Kolay kesilir.",
    brand: PRO,
    categorySlug: "ambalaj-urunleri",
    weight: "10 m",
    productType: "Asetat",
    price: 119.9,
    unit: "rulo",
  },
  {
    slug: "kurabiye-poseti-100-lu",
    name: "Kurabiye Poşeti 100’lü",
    description:
      "Gıdaya uygun şeffaf kurabiye poşeti. Bağcık ayrı satılır.",
    brand: HOBBY,
    categorySlug: "ambalaj-urunleri",
    weight: "100 adet",
    productType: "Poşet",
    price: 79.9,
    unit: "paket",
  },
  {
    slug: "cupcake-kagidi-100-lu",
    name: "Cupcake Kağıdı 100’lü",
    description:
      "Fırına dayanıklı kağıt cupcake kapsülü. Standart muffin kalıplarına uygundur.",
    brand: HOBBY,
    categorySlug: "ambalaj-urunleri",
    weight: "100 adet",
    productType: "Kapsül",
    price: 49.9,
    unit: "paket",
  },

  // --- Gıda Boyaları ---
  {
    slug: "jel-gida-boyasi-kirmizi-30-g",
    name: "Jel Gıda Boyası Kırmızı 30 g",
    description:
      "Yoğun pigmentli jel gıda boyası. Az miktarda kullanımda dahi yüksek renk verir; kıvamı bozmaz.",
    brand: PRO,
    categorySlug: "gida-boyalari",
    weight: "30 g",
    productType: "Jel boya",
    price: 24.9,
    unit: "şişe",
    isBestSeller: true,
    variants: [
      { name: "Renk", optionLabel: "Kırmızı", price: 24.9 },
      { name: "Renk", optionLabel: "Siyah", price: 24.9 },
      { name: "Renk", optionLabel: "Kraliyet Mavisi", price: 26.9 },
    ],
  },
  {
    slug: "jel-gida-boyasi-siyah-20-g",
    name: "Jel Gıda Boyası Siyah 20 g",
    description:
      "Koyu tonlar için yüksek pigmentli siyah jel boya. Şeker hamuru ve kremada kullanılır.",
    brand: PRO,
    categorySlug: "gida-boyalari",
    weight: "20 g",
    productType: "Jel boya",
    price: 24.9,
    unit: "şişe",
  },
  {
    slug: "toz-gida-boyasi-seti-6-li",
    name: "Toz Gıda Boyası Seti 6’lı",
    description:
      "Makaron ve çikolata çalışmalarına uygun toz gıda boyası seti. Yağ bazlı uygulamalarda tercih edilir.",
    brand: PRO,
    categorySlug: "gida-boyalari",
    weight: "6 × 10 g",
    productType: "Toz boya",
    price: 189.9,
    unit: "set",
    isNew: true,
  },
  {
    slug: "sedefli-toz-boya-10-g",
    name: "Sedefli Toz Boya 10 g",
    description:
      "Şeker hamuru yüzeylerde sedef parlaklığı veren toz boya. Fırça ile kuru uygulanır.",
    brand: HOBBY,
    categorySlug: "gida-boyalari",
    weight: "10 g",
    productType: "Toz boya",
    price: 69.9,
    unit: "kutu",
  },
];
