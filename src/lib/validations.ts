import { z } from 'zod';

// Validação para item do carrinho no checkout
export const CartItemSchema = z.object({
  id: z.string().min(1, 'ID do produto é obrigatório'),
  nome: z.string().min(1, 'Nome do produto é obrigatório'),
  preco: z.number().positive('Preço deve ser maior que zero'),
  tamanho: z.string().min(1, 'Tamanho é obrigatório'),
  imagem: z.string().url('Imagem deve ser uma URL válida').optional(),
  quantidade: z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
});

// Validação para o request de checkout
export const CheckoutRequestSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Carrinho não pode estar vazio'),
});

// Validação para produto
export const ProdutoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  preco: z.number().positive('Preço deve ser positivo'),
  tamanho: z.string().default('M'),
  imagem: z.string().url().optional(),
  badge: z.string().optional(),
  estoque: z.number().int().min(0, 'Estoque não pode ser negativo'),
});

// Validação para credenciais de admin
export const AdminLoginSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
export type Produto = z.infer<typeof ProdutoSchema>;
export type AdminLogin = z.infer<typeof AdminLoginSchema>;
