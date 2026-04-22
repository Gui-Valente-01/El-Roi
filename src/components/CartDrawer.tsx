'use client';

import { useEffect, useState } from 'react';
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
      setCheckoutError('Informe o endereço de entrega.');
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

  const drawerClasses = `fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col border-l border-black/30 bg-[#1C2E4A] text-white shadow-2xl transition-transform duration-500 ease-in-out md:w-[480px] ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`;

  const drawerContent = (
    <>
      <div className="flex items-center justify-between border-b border-gray-700/50 px-6 py-5">
        <h2 id="cart-drawer-title" className="font-monigue text-4xl tracking-widest text-[#D9D7CF]">
          Carrinho
        </h2>
        <button
          type="button"
          className="p-2 text-gray-400 transition-colors hover:text-white"
          onClick={onClose}
          aria-label="Fechar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="mt-10 flex h-full flex-col items-center justify-center space-y-4 text-center opacity-70">
            <svg className="h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-lg text-gray-300">Seu carrinho está vazio.</p>
            <p className="font-collsmith text-3xl text-[#D9D7CF]/60">Escolha o seu propósito.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.tamanho}`} className="flex gap-4 rounded-2xl border border-gray-700/30 bg-black/20 p-4">
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
                  <div className="flex items-start justify-between">
                    <p className="pr-2 text-sm font-bold leading-tight text-white">{item.nome}</p>
                    <button
                      type="button"
                      className="text-gray-500 transition-colors hover:text-red-400"
                      onClick={() => removeFromCart(item.id, item.tamanho)}
                      aria-label={`Remover ${item.nome} do carrinho`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs text-gray-400">
                    Tamanho: <span className="font-semibold text-white">{item.tamanho}</span>
                  </p>

                  <div className="mt-2 flex items-end justify-between">
                    <div className="flex items-center overflow-hidden rounded-lg border border-gray-600">
                      <button
                        type="button"
                        className="bg-black/40 px-2.5 py-1 text-sm text-white transition hover:bg-black/60"
                        onClick={() => updateQuantity(item.id, item.tamanho, Math.max(1, item.quantidade - 1))}
                        aria-label={`Diminuir quantidade de ${item.nome}`}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-bold text-white">{item.quantidade}</span>
                      <button
                        type="button"
                        className="bg-black/40 px-2.5 py-1 text-sm text-white transition hover:bg-black/60"
                        onClick={() => updateQuantity(item.id, item.tamanho, item.quantidade + 1)}
                        aria-label={`Aumentar quantidade de ${item.nome}`}
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-black text-[#D9D7CF]">
                      R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {showCheckoutForm && (
              <div className="mt-6 space-y-4 rounded-2xl border border-gray-700/30 bg-black/30 p-5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#D9D7CF]">Dados de Entrega</h3>

                <div>
                  <label className="mb-1 block text-xs text-gray-400">Nome completo *</label>
                  <input
                    type="text"
                    value={cliente.nome}
                    onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#D9D7CF]"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Email *</label>
                    <input
                      type="email"
                      value={cliente.email}
                      onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-600 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#D9D7CF]"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Telefone</label>
                    <input
                      type="tel"
                      value={cliente.telefone}
                      onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                      className="w-full rounded-lg border border-gray-600 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#D9D7CF]"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-400">Endereço de entrega *</label>
                  <textarea
                    value={cliente.endereco}
                    onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-gray-600 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#D9D7CF]"
                    placeholder="Rua, número, bairro, cidade - UF, CEP"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-3 border-t border-gray-700/50 bg-[#1C2E4A] p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Total</span>
            <span className="text-2xl font-black text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>

          {checkoutError && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-center text-sm font-semibold text-red-300">
              {checkoutError}
            </div>
          )}

          {!showCheckoutForm ? (
            <button
              type="button"
              onClick={handleCheckoutClick}
              className="w-full rounded-xl bg-[#D9D7CF] px-4 py-4 text-sm font-bold uppercase tracking-widest text-[#1C2E4A] shadow-lg transition-all hover:bg-white"
            >
              Finalizar Compra
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-xl bg-[#D9D7CF] px-4 py-4 text-sm font-bold uppercase tracking-widest text-[#1C2E4A] shadow-lg transition-all hover:bg-white disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Pagar com Cartão / PIX'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCheckoutForm(false);
                  setCheckoutError(null);
                }}
                disabled={loading}
                className="w-full rounded-xl border border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-400 transition hover:bg-white/5 disabled:opacity-50"
              >
                Voltar ao carrinho
              </button>
            </>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {isOpen ? (
        <div
          className={drawerClasses}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          aria-hidden="false"
        >
          {drawerContent}
        </div>
      ) : (
        <div className={drawerClasses} aria-hidden="true">
          {drawerContent}
        </div>
      )}
    </>
  );
}
