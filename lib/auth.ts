import { cookies } from "next/headers";
import { adminAuthConfigured } from "@/lib/config";
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
 * Giriş denemesi. Hatalı denemede ayrıntı verilmez; ENV eksikse de
 * aynı genel mesaj döner (yapılandırma bilgisi sızdırılmaz).
 */
export async function signIn(email: unknown, password: unknown) {
  if (!adminAuthConfigured()) return null;
  return getAuthProvider().verifyCredentials(String(email ?? ""), String(password ?? ""));
}

export { adminAuthConfigured };
