'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from '@/components/CartDrawer';

// O force-dynamic fica logo depois dos imports!
export const dynamic = 'force-dynamic';

export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  
  const products = useProductStore((state) => state.products);
  const product = products.find((p) => p.id === productId);

  const [selectedSize, setSelectedSize] = useState<'P' | 'M' | 'G' | 'GG'>('M');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantidade, 0);

  const [postalCode, setPostalCode] = useState('');
  const [frete, setFrete] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const handleCalcularFrete = () => {
    if (!postalCode.trim()) {
      setFrete('Informe um CEP válido.');
      return;
    }
    setFrete(`Frete estimado para ${postalCode}: R$ 24,90 (3-5 dias úteis)`);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, tamanho: selectedSize, quantidade: 1 });
      setAdded(true);
      setIsCartOpen(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <h1 className="font-monigue text-5xl text-[#1C2E4A] mb-4">Produto não encontrado</h1>
        <Link href="/" className="text-gray-500 hover:text-[#1C2E4A] underline font-poppins">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* HEADER SIMPLIFICADO */}
      <header className="sticky top-0 z-40 bg-[#1C2E4A] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link href="/" className="font-monigue text-4xl tracking-widest text-[#D9D7CF]">
            El Roi
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white text-sm font-bold uppercase tracking-wider hover:text-[#D9D7CF] transition-colors hidden sm:block">
              Voltar à Loja
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-white hover:text-[#D9D7CF] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D9D7CF] text-[#1C2E4A] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-8 font-medium uppercase tracking-wider">
          <Link href="/" className="hover:text-[#1C2E4A] transition-colors">Início</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1C2E4A]">Loja</span>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{product.nome}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* LADO ESQUERDO: IMAGEM */}
          <div className="w-full bg-[#F8F9FA] rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative group">
            <div className="aspect-[4/5] w-full relative flex items-center justify-center bg-gray-100">
              {product.imagem ? (
                <img
                  src={product.imagem}
                  alt={product.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-image.png'; }}
                />
              ) : (
                <span className="text-gray-400 font-monigue text-3xl opacity-50">Sem Imagem</span>
              )}
            </div>
          </div>

          {/* LADO DIREITO: INFOS */}
          <div className="flex flex-col pt-4 md:pt-10">
            <h1 className="font-monigue text-5xl md:text-6xl text-[#1C2E4A] tracking-wider mb-2 leading-tight">
              {product.nome}
            </h1>
            
            <p className="text-3xl font-black text-gray-900 mb-6">
              R$ {product.preco.toFixed(2).replace('.', ',')}
            </p>

            <div className="w-full h-[1px] bg-gray-200 mb-8"></div>

            {/* SELETOR DE TAMANHOS */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900 uppercase tracking-wider text-sm">Tamanho</span>
                <span className="text-sm text-gray-400">Modelagem Oversized</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {(['P', 'M', 'G', 'GG'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-sm transition-all border-2 ${
                      selectedSize === size 
                        ? 'bg-[#1C2E4A] border-[#1C2E4A] text-white shadow-md' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#1C2E4A] hover:text-[#1C2E4A]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CALCULADORA DE FRETE */}
            <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Calcular Frete</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  className="border border-gray-300 rounded-xl px-4 py-3 flex-grow focus:outline-none focus:border-[#1C2E4A] focus:ring-1 focus:ring-[#1C2E4A] transition-shadow text-gray-700 bg-white"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
                <button
                  onClick={handleCalcularFrete}
                  className="bg-[#1C2E4A] text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors"
                >
                  OK
                </button>
              </div>
              {frete && <p className="mt-3 text-[#1C2E4A] font-semibold text-sm">{frete}</p>}
            </div>

            {/* BOTÃO DE COMPRAR */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-xl mt-4 ${
                added 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#D9D7CF] text-[#1C2E4A] hover:bg-[#1C2E4A] hover:text-white'
              }`}
            >
              {added ? '✓ Adicionado' : 'Adicionar ao Carrinho'}
            </button>

          </div>
        </div>
      </main>
      
      {/* FOOTER DA PÁGINA */}
      <footer className="bg-black text-[#D9D7CF] py-12 border-t-[6px] border-[#1C2E4A] mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-collsmith text-3xl text-gray-400">O Deus que me vê.</p>
        </div>
      </footer>
    </div>
  );
}