import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  getExpiredAdminSessionCookieOptions,
} from '@/lib/admin-session';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE_NAME,
    '',
    getExpiredAdminSessionCookieOptions()
  );

  return response;
}
