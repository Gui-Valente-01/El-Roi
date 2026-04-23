import { NextResponse } from 'next/server';
import { getStaticCatalogItem } from '@/lib/catalog';
import { getStripeClient } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase-admin';
import { CheckoutRequestSchema } from '@/lib/validations';

export const runtime = 'nodejs';

type CanonicalCheckoutItem = {
  descricao?: string;
  id: string;
  imagem?: string;
  nome: string;
  preco: number;
  quantidade: number;
  tamanho: string;
};

type DatabaseProduct = {
  descricao: string | null;
  estoque: number;
  id: string;
  imagem: string | null;
  nome: string;
  preco: number;
};

export async function POST(request: Request) {
  let createdOrderId: string | null = null;

  try {
    const body = await request.json();
    const validationResult = CheckoutRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados invalidos.', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const supabase = getServiceSupabase();
    const { cliente, items } = validationResult.data;

    const databaseItemIds = Array.from(
      new Set(items.map((item) => item.id).filter((id) => !getStaticCatalogItem(id)))
    );

    const databaseProductsById = new Map<string, DatabaseProduct>();

    if (databaseItemIds.length > 0) {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, descricao, preco, imagem, estoque')
        .in('id', databaseItemIds);

      if (error) {
        console.error('Erro ao buscar produtos do checkout:', error);
        return NextResponse.json({ error: 'Nao foi possivel validar os produtos.' }, { status: 500 });
      }

      for (const product of (data || []) as DatabaseProduct[]) {
        databaseProductsById.set(product.id, product);
      }
    }

    const canonicalItems: CanonicalCheckoutItem[] = [];

    for (const item of items) {
      const staticItem = getStaticCatalogItem(item.id);

      if (staticItem) {
        canonicalItems.push({
          descricao: staticItem.descricao,
          id: staticItem.id,
          imagem: staticItem.imagem,
          nome: staticItem.nome,
          preco: staticItem.preco,
          quantidade: item.quantidade,
          tamanho: item.tamanho,
        });
        continue;
      }

      const product = databaseProductsById.get(item.id);

      if (!product) {
        return NextResponse.json(
          { error: `Produto "${item.nome}" nao foi encontrado no catalogo.` },
          { status: 400 }
        );
      }

      if (product.estoque <= 0) {
        return NextResponse.json({ error: `Produto "${product.nome}" esgotado.` }, { status: 400 });
      }

      if (product.estoque < item.quantidade) {
        return NextResponse.json(
          { error: `Produto "${product.nome}" tem apenas ${product.estoque} unidades em estoque.` },
          { status: 400 }
        );
      }

      canonicalItems.push({
        descricao: product.descricao || undefined,
        id: product.id,
        imagem: product.imagem || undefined,
        nome: product.nome,
        preco: product.preco,
        quantidade: item.quantidade,
        tamanho: item.tamanho,
      });
    }

    const totalBruto = canonicalItems.reduce(
      (sum, item) => sum + item.preco * item.quantidade,
      0
    );

    const { data: pedido, error: orderError } = await supabase
      .from('pedidos')
      .insert([
        {
          email_cliente: cliente.email,
          endereco: cliente.endereco,
          itens: canonicalItems.map((item) => ({
            id: item.id,
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade,
            tamanho: item.tamanho,
          })),
          nome_cliente: cliente.nome,
          status: 'Pendente',
          telefone_cliente: cliente.telefone || '',
          total: totalBruto,
        },
      ])
      .select()
      .single();

    if (orderError || !pedido?.id) {
      console.error('Erro ao criar pedido:', orderError);
      return NextResponse.json({ error: 'Nao foi possivel criar o pedido.' }, { status: 500 });
    }

    createdOrderId = pedido.id;

    const session = await stripe.checkout.sessions.create({
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cancelar`,
      customer_email: cliente.email,
      line_items: canonicalItems.map((item) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.nome,
            ...(item.descricao ? { description: item.descricao } : {}),
            ...(item.imagem ? { images: [item.imagem] } : {}),
          },
          unit_amount: Math.round(item.preco * 100),
        },
        quantity: item.quantidade,
      })),
      metadata: {
        itensComprados: JSON.stringify(
          canonicalItems.map((item) => ({
            id: item.id,
            nome: item.nome,
            quantidade: item.quantidade,
            tamanho: item.tamanho,
          }))
        ),
        pedido_id: pedido.id,
      },
      mode: 'payment',
      payment_method_types: ['card', 'pix'] as const,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sucesso?pedido_id=${pedido.id}`,
    });

    if (!session.url) {
      throw new Error('Stripe nao retornou a URL do checkout.');
    }

    const { error: updateError } = await supabase
      .from('pedidos')
      .update({ stripe_checkout_id: session.id })
      .eq('id', pedido.id);

    if (updateError) {
      console.error('Erro ao vincular checkout ao pedido:', updateError);
      throw new Error('Nao foi possivel vincular o checkout ao pedido.');
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessao Stripe:', error);

    if (createdOrderId) {
      try {
        const supabase = getServiceSupabase();
        await supabase.from('pedidos').delete().eq('id', createdOrderId);
      } catch (rollbackError) {
        console.error('Erro ao desfazer pedido apos falha no checkout:', rollbackError);
      }
    }

    return NextResponse.json({ error: 'Erro ao processar o pagamento.' }, { status: 500 });
  }
}
