import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Middleware защищает приватные разделы. Работает на edge, поэтому
// проверяем JWT напрямую через jose (без обращения к БД / next/headers).

const SESSION_COOKIE = "sc_session";

// Разделы, требующие входа. /games (каталог и карточка игры) сюда не
// входит — витрина публичная, вход нужен только на моменте покупки.
const PROTECTED = ["/topup", "/profile", "/admin", "/support", "/history", "/bonus-codes"];
// Разделы только для админа
const ADMIN_ONLY = ["/admin"];

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;

  let payload: { sub?: string; role?: string } | null = null;
  if (token) {
    try {
      const verified = await jwtVerify(token, secretKey());
      payload = verified.payload as { sub?: string; role?: string };
    } catch {
      payload = null;
    }
  }

  // Не залогинен → на страницу входа с returnTo
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  // Проверка админских разделов
  const isAdminArea = ADMIN_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isAdminArea && payload.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/topup/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/support/:path*",
    "/history/:path*",
    "/bonus-codes/:path*",
  ],
};
