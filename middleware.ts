import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('abhay_session')?.value;
  const path = request.nextUrl.pathname;
  
  // Allow public auth API routes to pass freely so login works
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const isAuthPage = path === '/login' || path === '/register';
  const isPublicPage = path === '/';

  // If user is NOT logged in and tries to access ANY page (Dashboard, etc.) other than public/auth
  if (!session && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user IS logged in and tries to access login/register
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
