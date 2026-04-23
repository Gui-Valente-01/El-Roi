import { NextResponse } from 'next/server';
import { isAdminRequestAuthenticated } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const authenticated = await isAdminRequestAuthenticated(request);
  return NextResponse.json({ authenticated });
}
