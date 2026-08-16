import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, signIn } from "@/lib/auth";
import { readJson } from "@/lib/panel-api";

// bcrypt ve better-sqlite3 için Node.js runtime gerekir.
export const runtime = "nodejs";

/** Hatalı girişte her koşulda aynı genel mesaj döner; sistem bilgisi sızdırılmaz. */
const GENERIC_ERROR = "E-posta veya parola hatalı.";

export async function POST(request: Request) {
  const body = (await readJson(request)) as
    | { email?: unknown; password?: unknown }
    | null;

  const identity = await signIn(body?.email, body?.password);
  if (!identity) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(identity.email),
    sessionCookieOptions,
  );
  return response;
}
