import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

// A chave secreta do Webhook (vamos pegar ela na Stripe no próximo passo)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event;

  try {
    // A Stripe usa uma assinatura de segurança para garantir que foi ELA quem mandou a mensagem, e não um hacker
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Erro no Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Se chegou aqui, a mensagem é verdadeira e veio da Stripe!
  // Vamos escutar o evento de "Pagamento Completo"
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Lembra do nosso "bilhetinho"? Pegamos ele de volta aqui!
    const itensCompradosStr = session.metadata?.itensComprados;

    if (itensCompradosStr) {
      const itensComprados = JSON.parse(itensCompradosStr);
      
      console.log('✅ PAGAMENTO APROVADO!');
      console.log('📦 Itens para dar baixa no estoque:', itensComprados);

      // ------------------------------------------------------------------
      // AQUI É ONDE VOCÊ VAI CONECTAR COM SEU BANCO DE DADOS (Ex: Supabase)
      // Para dar baixa no estoque real e salvar a venda no banco!
      // ------------------------------------------------------------------
    }
  }

  // Devolvemos um OK 200 para a Stripe saber que recebemos a mensagem
  return NextResponse.json({ received: true }, { status: 200 });
}