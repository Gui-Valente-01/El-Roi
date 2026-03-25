'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // <-- Adicionado para fazer os botões de navegação funcionarem
import CartDrawer from '@/components/CartDrawer';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabase';

// Definindo o tipo Produto (igual ao do banco)
type ProdutoDB = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  tamanho: string;
  imagem: string;
  badge: string;
  estoque: number;
};

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  
  // Criamos um novo estado para guardar os produtos reais do banco
  const [produtosReais, setProdutosReais] = useState<ProdutoDB[]>([]);
  const [loading, setLoading] = useState(true);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantidade, 0);

  // Função que busca os produtos no Supabase
  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setProdutosReais(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manda buscar os produtos assim que a página carrega
  useEffect(() => {
    fetchProdutos();
  }, []);

  // Adicionando uma trava de segurança para o tamanho
  const handleAddToCart = (product: any) => {
    addToCart({ 
      ...product, 
      tamanho: product.tamanho || 'M', // Se não tiver tamanho, vai 'M' por padrão
      quantidade: 1 
    });
    setIsCartOpen(true);
  };

  return (
    <div className="font-sans text-elroi-gray bg-[#F8F9FA] min-h-screen">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Faixa de Frete Grátis */}
      <div className="bg-black text-white text-center text-xs md:text-sm py-2 font-semibold tracking-widest uppercase">
        Frete Grátis acima de R$ 299
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#1C2E4A] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="font-monigue text-4xl tracking-widest text-[#D9D7CF]">El Roi</div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-white uppercase tracking-wider">
            <a href="#colecoes" className="hover:text-[#D9D7CF] transition-colors">Coleções</a>
            <a href="#promocoes" className="hover:text-[#D9D7CF] transition-colors">Promoções</a>
            <Link href="/marca" className="hover:text-[#D9D7CF] transition-colors">A Marca</Link>
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

      <main>
        {/* BANNER PRINCIPAL COM IMAGEM DE FUNDO DO MAR */}
        <section 
          className="relative h-[80vh] w-full bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2070&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-[#1C2E4A]/65"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
            <h1 className="font-monigue text-6xl md:text-8xl lg:text-9xl text-[#D9D7CF] mb-2 tracking-widest drop-shadow-2xl">
              EL ROI
            </h1>
            <p className="font-collsmith text-4xl md:text-5xl lg:text-6xl text-white mb-6 drop-shadow-md">
              O Deus que me vê.
            </p>
            <p className="text-base md:text-lg text-gray-200 font-light max-w-2xl mb-10 drop-shadow-sm">
              Vista propósito. Sua fé, sua atitude. Streetwear cristão com identidade.
            </p>
            <button
              className="bg-[#D9D7CF] text-[#1C2E4A] font-bold uppercase tracking-widest text-sm px-10 py-4 rounded-full hover:bg-white hover:scale-105 transition-all shadow-xl"
              onClick={() => document.getElementById('colecoes')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Coleções
            </button>
          </div>
        </section>

        {/* PROMOÇÕES */}
        <section id="promocoes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid gap-8 md:grid-cols-2 items-center bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100">
            <div>
              <h2 className="font-monigue text-5xl md:text-6xl text-[#1C2E4A] mb-4 tracking-wider">Combo Especial</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                T-Shirt + Moletom com <strong className="text-black">20% OFF</strong>. Estilo que conta história de fé em cada esquina.
              </p>
              <button
                className="bg-[#1C2E4A] text-white uppercase tracking-wider text-sm px-8 py-4 rounded-full font-bold hover:bg-black transition-colors shadow-lg"
                onClick={() => {
                  handleAddToCart({ 
                    id: 'combo-1', 
                    nome: 'Combo Especial T-Shirt + Moletom', 
                    preco: 249.90, 
                    tamanho: 'M', 
                    imagem: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop', 
                    estoque: 10 
                  });
                }}
              >
                Comprar o Combo
              </button>
            </div>
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden shadow-inner relative bg-gray-100">
              <img
                src={'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop'}
                alt="Promoção combo"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* COLEÇÕES COM IMAGENS DE FUNDO */}
        <section id="colecoes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-monigue text-5xl md:text-7xl mb-12 text-center text-[#1C2E4A] tracking-wider">Coleções</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Card Coleção Gênesis */}
            <Link href="/colecoes" className="relative h-80 md:h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-xl bg-cover bg-center block"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517502474497-29ab5c192e59?q=80&w=1000&auto=format&fit=crop')" }}>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
              <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center text-white">
                <h3 className="font-monigue text-5xl md:text-6xl tracking-widest drop-shadow-lg group-hover:scale-105 transition-transform duration-500">Gênesis</h3>
                <p className="mt-4 font-light text-lg tracking-wide drop-shadow-md">Novos começos, estilo raiz.</p>
              </div>
              <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-sm bg-white text-black font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-lg">Descobrir</span>
              </div>
            </Link>

            {/* Card Coleção Essenciais */}
            <Link href="/colecoes" className="relative h-80 md:h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-xl bg-cover bg-center block"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop')" }}>
              <div className="absolute inset-0 bg-[#1C2E4A]/50 group-hover:bg-[#1C2E4A]/30 transition-all duration-500" />
              <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center text-white">
                <h3 className="font-monigue text-5xl md:text-6xl tracking-widest drop-shadow-lg group-hover:scale-105 transition-transform duration-500">Essenciais</h3>
                <p className="mt-4 font-light text-lg tracking-wide drop-shadow-md">Básicos com mensagem forte.</p>
              </div>
              <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-sm bg-white text-black font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-lg">Descobrir</span>
              </div>
            </Link>
          </div>
        </section>

        {/* PRODUTOS REAIS DO SUPABASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-monigue text-5xl md:text-7xl mb-12 text-center text-[#1C2E4A] tracking-wider">Mais Vendidos</h2>
          
          {loading ? (
             <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1C2E4A]"></div>
             </div>
          ) : produtosReais.length === 0 ? (
             <p className="text-center text-gray-500 text-lg">Nenhum produto disponível no momento.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {produtosReais.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative group border border-gray-50">
                  
                  <Link href={`/produto/${product.id}`} className="block cursor-pointer flex-grow">
                    {product.imagem ? (
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        className="h-56 w-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/fallback-image.png';
                        }}
                      />
                    ) : (
                      <div className="h-56 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-center text-gray-400">
                        Sem imagem
                      </div>
                    )}
                    <div className="mt-5 mb-6">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-gray-900 leading-tight">{product.nome}</h3>
                        {product.badge && <span className="text-xs bg-[#1C2E4A] text-white px-2 py-1 rounded-md whitespace-nowrap">{product.badge}</span>}
                      </div>
                      <p className="mt-3 font-black text-lg text-[#1C2E4A]">R$ {Number(product.preco).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </Link>

                  <button
                    className="w-full bg-transparent border-2 border-[#1C2E4A] text-[#1C2E4A] hover:bg-[#1C2E4A] hover:text-white py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors mt-auto z-10 relative"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product);
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-[#D9D7CF] py-16 border-t-[6px] border-[#1C2E4A]">
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