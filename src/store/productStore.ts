import { create } from 'zustand';
import { products as mockProducts } from '@/data/products';

export type Product = {
  id: string;
  nome: string;
  preco: number;
  tamanho: 'P' | 'M' | 'G' | 'GG' | string;
  imagem: string;
  badge?: string;
  estoque: number;
  descricao?: string;
  colecao?: string;
  novo?: boolean;
};

type ProductState = {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  reduceStock: (id: string, amount: number) => void;
};

// Mapear dados do arquivo de mock para o formato interno
const initialProducts: Product[] = mockProducts.map((p) => ({
  id: p.id,
  nome: p.name,
  preco: p.price,
  tamanho: p.sizes[0] || 'M',
  imagem: p.images[0] || '',
  badge: p.isNew ? 'NOVO' : undefined,
  estoque: 50,
  descricao: p.description,
  colecao: p.collection,
  novo: p.isNew,
}));

export const useProductStore = create<ProductState>((set) => ({
  products: initialProducts,
  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          ...product,
        },
      ],
    })),
  updateProduct: (id, updated) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  reduceStock: (id, amount) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, estoque: Math.max(0, p.estoque - amount) } : p)),
    })),
}));