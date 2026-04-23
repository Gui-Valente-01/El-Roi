import { z } from 'zod';

const ImageValueSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' || value.startsWith('data:image/') || /^https?:\/\//.test(value),
    'Imagem deve ser uma URL http(s) ou data URL valida.'
  );

export const CartItemSchema = z.object({
  descricao: z.string().trim().optional(),
  id: z.string().trim().min(1, 'ID do produto e obrigatorio.'),
  imagem: ImageValueSchema.optional(),
  nome: z.string().trim().min(1, 'Nome do produto e obrigatorio.'),
  preco: z.number().positive('Preco deve ser maior que zero.'),
  quantidade: z.number().int().min(1, 'Quantidade deve ser pelo menos 1.'),
  tamanho: z.string().trim().min(1, 'Tamanho e obrigatorio.'),
});

export const CheckoutCustomerSchema = z.object({
  email: z.string().trim().email('Informe um email valido.'),
  endereco: z.string().trim().min(8, 'Informe um endereco de entrega valido.'),
  nome: z.string().trim().min(3, 'Informe o nome completo.'),
  telefone: z.string().trim().max(30).optional().default(''),
});

export const CheckoutRequestSchema = z.object({
  cliente: CheckoutCustomerSchema,
  items: z.array(CartItemSchema).min(1, 'Carrinho nao pode estar vazio.'),
});

export const ProdutoSchema = z.object({
  badge: z.string().trim().max(60).optional().default(''),
  categoria: z.string().trim().min(1, 'Categoria e obrigatoria.'),
  descricao: z.string().trim().max(4000).optional().default(''),
  estoque: z.number().int().min(0, 'Estoque nao pode ser negativo.'),
  imagem: ImageValueSchema.optional().default(''),
  nome: z.string().trim().min(1, 'Nome e obrigatorio.').max(255),
  preco: z.number().nonnegative('Preco nao pode ser negativo.'),
  tamanho: z.string().trim().min(1, 'Tamanho e obrigatorio.').default('M'),
});

export const ProdutoPatchSchema = ProdutoSchema.partial();

export const AdminLoginSchema = z.object({
  token: z.string().trim().min(1, 'Token e obrigatorio.'),
});

export const PedidoStatusSchema = z.object({
  status: z.enum(['Pendente', 'Pago', 'Enviado']),
});

export type AdminLogin = z.infer<typeof AdminLoginSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type CheckoutCustomer = z.infer<typeof CheckoutCustomerSchema>;
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
export type PedidoStatusInput = z.infer<typeof PedidoStatusSchema>;
export type Produto = z.infer<typeof ProdutoSchema>;
export type ProdutoPatch = z.infer<typeof ProdutoPatchSchema>;
