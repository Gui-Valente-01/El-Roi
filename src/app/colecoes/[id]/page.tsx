'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CartDrawer from '@/components/CartDrawer';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabase';

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

// Dicionário para saber o título da página baseado no link
const colecoesInfo: Record<string, { titulo: string, subtitulo: string }> = {
  'genesis': { titulo: 'Gênesis', subtitulo: 'Novos começos, estilo raiz.' },
  'essenciais': { titulo: 'Essenciais', subtitulo: 'Básicos com mensagem forte.' },
  'inverno26': { titulo: 'Inverno 2026', subtitulo: 'Aqueça sua fé.' }
};

export default function ColecaoInternaPage() {
  const params = useParams();
  const idColecao = params.id as string;
  const info = colecoesInfo[idColecao] || { titulo: 'Coleção Exclusiva', subtitulo: 'Peças selecionadas.' };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  
  const [produtos, setProdutos] = useState<ProdutoDB[]>([]);
  const [loading, setLoading] = useState(true);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantidade, 0);

  useEffect(() => {
    const fetchProdutosDaColecao = async () => {
      try {
        // Por enquanto, ele vai puxar todos os produtos do banco.
        // Futuramente, você pode adicionar um .eq('categoria', 'Gênesis') aqui para filtrar!
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setProdutos(data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutosDaColecao();
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantidade: 1 });
    setIsCartOpen(true);
  };

  return (
    <div className="font-sans text-elroi-gray bg-[#F8F9FA] min-h-screen">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#1C2E4A] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <a href="/" className="font-monigue text-4xl tracking-widest text-[#D9D7CF] cursor-pointer">El Roi</a>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-white uppercase tracking-wider">
            <a href="/" className="hover:text-[#D9D7CF] transition-colors">Início</a>
            <a href="/colecoes" className="text-[#D9D7CF] transition-colors border-b-2 border-[#D9D7CF]">Coleções</a>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 border-b border-gray-200 pb-8">
          <a href="/colecoes" className="text-sm text-gray-400 hover:text-[#1C2E4A] mb-4 inline-block transition-colors">
            ← Voltar para Coleções
          </a>
          <h1 className="font-monigue text-5xl md:text-7xl text-[#1C2E4A] tracking-wider mt-2">
            {info.titulo}
          </h1>
          <p className="text-xl text-gray-500 font-light mt-2">
            {info.subtitulo}
          </p>
        </div>

        {/* LISTA DE PRODUTOS */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1C2E4A]"></div>
          </div>
        ) : produtos.length === 0 ? (
          <p className="text-gray-500 text-lg">Nenhum produto cadastrado nesta coleção ainda.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {produtos.map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative group border border-gray-50">
                <a href={`/produto/${product.id}`} className="block cursor-pointer flex-grow">
                  {product.imagem ? (
                    <img
                      src={product.imagem}
                      alt={product.nome}
                      className="h-56 w-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="h-56 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                      Sem imagem
                    </div>
                  )}
                  <div className="mt-5 mb-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-gray-900 leading-tight">{product.nome}</h3>
                      {product.badge && <span className="text-xs bg-[#1C2E4A] text-white px-2 py-1 rounded-md">{product.badge}</span>}
                    </div>
                    <p className="mt-3 font-black text-lg text-[#1C2E4A]">R$ {Number(product.preco).toFixed(2).replace('.', ',')}</p>
                  </div>
                </a>
                <button
                  className="w-full bg-transparent border-2 border-[#1C2E4A] text-[#1C2E4A] group-hover:bg-[#1C2E4A] group-hover:text-white py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors mt-auto z-10"
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
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-[#D9D7CF] py-16 border-t-[6px] border-[#1C2E4A] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <p className="font-monigue text-6xl tracking-widest mb-2">El Roi</p>
          <p className="text-sm font-light text-gray-500 uppercase tracking-widest">© {new Date().getFullYear()} El Roi.</p>
        </div>
      </footer>
    </div>
  );
}