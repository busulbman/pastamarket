/**
 * Ortam yapılandırması tek yerden okunur.
 *
 * Sağlayıcı adları (DATA_PROVIDER / IMAGE_PROVIDER) ileride Firestore ve ImgBB
 * eklendiğinde genişletilecek olan seçim noktalarıdır. Bugün yalnızca "sqlite"
 * ve "local" desteklenir.
 */

export const isProduction = process.env.NODE_ENV === "production";

/**
 * Canlı demo (Netlify) modu.
 *
 * true iken veritabanı salt-okunur açılır, hiçbir açılış yazımı (migration,
 * seed, upsert) çalışmaz ve tüm yazma uçları kapatılır. Yerel geliştirmede
 * tanımsızdır; mevcut yazma özellikleri aynen çalışır.
 */
export const demoReadOnly = process.env.DEMO_READ_ONLY === "true";

export const config = {
  demoMode: process.env.DEMO_MODE !== "false",
  demoReadOnly,
  dataProvider: (process.env.DATA_PROVIDER || "sqlite") as "sqlite",
  imageProvider: (process.env.IMAGE_PROVIDER || "local") as "local",
  sqlitePath: process.env.SQLITE_DATABASE_PATH || process.env.DATABASE_PATH || "./data/pastamarket.db",
  uploadDir: process.env.LOCAL_UPLOAD_DIR || "./public/uploads",
  adminEmail: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
  adminPasswordHash: (process.env.ADMIN_PASSWORD_HASH || "").trim(),
  sessionSecret: (process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || "").trim(),
};

/** Geçerli bir bcrypt hash'i mi? ($2a/$2b/$2y + maliyet + 53 karakter) */
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export const adminPasswordHashValid = BCRYPT_PATTERN.test(config.adminPasswordHash);

/**
 * Panel girişinin açılabilmesi için gereken değerler tanımlı mı?
 * Eksikse giriş reddedilir; hiçbir zaman varsayılan bir parolaya düşülmez.
 */
export function adminAuthConfigured() {
  return Boolean(
    config.adminEmail && adminPasswordHashValid && config.sessionSecret.length >= 16,
  );
}

/** Eksik veya bozuk ENV anahtarlarının adları. Değerler asla döndürülmez. */
export function missingAuthEnvKeys() {
  const missing: string[] = [];
  if (!config.adminEmail) missing.push("ADMIN_EMAIL");
  if (!config.adminPasswordHash) missing.push("ADMIN_PASSWORD_HASH");
  else if (!adminPasswordHashValid) missing.push("ADMIN_PASSWORD_HASH (biçim geçersiz)");
  if (config.sessionSecret.length < 16) missing.push("ADMIN_SESSION_SECRET");
  return missing;
}

// bcrypt hash'i "$" içerir; .env dosyasında kaçırılmazsa dotenv genişletmesi
// değeri bozar ("$2b" bir değişken sanılır). Sessizce "parola hatalı" demek
// yerine sunucu günlüğünde nedeni açıkça belirtiyoruz.
if (config.adminPasswordHash && !adminPasswordHashValid) {
  console.error(
    "[PastaMarket] ADMIN_PASSWORD_HASH geçerli bir bcrypt hash'i değil. " +
      "Değerdeki $ karakterlerini \\$ olarak kaçırın: ADMIN_PASSWORD_HASH='\\$2b\\$12\\$...' " +
      "(npm run admin:create-password bunu otomatik yapar).",
  );
}
