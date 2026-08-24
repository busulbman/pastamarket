import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, signIn } from "@/lib/auth";
import { readJson } from "@/lib/panel-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJson(request) as { username?: unknown; password?: unknown } | null;
  const identity = await signIn(body?.username, body?.password);
  if (!identity) return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(identity.username), sessionCookieOptions);
  return response;
}
