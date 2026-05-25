import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set(['/', '/login', '/register', '/about', '/cart']);
const PUBLIC_PREFIXES = ['/products'];
const AUTH_PREFIXES = ['/login', '/register'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Auth is per-tab (sessionStorage + Bearer). Client layouts guard protected routes.
  // Legacy cookie from Google OAuth: skip login page if already signed in that tab's flow.
  const legacyCookie = request.cookies.get('access_token')?.value;
  if (legacyCookie && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
