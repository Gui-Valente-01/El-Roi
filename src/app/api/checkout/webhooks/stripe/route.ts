import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const pedidoId = session.metadata?.pedido_id;
    const itensCompradosStr = session.metadata?.itensComprados;

    if (pedidoId) {
      // Atualiza o pedido existente para "Pago"
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
