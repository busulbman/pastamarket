export type Variant = {
  id: number;
  name: string;
  optionLabel: string;
  price: number;
  sku?: string;
};

export type ProductImageAsset = { url: string; publicId?: string; width?: number; height?: number; bytes?: number };

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
  imageUrl?: string;
  imagePublicId?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageBytes?: number;
  imageAssets?: ProductImageAsset[];
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
