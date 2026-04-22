import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Stripe signature ausente.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    const endpointSecret = getStripeWebhookSecret();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no webhook.';
    console.error('Webhook error:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const pedidoId = session.metadata?.pedido_id;
    const itensCompradosStr = session.metadata?.itensComprados;

    if (pedidoId) {
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ status: 'Pago' })
        .eq('id', pedidoId);

      if (updateError) {
        console.error('Erro ao atualizar pedido:', updateError.message);
      }
    }

    if (itensCompradosStr) {
      const itensComprados = JSON.parse(itensCompradosStr);

      for (const item of itensComprados) {
        const { data: produto } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.id)
          .single();

        if (produto && produto.estoque >= (item.quantidade || 1)) {
          await supabase
            .from('produtos')
            .update({ estoque: produto.estoque - (item.quantidade || 1) })
            .eq('id', item.id);
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
