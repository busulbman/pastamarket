/**
 * Ortam yapılandırması.
 *
 * ÖNEMLİ: Yönetici kimlik değerleri (ADMIN_*) modül seviyesinde okunmaz.
 * Modül seviyesinde okunursa değer süreç ömrü boyunca donar ve build
 * sırasında hesaplanan sonuç çalışma zamanına taşınabilir. Bu değerler
 * her istekte readAdminAuthConfig() ile taze okunur.
 */

export const isProduction = process.env.NODE_ENV === "production";

/**
 * Canlı demo (Netlify) modu.
 *
 * true iken veritabanı salt-okunur açılır, hiçbir açılış yazımı (migration,
 * seed, upsert) çalışmaz ve yazma uçları kapatılır.
 * Panel GİRİŞİNİ engellemez — yalnızca yazma işlemlerini kapatır.
 */
export const demoReadOnly = process.env.DEMO_READ_ONLY === "true";

export const config = {
  demoMode: process.env.DEMO_MODE !== "false",
  demoReadOnly,
  /**
   * "sqlite" → yerel geliştirme (better-sqlite3)
   * "json"   → Netlify demo (data/demo-catalog.json, native modül yok)
   */
  dataProvider: (process.env.DATA_PROVIDER || "sqlite") as "sqlite" | "json",
  imageProvider: (process.env.IMAGE_PROVIDER || "local") as "local",
  sqlitePath:
    process.env.SQLITE_DATABASE_PATH || process.env.DATABASE_PATH || "./data/pastamarket.db",
  uploadDir: process.env.LOCAL_UPLOAD_DIR || "./public/uploads",
};

/** Oturum anahtarı için kabul edilen en kısa uzunluk. */
export const MIN_SESSION_SECRET_LENGTH = 16;

/** bcrypt hash biçimi: $2a$ / $2b$ / $2y$ + maliyet + 53 karakter = toplam 60. */
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const BCRYPT_LENGTH = 60;

/**
 * Panolardan kopyala-yapıştır sırasında değere karışabilen sarmalayıcıları temizler:
 *  - baştaki/sondaki boşluk
 *  - değeri saran tek/çift tırnak (.env satırından kopyalanmışsa)
 *  - \$ kaçışları (.env dosyaları için gereklidir, Netlify arayüzü için değil)
 */
export function normalizeEnvValue(raw: string | undefined | null) {
  let value = (raw ?? "").trim();

  const quoted =
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")));
  if (quoted) value = value.slice(1, -1).trim();

  return value.replace(/\\\$/g, "$");
}

export type AdminAuthConfig = {
  email: string;
  passwordHash: string;
  sessionSecret: string;
  hasEmail: boolean;
  hasPasswordHash: boolean;
  passwordHashLength: number;
  passwordHashValid: boolean;
  hasSessionSecret: boolean;
  sessionSecretLength: number;
  sessionSecretValid: boolean;
  configured: boolean;
  /** Eksik/geçersiz anahtar ADLARI. Değerler asla yer almaz. */
  missing: string[];
};

/**
 * Yönetici kimlik yapılandırmasını ÇALIŞMA ZAMANINDA okur.
 * Her çağrıda process.env yeniden okunur; hiçbir sonuç önbelleğe alınmaz.
 */
export function readAdminAuthConfig(): AdminAuthConfig {
  const email = normalizeEnvValue(process.env.ADMIN_EMAIL).toLowerCase();
  const passwordHash = normalizeEnvValue(process.env.ADMIN_PASSWORD_HASH);
  const sessionSecret = normalizeEnvValue(
    process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET,
  );

  const hasEmail = email.length > 0;
  const hasPasswordHash = passwordHash.length > 0;
  const passwordHashValid =
    passwordHash.length === BCRYPT_LENGTH && BCRYPT_PATTERN.test(passwordHash);
  const hasSessionSecret = sessionSecret.length > 0;
  const sessionSecretValid = sessionSecret.length >= MIN_SESSION_SECRET_LENGTH;

  const missing: string[] = [];
  if (!hasEmail) missing.push("ADMIN_EMAIL");
  if (!hasPasswordHash) missing.push("ADMIN_PASSWORD_HASH");
  else if (!passwordHashValid) missing.push("ADMIN_PASSWORD_HASH (biçim geçersiz)");
  if (!hasSessionSecret) missing.push("ADMIN_SESSION_SECRET");
  else if (!sessionSecretValid) missing.push("ADMIN_SESSION_SECRET (çok kısa)");

  return {
    email,
    passwordHash,
    sessionSecret,
    hasEmail,
    hasPasswordHash,
    passwordHashLength: passwordHash.length,
    passwordHashValid,
    hasSessionSecret,
    sessionSecretLength: sessionSecret.length,
    sessionSecretValid,
    configured: hasEmail && passwordHashValid && sessionSecretValid,
    missing,
  };
}

/** Panel girişi açılabilir mi? Her çağrıda taze değerlendirilir. */
export function adminAuthConfigured() {
  return readAdminAuthConfig().configured;
}

/** Eksik/geçersiz ENV anahtarlarının adları. Değerler asla döndürülmez. */
export function missingAuthEnvKeys() {
  return readAdminAuthConfig().missing;
}

/**
 * Yapılandırma eksikse sunucu günlüğüne DEĞER İÇERMEYEN bir özet yazar.
 * Netlify gibi ortamlarda sorunu teşhis etmenin tek güvenli yoludur.
 */
export function logAdminAuthProblem(context: string) {
  const auth = readAdminAuthConfig();
  if (auth.configured) return;

  console.error(
    `[PastaMarket] Panel kimlik yapılandırması eksik (${context}):`,
    JSON.stringify({
      hasAdminEmail: auth.hasEmail,
      hasPasswordHash: auth.hasPasswordHash,
      passwordHashLength: auth.passwordHashLength,
      passwordHashValid: auth.passwordHashValid,
      hasSessionSecret: auth.hasSessionSecret,
      sessionSecretLength: auth.sessionSecretLength,
      missing: auth.missing,
    }),
  );
}
