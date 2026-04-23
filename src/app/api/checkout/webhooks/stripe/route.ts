import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStaticCatalogItem } from '@/lib/catalog';
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

type InventoryItem = {
  id: string;
  quantidade?: number;
};

type StockProduct = {
  estoque: number;
  id: string;
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Stripe signature ausente.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    const endpointSecret = getStripeWebhookSecret();
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no webhook.';
    console.error('Webhook error:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const pedidoId = session.metadata?.pedido_id;
  const itensCompradosStr = session.metadata?.itensComprados;

  if (!pedidoId) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data: updatedOrder, error: updateError } = await supabase
      .from('pedidos')
      .update({ status: 'Pago' })
      .eq('id', pedidoId)
      .eq('status', 'Pendente')
      .select('id')
      .maybeSingle();

    if (updateError) {
      console.error('Erro ao atualizar pedido no webhook:', updateError);
      return NextResponse.json({ error: 'Nao foi possivel atualizar o pedido.' }, { status: 500 });
    }

    if (!updatedOrder || !itensCompradosStr) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const itensComprados = JSON.parse(itensCompradosStr) as InventoryItem[];
    const inventoryItems = itensComprados.filter((item) => !getStaticCatalogItem(item.id));
    const productIds = Array.from(new Set(inventoryItems.map((item) => item.id)));

    if (productIds.length === 0) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { data: products, error: productsError } = await supabase
      .from('produtos')
      .select('id, estoque')
      .in('id', productIds);

    if (productsError) {
      console.error('Erro ao buscar estoque no webhook:', productsError);
      return NextResponse.json({ error: 'Nao foi possivel atualizar o estoque.' }, { status: 500 });
    }

    const stockByProductId = new Map(
      ((products || []) as StockProduct[]).map((product) => [product.id, product])
    );

    for (const item of inventoryItems) {
      const product = stockByProductId.get(item.id);
      const quantity = item.quantidade || 1;

      if (!product) {
        console.error('Produto do webhook nao encontrado:', item.id);
        continue;
      }

      if (product.estoque < quantity) {
        console.error('Estoque insuficiente para o produto do webhook:', item.id);
        continue;
      }

      const nextStock = product.estoque - quantity;
      const { error: stockUpdateError } = await supabase
        .from('produtos')
        .update({ estoque: nextStock })
        .eq('id', item.id);

      if (stockUpdateError) {
        console.error('Erro ao atualizar estoque do produto:', item.id, stockUpdateError);
        continue;
      }

      product.estoque = nextStock;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar webhook Stripe:', error);
    return NextResponse.json({ error: 'Erro interno ao processar webhook.' }, { status: 500 });
  }
}
