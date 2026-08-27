"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { uploadCloudinary, validateClientImage } from "@/lib/cloudinary-client";
import { matchProductImage, type ImageMatchProduct } from "@/lib/product-image-match";

type ProductTarget = ImageMatchProduct & {
  active: boolean;
  imageUrl: string;
  imagePublicId: string;
};

type AssignmentState = "hazir" | "yukleniyor" | "basarili" | "hatali";
type Assignment = {
  id: string;
  file: File;
  previewUrl: string;
  productId?: number;
  match: "exact" | "suggested" | "none";
  suggestedProductId?: number;
  replaceConfirmed: boolean;
  state: AssignmentState;
  error?: string;
  cleanupWarning?: string;
};

const hasImage = (value: string) => Boolean(value && !value.includes("product-placeholder"));

export function ExistingProductImageBulk({ imageProvider }: { imageProvider: string }) {
  const [products, setProducts] = useState<ProductTarget[]>([]);
  const [productsError, setProductsError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [onlyWithoutImage, setOnlyWithoutImage] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searches, setSearches] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const previewUrls = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const response = await fetch("/api/panel/products/list", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(data.products)) throw new Error(data.error || "Ürün listesi alınamadı.");
        if (!cancelled) setProducts(data.products);
      } catch (error) {
        if (!cancelled) setProductsError(error instanceof Error ? error.message : "Ürün listesi alınamadı.");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const selectionCounts = useMemo(() => {
    const counts = new Map<number, number>();
    assignments.forEach((assignment) => {
      if (assignment.productId) counts.set(assignment.productId, (counts.get(assignment.productId) ?? 0) + 1);
    });
    return counts;
  }, [assignments]);
  const activeUploads = assignments.some((assignment) => assignment.state === "yukleniyor");
  const completed = assignments.filter((assignment) => assignment.state === "basarili").length;
  const failed = assignments.filter((assignment) => assignment.state === "hatali").length;

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!activeUploads) return;
      event.preventDefault();
      event.returnValue = "";
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [activeUploads]);

  function addFiles(files: FileList | File[] | null) {
    if (!files || !products.length) return;
    const next = Array.from(files).map((file, index): Assignment => {
      const error = validateClientImage(file);
      const match = matchProductImage(file.name, products);
      const selected = match.kind === "exact" ? productById.get(match.product.id) : undefined;
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return {
        id: `${Date.now()}-${index}-${file.name}-${file.lastModified}`,
        file,
        previewUrl,
        productId: selected?.id,
        match: match.kind,
        suggestedProductId: match.kind === "suggested" ? match.product.id : undefined,
        replaceConfirmed: selected ? !hasImage(selected.imageUrl) : false,
        state: error ? "hatali" : "hazir",
        error: error ?? undefined,
      };
    });
    setAssignments((current) => [...current, ...next]);
    setMessage("");
  }

  function chooseProduct(assignmentId: string, value: string) {
    const product = productById.get(Number(value));
    setAssignments((current) => current.map((assignment) => assignment.id === assignmentId
      ? {
          ...assignment,
          productId: product?.id,
          match: product ? "none" : assignment.match,
          replaceConfirmed: product ? !hasImage(product.imageUrl) : false,
          error: assignment.state === "hatali" && assignment.productId ? undefined : assignment.error,
          state: assignment.state === "hatali" && assignment.productId ? "hazir" : assignment.state,
        }
      : assignment));
  }

  function acceptSuggestion(assignmentId: string) {
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (!assignment?.suggestedProductId) return;
    chooseProduct(assignmentId, String(assignment.suggestedProductId));
  }

  function setReplacementConfirmed(assignmentId: string, value: boolean) {
    setAssignments((current) => current.map((assignment) => assignment.id === assignmentId ? { ...assignment, replaceConfirmed: value } : assignment));
  }

  function issueFor(assignment: Assignment) {
    const product = assignment.productId ? productById.get(assignment.productId) : undefined;
    if (!product) return "Ürün seçilmedi; bu görsel yüklenmeyecek.";
    if ((selectionCounts.get(product.id) ?? 0) > 1) return "Bu ürüne birden fazla görsel atandı. Yükleme engellendi.";
    if (hasImage(product.imageUrl) && !assignment.replaceConfirmed) return "Mevcut görseli değiştirmeyi onaylayın.";
    return null;
  }

  async function deleteCloudinaryImage(publicId: string) {
    const response = await fetch("/api/panel/images/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });
    return response.ok;
  }

  async function uploadSelected(ids?: string[]) {
    if (imageProvider !== "cloudinary") {
      setMessage("Bu bölüm için IMAGE_PROVIDER=cloudinary yapılandırılmalıdır.");
      return;
    }

    const candidates = assignments.filter((assignment) =>
      (!ids || ids.includes(assignment.id))
      && (assignment.state === "hazir" || assignment.state === "hatali")
      && !issueFor(assignment),
    );
    if (!candidates.length) {
      setMessage("Yüklenecek görsel yok. Ürün seçimini, çakışmaları ve değiştirme onaylarını kontrol edin.");
      return;
    }

    let nextIndex = 0;
    async function worker() {
      while (nextIndex < candidates.length) {
        const assignment = candidates[nextIndex++];
        const product = assignment.productId ? productById.get(assignment.productId) : undefined;
        if (!product) continue;
        setAssignments((current) => current.map((item) => item.id === assignment.id ? { ...item, state: "yukleniyor", error: undefined, cleanupWarning: undefined } : item));
        let uploaded: Awaited<ReturnType<typeof uploadCloudinary>> | undefined;
        try {
          uploaded = await uploadCloudinary(assignment.file, product.slug);
          const response = await fetch("/api/panel/images/attach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: product.slug, ...uploaded }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "Görsel ürüne bağlanamadı.");

          let cleanupWarning: string | undefined;
          if (data.oldPublicId && data.oldPublicId !== uploaded.publicId) {
            const deleted = await deleteCloudinaryImage(data.oldPublicId);
            if (!deleted) cleanupWarning = "Yeni görsel bağlandı; önceki Cloudinary görseli silinemedi.";
          }
          setAssignments((current) => current.map((item) => item.id === assignment.id ? { ...item, state: "basarili", cleanupWarning } : item));
        } catch (error) {
          if (uploaded) await deleteCloudinaryImage(uploaded.publicId).catch(() => false);
          setAssignments((current) => current.map((item) => item.id === assignment.id ? { ...item, state: "hatali", error: error instanceof Error ? error.message : "Yükleme başarısız." } : item));
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(4, candidates.length) }, worker));
  }

  function filteredProducts(assignment: Assignment) {
    const query = (searches[assignment.id] ?? "").toLocaleLowerCase("tr-TR").trim();
    const selected = assignment.productId ? productById.get(assignment.productId) : undefined;
    return products.filter((product) => {
      if (onlyWithoutImage && hasImage(product.imageUrl) && product.id !== selected?.id) return false;
      return !query || `${product.name} ${product.slug}`.toLocaleLowerCase("tr-TR").includes(query);
    });
  }

  return (
    <section className="card p-5">
      <h2 className="text-lg font-bold text-ink">3. Mevcut Ürünlere Toplu Görsel Ekle</h2>
      <p className="mt-1 text-sm text-muted">Bu bölüm yeni ürün oluşturmaz veya ürün bilgilerini değiştirmez; yalnızca seçilen mevcut Firestore ürününe Cloudinary görseli bağlar.</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink"><input type="checkbox" checked={onlyWithoutImage} onChange={(event) => setOnlyWithoutImage(event.target.checked)}/> Sadece görseli olmayan ürünleri göster</label>
        <span className="text-xs text-muted">{loadingProducts ? "Ürünler yükleniyor…" : `${products.length} aktif/pasif ürün yüklendi`}</span>
      </div>

      {productsError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{productsError}</p>}
      <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }} className={`mt-4 rounded-xl border-2 border-dashed p-8 text-center ${dragging ? "border-brand bg-brand-soft" : "border-line"}`}>
        <label className="cursor-pointer text-sm font-bold text-brand"><input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={loadingProducts || Boolean(productsError)} onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} className="sr-only"/>Görselleri buraya bırakın veya seçin</label>
        <p className="mt-2 text-xs text-muted">JPG, PNG veya WebP · dosya başına en fazla 10 MB · aynı anda en fazla 4 yükleme</p>
      </div>

      {assignments.length > 0 && <>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-soft p-3 text-sm"><span><b>{completed} / {assignments.length}</b> yüklendi · <span className="text-emerald-700">{completed} başarılı</span> · <span className="text-rose-600">{failed} hatalı</span></span><button type="button" disabled={activeUploads} onClick={() => uploadSelected()} className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{activeUploads ? "Yükleniyor…" : "Seçili görselleri yükle"}</button></div>
        {message && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <div className="mt-4 space-y-4">{assignments.map((assignment) => {
          const product = assignment.productId ? productById.get(assignment.productId) : undefined;
          const issue = issueFor(assignment);
          const options = filteredProducts(assignment);
          return <article key={assignment.id} className="grid gap-4 rounded-xl border border-line p-3 sm:grid-cols-[96px_1fr]">
            {/* Object URL yalnızca kullanıcı seçtiği dosyanın yerel önizlemesi için kullanılır. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assignment.previewUrl} alt="Seçilen görsel önizlemesi" className="h-24 w-24 rounded-lg border border-line bg-brand-soft object-contain" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="truncate text-sm font-bold text-ink">{assignment.file.name}</p><p className="mt-1 text-xs text-muted">{assignment.match === "exact" ? "Tam eşleşme ile ürün otomatik seçildi." : assignment.match === "suggested" ? "Yakın eşleşme bulundu; yüklemeden önce onaylayın." : "Otomatik eşleşme bulunamadı; ürün seçin."}</p></div><span className={assignment.state === "basarili" ? "text-xs font-bold text-emerald-700" : assignment.state === "hatali" ? "text-xs font-bold text-rose-600" : "text-xs font-bold text-muted"}>{assignment.state === "hazir" ? "Hazır" : assignment.state === "yukleniyor" ? "Yükleniyor…" : assignment.state === "basarili" ? "Başarılı" : "Hatalı"}</span></div>
              {assignment.match === "suggested" && assignment.suggestedProductId && <button type="button" onClick={() => acceptSuggestion(assignment.id)} className="mt-2 text-xs font-bold text-brand">Önerilen ürünü seç: {productById.get(assignment.suggestedProductId)?.name}</button>}
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><input type="search" value={searches[assignment.id] ?? ""} onChange={(event) => setSearches((current) => ({ ...current, [assignment.id]: event.target.value }))} placeholder="Ürün ara…" className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"/><select value={assignment.productId ?? ""} onChange={(event) => chooseProduct(assignment.id, event.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"><option value="">Ürün seçin</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name} · {option.slug} · {option.active ? "Aktif" : "Pasif"}{hasImage(option.imageUrl) ? " · Görsel var" : ""}</option>)}</select></div>
              {product && hasImage(product.imageUrl) && <label className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900"><input type="checkbox" checked={assignment.replaceConfirmed} onChange={(event) => setReplacementConfirmed(assignment.id, event.target.checked)} className="mt-0.5"/> <span><b>Mevcut görsel var.</b> Bu üründeki görseli değiştirmeyi onaylıyorum.</span></label>}
              {issue && <p className="mt-2 text-xs font-semibold text-rose-600">{issue}</p>}
              {assignment.error && <p className="mt-2 text-xs text-rose-600">{assignment.error}</p>}
              {assignment.cleanupWarning && <p className="mt-2 text-xs text-amber-800">{assignment.cleanupWarning}</p>}
              {assignment.state === "hatali" && assignment.productId && !issue && <button type="button" disabled={activeUploads} onClick={() => uploadSelected([assignment.id])} className="mt-2 text-xs font-bold text-brand">Yeniden dene</button>}
            </div>
          </article>;
        })}</div>
      </>}
    </section>
  );
}
