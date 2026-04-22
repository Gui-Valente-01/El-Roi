import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getStripeClient } from '@/lib/stripe';
import { CheckoutRequestSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const body = await request.json();

    const validationResult = CheckoutRequestSchema.safeParse({ items: body.items });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { items } = validationResult.data;
    const { cliente } = body;

    for (const item of items) {
      const { data: produto } = await supabase
        .from('produtos')
        .select('estoque')
        .eq('id', item.id)
        .maybeSingle();

      if (produto) {
        if (produto.estoque <= 0) {
          return NextResponse.json({ error: `Produto "${item.nome}" esgotado` }, { status: 400 });
        }

        if (produto.estoque < (item.quantidade || 1)) {
          return NextResponse.json(
            {
              error: `Produto "${item.nome}" tem apenas ${produto.estoque} unidades em estoque`,
            },
            { status: 400 }
          );
        }
      }
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.nome,
          ...(item.descricao ? { description: item.descricao } : {}),
          ...(item.imagem ? { images: [item.imagem] } : {}),
        },
        unit_amount: Math.round(item.preco * 100),
      },
      quantity: item.quantidade || 1,
    }));

    const totalBruto = items.reduce(
      (sum: number, item: any) => sum + (item.preco || 0) * (item.quantidade || 1),
      0
    );

    const { data: pedido, error: _pedidoError } = await supabase
      .from('pedidos')
      .insert([
        {
          nome_cliente: cliente?.nome || '',
          email_cliente: cliente?.email || '',
          endereco: cliente?.endereco || '',
          telefone_cliente: cliente?.telefone || '',
          itens: items.map((item: any) => ({
            nome: item.nome,
            quantidade: item.quantidade || 1,
            tamanho: item.tamanho || 'M',
            preco: item.preco || 0,
          })),
          total: totalBruto,
          status: 'Pendente',
        },
      ])
      .select()
      .single();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'] as any,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sucesso?pedido_id=${pedido?.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cancelar`,
      metadata: {
        pedido_id: pedido?.id,
        itensComprados: JSON.stringify(
          items.map((item: any) => ({
            id: item.id,
            tamanho: item.tamanho || 'M',
            quantidade: item.quantidade || 1,
            nome: item.nome,
          }))
        ),
      },
      customer_email: cliente?.email || undefined,
    });

    if (pedido?.id) {
      await supabase
        .from('pedidos')
        .update({ stripe_checkout_id: session.id })
        .eq('id', pedido.id);
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Erro ao criar sessão Stripe:', error);
    return NextResponse.json({ error: 'Erro ao processar o pagamento' }, { status: 500 });
  }
}
