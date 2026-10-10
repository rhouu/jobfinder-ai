import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "jobfinder-ai-secure-jwt-secret-key-production-min-32-chars-2026"
);

// Public paths that anonymous visitors can access without account
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow static files, Next.js internal files, favicon, images, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Allow landing page, login and register pages, and privacy policy
  if (
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/privacy"
  ) {
    return NextResponse.next();
  }

  // 3. For all other pages and APIs (/jobs, /jobs/[id], /companies, /dashboard, /employer, /admin, /api/jobs, /api/chat, etc.)
  const token = req.cookies.get("jobfinder_token")?.value;

  if (!token) {
    // If it's an API route, return 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Veuillez vous inscrire ou vous connecter pour accéder à ces fonctionnalités." },
        { status: 401 }
      );
    }

    // If it's a page route, redirect to registration page with return URL
    const registerUrl = new URL("/auth/register", req.url);
    registerUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(registerUrl);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Invalid or expired token -> clear and redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Session expirée. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    const registerUrl = new URL("/auth/register", req.url);
    registerUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(registerUrl);
    response.cookies.delete("jobfinder_token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
