import crypto from "node:crypto";
import { config, isProduction } from "@/lib/config";

export const SESSION_COOKIE = "pm_panel";
export const SESSION_HOURS = 8;

export type SessionPayload = { email: string; exp: number };

const sign = (value: string) =>
  crypto.createHmac("sha256", config.sessionSecret).update(value).digest("hex");

/** Üretim ortamında Secure zorunlu, her ortamda HttpOnly + SameSite=Lax. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
};

export function createSessionToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
    } satisfies SessionPayload),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token?: string): SessionPayload | null {
  // Secret tanımlı değilse hiçbir oturum geçerli sayılmaz.
  if (!token || !config.sessionSecret) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  // timingSafeEqual farklı uzunlukta buffer'da exception fırlatır.
  if (expected.length !== received.length) return null;
  if (!crypto.timingSafeEqual(expected, received)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as SessionPayload;
    if (typeof data?.exp !== "number" || data.exp <= Date.now()) return null;
    if (typeof data?.email !== "string" || !data.email) return null;
    return data;
  } catch {
    return null;
  }
}
