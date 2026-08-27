export type ImageMatchProduct = {
  id: number;
  name: string;
  slug: string;
};

export type ProductImageMatch =
  | { kind: "exact"; product: ImageMatchProduct }
  | { kind: "suggested"; product: ImageMatchProduct; score: number }
  | { kind: "none" };

/** Dosya adı ve katalog verisinde aynı, Türkçe-karakter duyarsız anahtarı üretir. */
export function imageMatchKey(value: string) {
  return value
    .replace(/\.[^.]+$/, "")
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function distance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    let previous = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      const current = row[rightIndex];
      row[rightIndex] = Math.min(
        row[rightIndex] + 1,
        row[rightIndex - 1] + 1,
        previous + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return row[right.length];
}

function similarity(left: string, right: string) {
  const size = Math.max(left.length, right.length);
  return size ? 1 - distance(left, right) / size : 0;
}

export function matchProductImage(fileName: string, products: ImageMatchProduct[]): ProductImageMatch {
  const fileKey = imageMatchKey(fileName);
  if (!fileKey) return { kind: "none" };

  const exact = products.filter((product) => imageMatchKey(product.slug) === fileKey || imageMatchKey(product.name) === fileKey);
  if (exact.length === 1) return { kind: "exact", product: exact[0] };
  if (exact.length > 1) return { kind: "none" };

  const closest = products
    .flatMap((product) => [imageMatchKey(product.slug), imageMatchKey(product.name)].map((key) => ({ product, score: similarity(fileKey, key) })))
    .sort((left, right) => right.score - left.score)[0];

  return closest && fileKey.length >= 5 && closest.score >= 0.78
    ? { kind: "suggested", product: closest.product, score: closest.score }
    : { kind: "none" };
}
