'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const init = useCartStore((state) => state.init);
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const [cliente, setCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  useEffect(() => {
    init();
  }, [init]);

  const handleCheckoutClick = () => {
    if (items.length === 0) {
      setCheckoutError('Seu carrinho está vazio.');
      return;
    }
    setShowCheckoutForm(true);
    setCheckoutError(null);
  };

  const handleCheckout = async () => {
    if (!cliente.nome.trim()) {
      setCheckoutError('Informe seu nome completo.');
      return;
    }
    if (!cliente.email.trim() || !cliente.email.includes('@')) {
      setCheckoutError('Informe um email válido.');
      return;
    }
    if (!cliente.endereco.trim()) {
      setCheckoutError('Informe o endereco de entrega.');
      return;
    }

    try {
      setLoading(true);
      setCheckoutError(null);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, cliente }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCheckoutError(data.error || 'Erro ao processar pagamento. Tente novamente.');
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError('Erro ao gerar link de pagamento.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      setCheckoutError('Erro de conexão. Verifique sua internet e tente novamente.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md md:w-[480px] transform bg-[#1C2E4A] text-white shadow-2xl transition-transform duration-500 ease-in-out flex flex-col border-l border-black/30 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700/50">
          <h2 className="font-monigue text-4xl tracking-widest text-[#D9D7CF]">Carrinho</h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70 mt-10">
              <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg text-gray-300">Seu carrinho está vazio.</p>
              <p className="font-collsmith text-3xl text-[#D9D7CF]/60">Escolha o seu propósito.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items */}
              {items.map((item) => (
                <div key={`${item.id}-${item.tamanho}`} className="flex gap-4 bg-black/20 p-4 rounded-2xl border border-gray-700/30">
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-800">
                    <Image
                      src={item.imagem || '/fallback-image.png'}
                      alt={item.nome}
                      width={80}
                      height={96}
                      className="h-full w-full object-cover"
                      priority={false}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm leading-tight pr-2 text-white">{item.nome}</p>
                      <button
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        onClick={() => removeFromCart(item.id, item.tamanho)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Tamanho: <span className="text-white font-semibold">{item.tamanho}</span></p>
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                        <button
                          className="px-2.5 py-1 bg-black/40 hover:bg-black/60 transition text-white text-sm"
                          onClick={() => updateQuantity(item.id, item.tamanho, Math.max(1, item.quantidade - 1))}
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-sm font-bold text-white">{item.quantidade}</span>
                        <button
                          className="px-2.5 py-1 bg-black/40 hover:bg-black/60 transition text-white text-sm"
                          onClick={() => updateQuantity(item.id, item.tamanho, item.quantidade + 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-black text-[#D9D7CF]">R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Checkout Form */}
              {showCheckoutForm && (
                <div className="mt-6 bg-black/30 p-5 rounded-2xl border border-gray-700/30 space-y-4">
                  <h3 className="text-sm font-bold text-[#D9D7CF] uppercase tracking-widest">Dados de Entrega</h3>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nome completo *</label>
                    <input
                      type="text"
                      value={cliente.nome}
                      onChange={e => setCliente({ ...cliente, nome: e.target.value })}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D9D7CF] transition"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Email *</label>
                      <input
                        type="email"
                        value={cliente.email}
                        onChange={e => setCliente({ ...cliente, email: e.target.value })}
                        className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D9D7CF] transition"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={cliente.telefone}
                        onChange={e => setCliente({ ...cliente, telefone: e.target.value })}
                        className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D9D7CF] transition"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Endereço de entrega *</label>
                    <textarea
                      value={cliente.endereco}
                      onChange={e => setCliente({ ...cliente, endereco: e.target.value })}
                      rows={2}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D9D7CF] transition resize-none"
                      placeholder="Rua, número, bairro, cidade - UF, CEP"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-700/50 bg-[#1C2E4A] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Total</span>
              <span className="font-black text-2xl text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>


            {checkoutError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-lg text-center font-semibold">
                {checkoutError}
              </div>
            )}

            {!showCheckoutForm ? (
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-[#D9D7CF] text-[#1C2E4A] px-4 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-white transition-all shadow-lg"
              >
                Finalizar Compra
              </button>
            ) : (
              <>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-[#D9D7CF] text-[#1C2E4A] px-4 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-white transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Pagar com Cartão / PIX'}
                </button>
                <button
                  onClick={() => { setShowCheckoutForm(false); setCheckoutError(null); }}
                  disabled={loading}
                  className="w-full border border-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition disabled:opacity-50"
                >
                  ← Voltar ao carrinho
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
