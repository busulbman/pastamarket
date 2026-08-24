import "server-only";

export type DataProviderName = "json" | "firestore";
export type ImageProviderName = "local" | "imgbb" | "cloudinary";

const normalize = (value: string | undefined) =>
  (value ?? "").trim().replace(/\\\$/g, "$");

export const config = {
  dataProvider: (normalize(process.env.DATA_PROVIDER) || "json") as DataProviderName,
  imageProvider: (normalize(process.env.IMAGE_PROVIDER) || "local") as ImageProviderName,
};

export const isProduction = process.env.NODE_ENV === "production";
export const MIN_SESSION_SECRET_LENGTH = 32;

const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export type AdminAuthConfig = {
  username: string;
  password: string;
  passwordHash: string;
  sessionSecret: string;
  configured: boolean;
};

export function readAdminAuthConfig(): AdminAuthConfig {
  const username = normalize(process.env.ADMIN_USERNAME);
  // Düz parola boşluk içerebileceği için trim/normalize edilmez.
  const password = process.env.ADMIN_PASSWORD ?? "";
  const passwordHash = normalize(process.env.ADMIN_PASSWORD_HASH);
  const sessionSecret = normalize(process.env.ADMIN_SESSION_SECRET);
  return {
    username,
    password,
    passwordHash,
    sessionSecret,
    configured:
      username.length > 0 &&
      (password.length > 0 || BCRYPT_PATTERN.test(passwordHash)) &&
      sessionSecret.length >= MIN_SESSION_SECRET_LENGTH,
  };
}

export type FirebaseConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

export function readFirebaseConfig(): FirebaseConfig | null {
  const projectId = normalize(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = normalize(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = normalize(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n");
  return projectId && clientEmail && privateKey ? { projectId, clientEmail, privateKey } : null;
}

export function readImgBBApiKey() {
  return normalize(process.env.IMGBB_API_KEY) || null;
}

export type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

export function readCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = normalize(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = normalize(process.env.CLOUDINARY_API_KEY);
  const apiSecret = normalize(process.env.CLOUDINARY_API_SECRET);
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}
