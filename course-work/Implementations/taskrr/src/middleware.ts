import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const excludedRoutes = new Set([
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/register',
]);

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!excludedRoutes.has(req.nextUrl.pathname) && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
