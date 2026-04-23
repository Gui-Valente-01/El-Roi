import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/admin-auth';
import { getServiceSupabase } from '@/lib/supabase-admin';
import { ProdutoSchema } from '@/lib/validations';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const unauthorizedResponse = await requireAdminRequest(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return NextResponse.json({ error: 'Nao foi possivel buscar os produtos.' }, { status: 500 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error('Erro no endpoint de produtos:', error);
    return NextResponse.json({ error: 'Erro interno ao listar produtos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorizedResponse = await requireAdminRequest(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const body = await request.json();
    const validation = ProdutoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados do produto invalidos.', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('produtos')
      .insert([validation.data])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return NextResponse.json({ error: 'Nao foi possivel criar o produto.' }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro interno ao criar produto.' }, { status: 500 });
  }
}
