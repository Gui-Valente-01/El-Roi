'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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

const colecoesInfo: Record<string, { titulo: string; subtitulo: string; filtroCategoria: string }> =
{
  genesis: {
    titulo: 'Gênesis',
    subtitulo: 'Novos começos, estilo raiz.',
    filtroCategoria: 'Genese',
  },
  essenciais: {
    titulo: 'Essenciais',
    subtitulo: 'Básicos com mensagem forte.',
    filtroCategoria: 'Essenciais',
  },
  inverno26: {
    titulo: 'Inverno 2026',
    subtitulo: 'Aqueça sua fé.',
    filtroCategoria: 'Inverno',
  },
};

export default function ColecaoInternaPage() {
  const params = useParams();
  const idColecao = params.id as string;
  const info = colecoesInfo[idColecao] || {
    titulo: 'Coleção Exclusiva',
    subtitulo: 'Peças selecionadas.',
    filtroCategoria: '',
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const init = useCartStore((state) => state.init);
  const addToCart = useCartStore((state) => state.addToCart);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    init();
  }, [init]);

  const [produtos, setProdutos] = useState<ProdutoDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        let query = (supabase as any).from('produtos').select('*');

        // Se temos um filtro de categoria, aplica
        if (info.filtroCategoria) {
          const filtro = info.filtroCategoria;
          query = query.ilike('categoria', `%${filtro}%`);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        if (data) setProdutos(data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [info.filtroCategoria]);

  const handleAddToCart = (product: ProdutoDB) => {
    addToCart({
      id: product.id,
      nome: product.nome,
      preco: product.preco,
      tamanho: product.tamanho || 'M',
      imagem: product.imagem,
      descricao: product.descricao,
      quantidade: 1,
    });
    setIsCartOpen(true);
  };

  return (
    <div className="font-sans text-elroi-gray bg-[#F8F9FA] min-h-screen">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Header simplificado com back */}
      <header className="sticky top-0 z-40 bg-[#1C2E4A] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link href="/" className="font-monigue text-4xl tracking-widest text-[#D9D7CF] hover:opacity-80 transition">
            El Roi
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-white uppercase tracking-wider">
            <Link href="/" className="hover:text-[#D9D7CF] transition-colors">Início</Link>
            <Link href="/colecoes" className="text-[#D9D7CF] border-b-2 border-[#D9D7CF]">Coleções</Link>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 border-b border-gray-200 pb-8">
          <Link href="/colecoes" className="text-sm text-gray-400 hover:text-[#1C2E4A] mb-4 inline-block transition-colors">
            ← Voltar para Coleções
          </Link>
          <h1 className="font-monigue text-5xl md:text-7xl text-[#1C2E4A] tracking-wider mt-2">
            {info.titulo}
          </h1>
          <p className="text-xl text-gray-500 font-light mt-2">{info.subtitulo}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1C2E4A]" />
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Nenhum produto nesta coleção ainda.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {produtos.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-gray-50"
              >
                <Link href={`/produto/${product.id}`} className="block cursor-pointer flex-grow">
                  {product.imagem ? (
                    <Image
                      src={product.imagem}
                      alt={product.nome}
                      width={640}
                      height={640}
                      unoptimized
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
                      {product.badge && (
                        <span className="text-xs bg-[#1C2E4A] text-white px-2 py-1 rounded-md whitespace-nowrap">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 font-black text-lg text-[#1C2E4A]">
                      R$ {Number(product.preco).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </Link>

                <button
                  className="w-full bg-transparent border-2 border-[#1C2E4A] text-[#1C2E4A] group-hover:bg-[#1C2E4A] group-hover:text-white py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors mt-auto z-10"
                  disabled={product.estoque <= 0}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                >
                  {product.estoque <= 0 ? 'Esgotado' : 'Adicionar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-[#D9D7CF] py-16 border-t-[6px] border-[#1C2E4A] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <p className="font-monigue text-6xl tracking-widest mb-2">El Roi</p>
          <p className="font-collsmith text-3xl text-gray-400 mb-8">
            Moda como ponte, entre o céu e a rua
          </p>
          <div className="w-24 h-[1px] bg-gray-700 mb-8"></div>
          <p className="text-sm font-light text-gray-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} El Roi. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
