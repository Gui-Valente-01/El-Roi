import { create } from 'zustand';

export type CartItem = {
  id: string;
  nome: string;
  preco: number;
  tamanho: string;
  imagem: string;
  descricao?: string;
  quantidade: number;
};

type CartState = {
  items: CartItem[];
  initialized: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, tamanho?: string) => void;
  updateQuantity: (id: string, tamanho: string, quantidade: number) => void;
  clearCart: () => void;
  total: () => number;
  getItemCount: () => number;
  init: () => void;
};

const STORAGE_KEY = 'elroi-cart';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  initialized: false,

  init: () => {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const items = JSON.parse(data) as CartItem[];
        set({ items, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }
  },

  addToCart: (item) => {
    set((state) => {
      const found = state.items.find(
        (i) => i.id === item.id && i.tamanho === item.tamanho,
      );
      const newItems = found
        ? state.items.map((i) =>
            i.id === item.id && i.tamanho === item.tamanho
              ? { ...i, quantidade: i.quantidade + item.quantidade }
              : i,
          )
        : [...state.items, item];

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      }
      return { items: newItems };
    });
  },

  removeFromCart: (id, tamanho) => {
    set((state) => {
      const newItems = state.items.filter((item) =>
        tamanho ? !(item.id === id && item.tamanho === tamanho) : item.id !== id,
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      }
      return { items: newItems };
    });
  },

  updateQuantity: (id, tamanho, quantidade) => {
    if (quantidade <= 0) {
      get().removeFromCart(id, tamanho);
      return;
    }
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === id && item.tamanho === tamanho ? { ...item, quantidade } : item,
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      }
      return { items: newItems };
    });
  },

  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ items: [] });
  },

  total: () => {
    return get().items.reduce(
      (sum, item) => sum + item.preco * item.quantidade,
      0,
    );
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantidade, 0);
  },
}));
