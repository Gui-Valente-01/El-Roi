import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/admin-auth';
import { getServiceSupabase } from '@/lib/supabase-admin';
import { ProdutoPatchSchema } from '@/lib/validations';

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
    const validation = ProdutoPatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Atualizacao invalida.', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('produtos')
      .update(validation.data)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return NextResponse.json({ error: 'Nao foi possivel atualizar o produto.' }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar produto.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const unauthorizedResponse = await requireAdminRequest(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase.from('produtos').delete().eq('id', params.id);

    if (error) {
      console.error('Erro ao excluir produto:', error);
      return NextResponse.json({ error: 'Nao foi possivel excluir o produto.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir produto.' }, { status: 500 });
  }
}
