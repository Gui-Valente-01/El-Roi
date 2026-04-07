'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function SiteHeader({ onCartClick }: { onCartClick?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const init = useCartStore((state) => state.init);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    init();
  }, [init]);

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      // Fallback: abre via evento customizado
      window.dispatchEvent(new CustomEvent('elroi-open-cart'));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1C2E4A] text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="font-monigue text-4xl tracking-widest text-[#D9D7CF] hover:opacity-80 transition">
          El Roi
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white uppercase tracking-wider">
          <Link href="/" className="hover:text-[#D9D7CF] transition-colors">Início</Link>
          <Link href="/colecoes" className="hover:text-[#D9D7CF] transition-colors">Coleções</Link>
          <Link href="/marca" className="hover:text-[#D9D7CF] transition-colors">A Marca</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCartClick}
            className="relative bg-[#D9D7CF] text-[#1C2E4A] hover:bg-white transition-colors text-sm px-5 py-2.5 rounded-full font-bold uppercase tracking-wider shadow-md"
          >
            Carrinho
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white border-2 border-[#1C2E4A]">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1C2E4A]">
          <nav className="px-6 py-4 space-y-3">
            <a href="/" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium uppercase tracking-wider hover:text-[#D9D7CF] transition">Início</a>
            <a href="/colecoes" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium uppercase tracking-wider hover:text-[#D9D7CF] transition">Coleções</a>
            <a href="/#promocoes" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium uppercase tracking-wider hover:text-[#D9D7CF] transition">Promoções</a>
            <a href="/marca" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium uppercase tracking-wider hover:text-[#D9D7CF] transition">A Marca</a>
          </nav>
        </div>
      )}
    </header>
  );
}
