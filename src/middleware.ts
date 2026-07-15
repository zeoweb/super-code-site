import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Middleware защищает приватные разделы. Работает на edge, поэтому
// проверяем JWT напрямую через jose (без обращения к БД / next/headers).

const SESSION_COOKIE = "sc_session";

// Разделы, требующие входа. /lessons сюда не входит: конкретный урок может
// быть бесплатным и открытым без регистрации — проверка тарифа и доступа
// для остальных уроков происходит на уровне самой страницы урока.
const PROTECTED = [
  "/dashboard",
  "/courses",
  "/billing",
  "/profile",
  "/admin",
  "/leaderboard",
  "/support",
  "/ai",
  "/quiz",
  "/community",
];
// Разделы только для админа
const ADMIN_ONLY = ["/admin"];

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Пробрасываем текущий путь в заголовке — серверные layout'ы (например,
  // общий layout личного кабинета) не имеют доступа к pathname напрямую.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!needsAuth) return NextResponse.next({ request: { headers: requestHeaders } });

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
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/lessons/:path*",
    "/billing/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/leaderboard/:path*",
    "/support/:path*",
    "/ai/:path*",
    "/quiz/:path*",
    "/community/:path*",
  ],
};
