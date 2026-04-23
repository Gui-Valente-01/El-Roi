import { NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/admin-auth';
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from '@/lib/admin-session';
import { AdminLoginSchema } from '@/lib/validations';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = AdminLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Credenciais invalidas.', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    if (validation.data.token !== getAdminToken()) {
      return NextResponse.json({ error: 'Token invalido.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    const sessionToken = await createAdminSessionToken();

    response.cookies.set(
      ADMIN_SESSION_COOKIE_NAME,
      sessionToken,
      getAdminSessionCookieOptions()
    );

    return response;
  } catch (error) {
    console.error('Erro ao autenticar admin:', error);
    return NextResponse.json({ error: 'Nao foi possivel autenticar.' }, { status: 500 });
  }
}
