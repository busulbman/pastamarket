import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { blockDemoWrite } from "@/lib/demo-guard";

/**
 * Panel API'leri için ortak yardımcılar.
 * Her route oturumu ayrıca doğrular; layout kontrolüne güvenilmez.
 */

export const unauthorized = () =>
  NextResponse.json({ error: "Bu işlem için giriş yapmalısınız." }, { status: 401 });

export const badRequest = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

/** Oturum yoksa 401 döner; varsa null döner ve akış devam eder. */
export async function guard() {
  return (await requireAdmin()) ? null : unauthorized();
}

/**
 * Yazma işlemleri için kontrol: önce oturum, sonra demo kilidi.
 * Canlı demoda (DEMO_READ_ONLY=true) 403 ve Türkçe uyarı döner.
 */
export async function guardWrite() {
  const denied = await guard();
  if (denied) return denied;
  return blockDemoWrite();
}

/** Gövdeyi güvenle JSON olarak okur. */
export async function readJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}
