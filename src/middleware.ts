import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from '@/lib/admin-session';

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === '/admin') {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const authenticated = await verifyAdminSessionToken(sessionToken);

  if (!authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
