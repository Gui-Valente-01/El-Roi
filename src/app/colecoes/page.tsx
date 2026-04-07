'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import CartDrawer from '@/components/CartDrawer';

export default function ColecoesPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsCartOpen(true);
    window.addEventListener('elroi-open-cart', handler);
    return () => window.removeEventListener('elroi-open-cart', handler);
  }, []);

  return (
    <div className="font-sans text-elroi-gray bg-[#F8F9FA] min-h-screen">
      <SiteHeader />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="font-monigue text-5xl md:text-7xl text-[#1C2E4A] tracking-wider mb-4">
            Nossas Coleções
          </h1>
          <p className="text-lg text-gray-500 font-light max-w-2xl mx-auto">
            Descubra as linhas que conectam o céu e a rua. Cada peça carrega um propósito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/colecoes/genesis" className="relative h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-xl bg-cover bg-center block"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517502474497-29ab5c192e59?q=80&w=1000&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center text-white">
              <h3 className="font-monigue text-5xl tracking-widest drop-shadow-lg group-hover:scale-105 transition-transform duration-500">Gênesis</h3>
              <p className="mt-4 font-light text-lg tracking-wide drop-shadow-md">Novos começos, estilo raiz.</p>
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-sm bg-white text-black font-bold uppercase tracking-wider px-8 py-3 rounded-full shadow-lg group-hover:bg-[#1C2E4A] group-hover:text-white transition-colors">Ver Peças</span>
            </div>
          </Link>

          <Link href="/colecoes/essenciais" className="relative h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-xl bg-cover bg-center block"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center text-white">
              <h3 className="font-monigue text-5xl tracking-widest drop-shadow-lg group-hover:scale-105 transition-transform duration-500">Essenciais</h3>
              <p className="mt-4 font-light text-lg tracking-wide drop-shadow-md">Básicos com mensagem forte.</p>
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-sm bg-white text-black font-bold uppercase tracking-wider px-8 py-3 rounded-full shadow-lg group-hover:bg-[#1C2E4A] group-hover:text-white transition-colors">Ver Peças</span>
            </div>
          </Link>

          <Link href="/colecoes/inverno26" className="relative h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-xl bg-cover bg-center block"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center text-white">
              <h3 className="font-monigue text-5xl tracking-widest drop-shadow-lg group-hover:scale-105 transition-transform duration-500">Inverno 2026</h3>
              <p className="mt-4 font-light text-lg tracking-wide drop-shadow-md">Aqueça sua fé.</p>
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-sm bg-white text-black font-bold uppercase tracking-wider px-8 py-3 rounded-full shadow-lg group-hover:bg-[#1C2E4A] group-hover:text-white transition-colors">Ver Peças</span>
            </div>
          </Link>
        </div>
      </main>

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
