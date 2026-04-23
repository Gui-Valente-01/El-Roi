import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  getCookieValueFromHeader,
  verifyAdminSessionToken,
} from '@/lib/admin-session';

export function getAdminToken() {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    throw new Error('ADMIN_TOKEN nao configurado.');
  }

  return adminToken;
}

export async function isAdminRequestAuthenticated(request: Request) {
  const sessionToken = getCookieValueFromHeader(
    request.headers.get('cookie'),
    ADMIN_SESSION_COOKIE_NAME
  );

  return verifyAdminSessionToken(sessionToken);
}

export async function requireAdminRequest(request: Request) {
  const authenticated = await isAdminRequestAuthenticated(request);

  if (!authenticated) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  return null;
}
