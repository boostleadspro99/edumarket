import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/client', '/seller', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // In a real app, you'd check for auth token/session here
    // For now, we'll allow access but in production you'd redirect to login
    // const token = request.cookies.get('auth-token');
    // if (!token) {
    //   return NextResponse.redirect(new URL('/auth/login', request.url));
    // }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/client/:path*', '/seller/:path*', '/admin/:path*']
};