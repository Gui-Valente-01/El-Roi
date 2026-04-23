export type StaticCatalogItem = {
  descricao?: string;
  id: string;
  imagem?: string;
  nome: string;
  preco: number;
};

const STATIC_CATALOG_ITEMS: Record<string, StaticCatalogItem> = {
  'combo-1': {
    descricao: 'Combo promocional com T-Shirt e Moletom El Roi.',
    id: 'combo-1',
    imagem:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
    nome: 'Combo Especial T-Shirt + Moletom',
    preco: 249.9,
  },
};

export function getStaticCatalogItem(id: string) {
  return STATIC_CATALOG_ITEMS[id] || null;
}
