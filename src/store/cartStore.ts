import { create } from 'zustand';

export type CartItem = {
  id: string;
  nome: string;
  preco: number;
  tamanho: 'P' | 'M' | 'G' | 'GG' | string;
  imagem: string;
  quantidade: number;
};

type CartState = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, tamanho?: string) => void;
  updateQuantity: (id: string, tamanho: string, quantidade: number) => void;
  clearCart: () => void;
  total: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (item) => {
    set((state) => {
      const found = state.items.find((i) => i.id === item.id && i.tamanho === item.tamanho);
      if (found) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && i.tamanho === item.tamanho
              ? { ...i, quantidade: i.quantidade + item.quantidade }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    });
  },
  removeFromCart: (id, tamanho) => {
    set((state) => ({
      items: state.items.filter((item) => (tamanho ? !(item.id === id && item.tamanho === tamanho) : item.id !== id)),
    }));
  },
  updateQuantity: (id, tamanho, quantidade) => {
    if (quantidade <= 0) {
      get().removeFromCart(id, tamanho);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.tamanho === tamanho ? { ...item, quantidade } : item
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  total: () => {
    const items = get().items;
    return items.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  },
}));
