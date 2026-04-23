'use client';

import { useEffect, useState } from 'react';
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
      return;
    }

    window.dispatchEvent(new CustomEvent('elroi-open-cart'));
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1C2E4A] text-white shadow-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-monigue text-4xl tracking-widest text-[#D9D7CF] transition hover:opacity-80"
        >
          El Roi
        </Link>

        <nav className="hidden gap-8 text-sm font-medium uppercase tracking-wider text-white md:flex">
          <Link href="/" className="transition-colors hover:text-[#D9D7CF]">
            Inicio
          </Link>
          <Link href="/colecoes" className="transition-colors hover:text-[#D9D7CF]">
            Colecoes
          </Link>
          <Link href="/marca" className="transition-colors hover:text-[#D9D7CF]">
            A Marca
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCartClick}
            className="relative rounded-full bg-[#D9D7CF] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[#1C2E4A] shadow-md transition-colors hover:bg-white"
          >
            Carrinho
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1C2E4A] bg-black text-xs text-white">
                {itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen((currentValue) => !currentValue)}
            className="p-2 text-white md:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#1C2E4A] md:hidden">
          <nav className="space-y-3 px-6 py-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium uppercase tracking-wider transition hover:text-[#D9D7CF]"
            >
              Inicio
            </Link>
            <Link
              href="/colecoes"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium uppercase tracking-wider transition hover:text-[#D9D7CF]"
            >
              Colecoes
            </Link>
            <Link
              href="/#promocoes"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium uppercase tracking-wider transition hover:text-[#D9D7CF]"
            >
              Promocoes
            </Link>
            <Link
              href="/marca"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium uppercase tracking-wider transition hover:text-[#D9D7CF]"
            >
              A Marca
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
