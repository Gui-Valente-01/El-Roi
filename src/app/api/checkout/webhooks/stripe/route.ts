import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase'; // Certifique-se que o caminho do seu cliente supabase está correto

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
    console.error(`❌ Erro no Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const itensCompradosStr = session.metadata?.itensComprados;

    if (itensCompradosStr) {
      const itensComprados = JSON.parse(itensCompradosStr);
      
      console.log('✅ PAGAMENTO APROVADO! Atualizando banco de dados...');

      // 1. ATUALIZAR ESTOQUE E SALVAR PEDIDO
      for (const item of itensComprados) {
        // Buscamos o estoque atual do produto
        const { data: produto } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.id)
          .single();

        if (produto) {
          const novoEstoque = produto.estoque - item.quantidade;
          
          // Atualizamos o estoque no Supabase
          await supabase
            .from('produtos')
            .update({ estoque: novoEstoque })
            .eq('id', item.id);
        }
      }

      // 2. REGISTRAR A VENDA NA TABELA 'PEDIDOS'
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          cliente_email: session.customer_details?.email,
          total: session.amount_total ? session.amount_total / 100 : 0,
          itens: itensComprados, // Salva o JSON do que foi comprado
          status: 'pago',
          stripe_checkout_id: session.id,
          created_at: new Date().toISOString()
        }]);

      if (pedidoError) {
        console.error('❌ Erro ao salvar pedido:', pedidoError.message);
      } else {
        console.log('📦 Estoque atualizado e pedido registrado com sucesso!');
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}