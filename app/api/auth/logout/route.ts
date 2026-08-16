import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

// bcrypt ve better-sqlite3 için Node.js runtime gerekir.
export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Çerez hem boşaltılır hem de süresi sıfırlanarak tamamen silinir.
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
