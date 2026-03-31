import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inicializa a Stripe com a sua chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any, // Versão da API da Stripe
});

export async function POST(request: Request) {
  try {
    // 1. Recebe os itens do carrinho enviados pelo frontend
    const { items } = await request.json();

    // 2. Formata os itens para o padrão que a Stripe exige
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'brl', // Moeda em Real
        product_data: {
          name: item.nome,
          images:[], // Mostra a foto do produto no checkout
        },
        // A Stripe exige que o valor seja em centavos. Ex: R$ 50,00 = 5000 centavos
        unit_amount: Math.round(item.preco * 100), 
      },
      quantity: item.quantidade,
    }));

    // 3. Cria a sessão de pagamento lá nos servidores da Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // No modo teste, cartão é mais fácil. Depois podemos adicionar 'pix' e 'boleto'
      line_items: lineItems,
      mode: 'payment',
      // Para onde o usuário vai se a compra der certo:
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sucesso`,
      // Para onde o usuário volta se ele cancelar ou fechar a tela de pagamento:
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/carrinho`,

      metadata: {
        // Criamos um resumo do carrinho para o Webhook saber exatamente o que descontar do estoque depois!
        itensComprados: JSON.stringify(items.map((item: any) => ({
          id: item.id,
          tamanho: item.tamanho,
          quantidade: item.quantidade
        })))
      }
    });

    // 4. Devolve o link da página de pagamento para o nosso site
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Erro ao criar sessão no Stripe:', error);
    return NextResponse.json({ error: 'Erro ao processar o pagamento' }, { status: 500 });
  }
}