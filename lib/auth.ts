import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { isProduction, readAdminAuthConfig } from "@/lib/config";

export const SESSION_COOKIE = "pm_panel";
const SESSION_HOURS = 8;
type Payload = { username: string; exp: number };

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeTextEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
};

export function createSessionToken(username: string) {
  const config = readAdminAuthConfig();
  const payload = Buffer.from(JSON.stringify({ username, exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000 } satisfies Payload)).toString("base64url");
  return `${payload}.${sign(payload, config.sessionSecret)}`;
}

export function readSessionToken(token?: string): Payload | null {
  const config = readAdminAuthConfig();
  if (!token || !config.configured) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, config.sessionSecret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString()) as Payload;
    return value.username && value.exp > Date.now() ? value : null;
  } catch { return null; }
}

export async function currentAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return readSessionToken(token);
}

export async function requireAdmin() { return Boolean(await currentAdmin()); }

export async function signIn(username: unknown, password: unknown) {
  const config = readAdminAuthConfig();
  if (!config.configured) return null;
  const submittedPassword = String(password ?? "");
  const passwordMatches = config.password.length > 0
    ? safeTextEqual(submittedPassword, config.password)
    : await bcrypt.compare(submittedPassword, config.passwordHash);
  const usernameMatches = safeTextEqual(String(username ?? "").trim(), config.username);
  return usernameMatches && passwordMatches ? { username: config.username } : null;
}
