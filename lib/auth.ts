import { cookies } from "next/headers";
import { adminAuthConfigured, readAdminAuthConfig } from "@/lib/config";
import { getAuthProvider, type AdminIdentity } from "@/lib/auth/provider";
import {
  createSessionToken,
  readSessionToken,
  SESSION_COOKIE,
  SESSION_HOURS,
  sessionCookieOptions,
} from "@/lib/auth/session";

export {
  SESSION_COOKIE,
  SESSION_HOURS,
  sessionCookieOptions,
  createSessionToken,
  readSessionToken,
  adminAuthConfigured,
  readAdminAuthConfig,
};
export type { AdminIdentity };

/** Geçerli oturumun kimliği; oturum yoksa null. */
export async function currentAdmin(): Promise<AdminIdentity | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = readSessionToken(token);
  return session ? { email: session.email } : null;
}

/** Panel sayfaları ve admin API route'ları için oturum kontrolü. */
export async function requireAdmin() {
  return (await currentAdmin()) !== null;
}

/**
 * Giriş denemesi.
 *
 * Yapılandırma eksik olsa bile aynı genel hata döner; kullanıcıya sistem
 * bilgisi sızdırılmaz. Sebep yalnızca sunucu günlüğüne (değersiz) yazılır.
 */
export async function signIn(email: unknown, password: unknown) {
  return getAuthProvider().verifyCredentials(String(email ?? ""), String(password ?? ""));
}
