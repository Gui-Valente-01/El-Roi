import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Protege rotas admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin-token')?.value;
    
    // Se não tem token e não está na página de login, redireciona
    if (!adminToken && request.nextUrl.pathname !== '/admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
