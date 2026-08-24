import { PRODUCT_PLACEHOLDER } from "@/lib/image-paths";

const cloudinary = (src?: string | null) => Boolean(src && /^https:\/\/res\.cloudinary\.com\//i.test(src));
const transform = (src: string, value: string) => cloudinary(src) ? src.replace("/image/upload/", `/image/upload/${value}/`) : src || PRODUCT_PLACEHOLDER;
export const productCardImageUrl = (src?: string | null) => transform(src || PRODUCT_PLACEHOLDER, "c_pad,w_500,h_500,b_white/f_auto/q_auto");
export const productDetailImageUrl = (src?: string | null) => transform(src || PRODUCT_PLACEHOLDER, "c_limit,w_1200,h_1200/f_auto/q_auto");
