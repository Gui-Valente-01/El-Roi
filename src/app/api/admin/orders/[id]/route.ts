import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/admin-auth';
import { getServiceSupabase } from '@/lib/supabase-admin';
import { PedidoStatusSchema } from '@/lib/validations';

export const runtime = 'nodejs';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const unauthorizedResponse = await requireAdminRequest(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const body = await request.json();
    const validation = PedidoStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Status invalido.', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status: validation.data.status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar pedido:', error);
      return NextResponse.json({ error: 'Nao foi possivel atualizar o pedido.' }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar pedido.' }, { status: 500 });
  }
}
