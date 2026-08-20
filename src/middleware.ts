import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  PROMOTER_COOKIE,
  REF_COOKIE,
  verifySessionToken,
  verifyPromoterToken,
} from "@/lib/auth/session";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const res = NextResponse.next();

  // 1) Capturar referido de promotor (?ref=CODE) en una cookie persistente
  const ref = searchParams.get("ref");
  if (ref && /^[A-Za-z0-9_-]{2,40}$/.test(ref)) {
    res.cookies.set(REF_COOKIE, ref.toUpperCase(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  // 2) Zona ADMIN / PUERTA (sesión de staff)
  const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isDoor = pathname.startsWith("/puerta") && pathname !== "/puerta/login";
  if (isAdmin || isDoor) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3) Zona PROMOTOR
  if (pathname.startsWith("/promotor") && pathname !== "/promotor/login") {
    const token = req.cookies.get(PROMOTER_COOKIE)?.value;
    const p = token ? await verifyPromoterToken(token) : null;
    if (!p) {
      const url = req.nextUrl.clone();
      url.pathname = "/promotor/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  // Corre en todo el sitio menos assets/estáticos y api
  matcher: ["/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|brand/|uploads/|.*\\.).*)"],
};
