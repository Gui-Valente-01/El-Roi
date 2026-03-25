export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  sizes: string[];
  images: string[];
  collection: string;
  isNew?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'T-Shirt Perto Está',
    price: 129.9,
    description: 'Camiseta premium em 100% algodão com mensagem que reforça nossa fé. Perto Está para aqueles que entendem que Deus está próximo em cada momento. Corte confortável e acabamento reforçado. Moda como ponte entre o céu e a rua.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['/placeholder-1.jpg', '/placeholder-2.jpg'],
    collection: 'Coleção Gênesis',
    isNew: true,
  },
  {
    id: '2',
    name: 'Moletom Ele Vive',
    price: 189.9,
    description: 'Moletom unissex em algodão premium com forro fleece interno. A mensagem "Ele Vive" representa a esperança e a vida eterna. Corte oversized moderno, perfeito para usar no dia a dia. Acabamento com cordão reforçado e bolsos laterais. Estilo autêntico com propósito.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['/placeholder-3.jpg', '/placeholder-4.jpg'],
    collection: 'Coleção Gênesis',
  },
  {
    id: '3',
    name: 'T-Shirt Oversized Areia',
    price: 119.9,
    description: 'Camiseta versátil em cores neutras que refletem serenidade. Corte oversized moderno para máximo conforto. 100% algodão premium com gravação premium. Perfeita para criar looks casual ou streetwear. A areia simboliza estabilidade e fundação na fé. Essencial do guarda-roupa.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['/placeholder-5.jpg', '/placeholder-6.jpg'],
    collection: 'Linha Essenciais',
  },
  {
    id: '4',
    name: 'Boné Jerusalém',
    price: 89.9,
    description: 'Boné ajustável em algodão 100% com bordado de alta qualidade. "Jerusalém" representa o lugar sagrado, a busca espiritual. Design minimalista com logo bordado em contraste. Perfeito para proteger do sol enquanto expressa sua fé. Acessório indispensável para qualquer estilo.',
    sizes: ['U'],
    images: ['/placeholder-7.jpg', '/placeholder-8.jpg'],
    collection: 'Acessórios',
  },
  {
    id: '5',
    name: 'Calça Bairro Santo',
    price: 149.9,
    description: 'Calça em sarja premium com corte street moderno. "Bairro Santo" celebra comunidades que vivem a fé no dia a dia. Ajuste confortável com detalhe de bolsos laterais. Cores sólidas que combinam com qualquer proposta de look. Qualidade que dura e estilo que permanece.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['/placeholder-9.jpg', '/placeholder-10.jpg'],
    collection: 'Línea Essenciais',
    isNew: true,
  },
  {
    id: '6',
    name: 'Jaqueta Graça',
    price: 249.9,
    description: 'Jaqueta em nylon 100% resistente com forro de algodão. "Graça" reflete nossa missão: levar fé e estilo para as ruas. Corte oversized com capuz destacável. Bolsos funcionais e detalhe de zíper de qualidade. Peça essencial para proteção e estilo com propósito. Moda que transcende o material.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['/placeholder-11.jpg', '/placeholder-12.jpg'],
    collection: 'Coleção Premium',
  },
  {
    id: '7',
    name: 'Bermuda Êxodo',
    price: 99.9,
    description: 'Bermuda confortável em sarja premium para o verão. "Êxodo" representa a jornada de fé e liberdade. Corte reto com ajuste perfeito. Cores neutras que combinam com qualquer camiseta da El Roi. Perfeita para looks casual streetwear. Qualidade durável para quem acredita em propósito.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['/placeholder-13.jpg', '/placeholder-14.jpg'],
    collection: 'Linha Essenciais',
  },
  {
    id: '8',
    name: 'Hoodie Testemunho',
    price: 179.9,
    description: 'Hoodie em algodão premium com design minimalista. "Testemunho" é o poder da sua história de fé. Corte confortável com bolso canguru e capuz reforçado. Cores que refletem a identidade El Roi. Peça versátil para qualquer estação. Moda que fala por você.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['/placeholder-15.jpg', '/placeholder-16.jpg'],
    collection: 'Coleção Premium',
    isNew: true,
  },
];
