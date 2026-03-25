'use client';

import { useState } from 'react';
import CartDrawer from '@/components/CartDrawer';
import { useCartStore } from '@/store/cartStore';

export default function ColecoesPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantidade, 0);

  // Lista provisória das suas coleções (podemos puxar do banco no futuro se quiser)
  const colecoes = [
    {
      id: 'genesis',
      nome: 'Gênesis',
      descricao: 'Novos começos, estilo raiz.',
      imagem: 'https://images.unsplash.com/photo-1517502474497-29ab5c192e59?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 'essenciais',
      nome: 'Essenciais',
      descricao: 'Básicos com mensagem forte.',
      imagem: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 'inverno26',
      nome: 'Inverno 2026',
      descricao: 'Aqueça sua fé.',
      imagem: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop', // Imagem de exemplo
    }
  ];

  return (
    <div className="font-sans text-elroi-gray bg-[#F8F9FA] min-h-screen">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* HEADER (Igual ao da Home) */}
      <header className="sticky top-0 z-40 bg-[#1C2E4A] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="/" className="font-monigue text-4xl tracking-widest text-[#D9D7CF] cursor-pointer">El Roi</a>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-white uppercase tracking-wider">
            <a href="/" className="hover:text-[#D9D7CF] transition-colors">Início</a>
            <a href="/#promocoes" className="hover:text-[#D9D7CF] transition-colors">Promoções</a>
            <a href="/marca" className="hover:text-[#D9D7CF] transition-colors">A Marca</a>
          </nav>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-[#D9D7CF] text-[#1C2E4A] hover:bg-white transition-colors text-sm px-5 py-2.5 rounded-full font-bold uppercase tracking-wider shadow-md"
          >
            Carrinho
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white border-2 border-[#1C2E4A]">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL: COLEÇÕES */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="font-monigue text-5xl md:text-7xl text-[#1C2E4A] tracking-wider mb-4">
            Nossas Coleções
          </h1>
          <p className="text-lg text-gray-500 font-light max-w-2xl mx-auto">
            Descubra as linhas que conectam o céu e a rua. Cada peça carrega um propósito, cada coleção conta uma história.
          </p>
        </div>

        {/* GRID DE COLEÇÕES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {colecoes.map((colecao) => (
            <div 
              key={colecao.id}
              className="relative h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-xl bg-cover bg-center"
              style={{ backgroundImage: `url('${colecao.imagem}')` }}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
              <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center text-white">
                <h3 className="font-monigue text-5xl tracking-widest drop-shadow-lg group-hover:scale-105 transition-transform duration-500">
                  {colecao.nome}
                </h3>
                <p className="mt-4 font-light text-lg tracking-wide drop-shadow-md">
                  {colecao.descricao}
                </p>
              </div>
              
              {/* === AQUI ESTÁ A MUDANÇA (Passo 1) === */}
              <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <a 
                  href={`/colecoes/${colecao.id}`} 
                  className="text-sm bg-white text-black font-bold uppercase tracking-wider px-8 py-3 rounded-full shadow-lg hover:bg-[#1C2E4A] hover:text-white transition-colors"
                >
                  Ver Peças
                </a>
              </div>
              {/* ==================================== */}
              
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER (Igual ao da Home) */}
      <footer className="bg-black text-[#D9D7CF] py-16 border-t-[6px] border-[#1C2E4A] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <p className="font-monigue text-6xl tracking-widest mb-2">El Roi</p>
          <p className="font-collsmith text-3xl text-gray-400 mb-8">Moda como ponte, entre o céu e a rua</p>
          <div className="w-24 h-[1px] bg-gray-700 mb-8"></div>
          <p className="text-sm font-light text-gray-500 uppercase tracking-widest">© {new Date().getFullYear()} El Roi. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}