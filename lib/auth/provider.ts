import bcrypt from "bcryptjs";
import { logAdminAuthProblem, readAdminAuthConfig } from "@/lib/config";

/**
 * Kimlik doğrulama sağlayıcısı arayüzü.
 *
 * Bugün tek uygulama ENV + bcrypt hash'idir. Firebase Auth'a geçilirken
 * yalnızca bu dosyaya yeni bir sağlayıcı eklenir; panel arayüzü, session
 * katmanı ve route guard'ları değişmez.
 */
export type AdminIdentity = { email: string };

export interface AuthProvider {
  readonly name: string;
  /** Kimlik doğru ise kimlik bilgisi, değilse null döner. Hata detayı sızdırmaz. */
  verifyCredentials(email: string, password: string): Promise<AdminIdentity | null>;
}

/** ENV'de tutulan tek yönetici hesabı. Parola yalnızca bcrypt hash'i olarak bulunur. */
const envProvider: AuthProvider = {
  name: "env",
  async verifyCredentials(email, password) {
    // Yapılandırma HER denemede taze okunur.
    const auth = readAdminAuthConfig();

    if (!auth.configured) {
      // Değer içermeyen tanı kaydı; kullanıcıya ayrıntı gösterilmez.
      logAdminAuthProblem("giriş denemesi");
      return null;
    }

    const candidate = String(email ?? "").trim().toLowerCase();
    const secret = String(password ?? "");

    // E-posta yanlış olsa bile bcrypt karşılaştırmasını çalıştırarak
    // yanıt süresinden kullanıcı adı çıkarımını zorlaştırıyoruz.
    const matchesHash = await bcrypt.compare(secret, auth.passwordHash);
    if (candidate !== auth.email || !matchesHash) return null;

    return { email: auth.email };
  },
};

export function getAuthProvider(): AuthProvider {
  return envProvider;
}
