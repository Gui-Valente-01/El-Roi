import { create } from 'zustand';

export type Sale = {
  id: string;
  date: string;
  items: { nome: string; preco: number; quantidade: number }[];
  total: number;
};

type SalesState = {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => void;
  getTotalSales: () => number;
  getTotalRevenue: () => number;
};

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [
    {
      id: '1',
      date: new Date(Date.now() - 86400000).toISOString(),
      items: [{ nome: 'T-Shirt Perto Está', preco: 129.9, quantidade: 2 }],
      total: 259.8,
    },
    {
      id: '2',
      date: new Date(Date.now() - 172800000).toISOString(),
      items: [{ nome: 'Moletom Ele Vive', preco: 189.9, quantidade: 1 }],
      total: 189.9,
    },
  ],
  addSale: (sale) =>
    set((state) => ({
      sales: [
        ...state.sales,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          ...sale,
        },
      ],
    })),
  getTotalSales: () => {
    const sales = get().sales;
    return sales.reduce((sum, sale) => sum + sale.items.reduce((qty, item) => qty + item.quantidade, 0), 0);
  },
  getTotalRevenue: () => {
    const sales = get().sales;
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  },
}));
