'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useSalesStore } from '@/store/salesStore';
import { useProductStore } from '@/store/productStore';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const addSale = useSalesStore((state) => state.addSale);
  const reduceStock = useProductStore((state) => state.reduceStock);

  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // NOVO ESTADO DE CARREGAMENTO

  const handleCheckout = async () => {
    if (items.length === 0) {
      setCheckoutError('Seu carrinho está vazio.');
      return;
    }

    try {
      setLoading(true);
      setCheckoutError(null);

      /* * NOTA IMPORTANTE SOBRE ESTOQUE E VENDAS:
       * O ideal é que o 'addSale', 'reduceStock' e 'clearCart' só sejam chamados 
       * QUANDO o cliente efetivamente pagar na Stripe (usando Webhooks). 
       * Por enquanto, vou deixá-los comentados para não zerar seu estoque 
       * só de o cliente clicar no botão e desistir de pagar na tela da Stripe.
       */
      
      // addSale({ ... });
      // items.forEach((item) => { reduceStock(item.id, item.quantidade); });
      // clearCart();

      // Chamada para a nossa API da Stripe
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (data.url) {
        // Deu certo! Manda o usuário para a tela de pagamento
        window.location.href = data.url;
      } else {
        setCheckoutError('Erro ao gerar link de pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      setCheckoutError('Erro de conexão ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fundo escuro atrás do carrinho (Backdrop) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Gaveta do Carrinho */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md md:w-[450px] transform bg-[#1C2E4A] text-white shadow-2xl transition-transform duration-500 ease-in-out flex flex-col border-l border-black/30 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700/50">
          <h2 className="font-monigue text-5xl tracking-widest text-[#D9D7CF] mt-2">Carrinho</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-white transition-colors p-2"
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70 mt-10">
              <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="font-poppins text-lg text-gray-300">Seu carrinho está vazio.</p>
              <p className="font-collsmith text-3xl text-[#D9D7CF]/60">Escolha o seu propósito.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.tamanho}`} className="flex gap-4 bg-black/20 p-4 rounded-2xl border border-gray-700/30">
                  {/* Foto do Produto */}
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-800">
                    <img
                      src={item.imagem || '/fallback-image.png'}
                      alt={item.nome}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-image.png'; }}
                    />
                  </div>

                  {/* Informações do Produto */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm leading-tight pr-2 text-white">{item.nome}</p>
                        <button
                          className="text-gray-500 hover:text-red-400 transition-colors"
                          onClick={() => removeFromCart(item.id, item.tamanho)}
                          title="Remover item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Tamanho: <span className="text-white font-semibold">{item.tamanho}</span></p>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                        <button
                          className="px-3 py-1 bg-black/40 hover:bg-black/60 transition-colors text-white"
                          onClick={() => updateQuantity(item.id, item.tamanho, Math.max(1, item.quantidade - 1))}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-bold bg-transparent text-white">{item.quantidade}</span>
                        <button
                          className="px-3 py-1 bg-black/40 hover:bg-black/60 transition-colors text-white"
                          onClick={() => updateQuantity(item.id, item.tamanho, item.quantidade + 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-black text-[#D9D7CF]">R$ {item.preco.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RODAPÉ DO CARRINHO (Total e Botões) */}
        <div className="p-6 border-t border-gray-700/50 bg-[#1C2E4A]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-300 font-medium">Total estimado</span>
            <span className="font-black text-2xl text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>

          {/* Mensagens de Feedback */}
          {checkoutSuccess && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-300 text-sm rounded-lg text-center font-semibold">
              ✓ Compra preparada com sucesso!
            </div>
          )}

          {checkoutError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-lg text-center font-semibold">
              {checkoutError}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || loading}
              className="w-full bg-[#D9D7CF] text-[#1C2E4A] px-4 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-white transition-all shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Preparando pagamento...' : 'Finalizar Compra'}
            </button>

            {items.length > 0 && (
              <button
                className="w-full rounded-xl border border-gray-600 px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors uppercase tracking-wider disabled:opacity-50"
                onClick={clearCart}
                disabled={loading}
              >
                Limpar Carrinho
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}