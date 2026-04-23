import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/admin-auth';
import { getServiceSupabase } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const unauthorizedResponse = await requireAdminRequest(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return NextResponse.json({ error: 'Nao foi possivel buscar os pedidos.' }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return NextResponse.json({ error: 'Erro interno ao listar pedidos.' }, { status: 500 });
  }
}
