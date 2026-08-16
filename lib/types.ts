export type Variant = {
  id: number;
  name: string;
  optionLabel: string;
  price: number;
  sku?: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  brand: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  mainImage: string;
  images: string[];
  price: number;
  salePrice: number | null;
  unit: string;
  /** Gramaj / ölçü bilgisi (örn. "1 kg", "30 cm"). */
  weight: string;
  /** Ürün türü (örn. "Kuvertür", "Jel boya"). */
  productType: string;
  active: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  variants: Variant[];
};

export type Settings = Record<string, string>;
