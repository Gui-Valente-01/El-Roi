# El Roi - E-commerce de Streetwear Cristão

Projeto de e-commerce Next.js com React, TypeScript e Tailwind CSS para a marca **El Roi** - "O Deus que me vê".

## 📋 Estrutura do Projeto

```
site/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Layout raiz
│   │   ├── page.tsx          # Página inicial
│   │   └── globals.css       # Estilos globais
├── tailwind.config.ts        # Configuração Tailwind
├── next.config.js            # Configuração Next.js
├── tsconfig.json             # Configuração TypeScript
├── postcss.config.js         # Configuração PostCSS
├── package.json              # Dependências
└── .gitignore                # Arquivos ignorados
```

## 🎨 Design System

As cores foram configuradas no arquivo `tailwind.config.ts`:

- **elroi-blue**: #1C2E4A (Azul Escuro)
- **elroi-sand**: #D9D7CF (Areia)
- **elroi-gray**: #3C3C3C (Cinza Chumbo)
- **elroi-lightblue**: #E6ECFD (Azul Claro/Gelo)
- **elroi-black**: #111111 (Preto)

As variáveis CSS também estão em `src/app/globals.css` para uso direto em `style={}`.

## 🚀 Como Começar

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

Acesso em: `http://localhost:3000`

### 3. Build para produção

```bash
npm run build
npm start
```

## 📦 Componentes

### Página Inicial (`src/app/page.tsx`)

Contém todas as seções:

1. **Faixa de Aviso** - "Frete Grátis acima de R$ 299"
2. **Header Sticky** - Navegação e carrinho
3. **Hero Section** - "O Deus que me vê"
4. **Seção de Promoção** - Combo com CTA
5. **Seção de Coleções** - 2 cards com hover
6. **Vitrine de Produtos** - 4 produtos em grid
7. **Footer** - Rodapé com informações

## 🎯 Próximos Passos

- [ ] Adicionar imagens reais (substituir `[Imagem da Camiseta Aqui]`)
- [ ] Implementar carrinho de compras com Zustand/Context
- [ ] Integrar com Supabase (autenticação e banco de dados)
- [ ] Configurar pagamentos (Stripe/Mercado Pago)
- [ ] Criar páginas de detalhes de produtos
- [ ] Adicionar filtros e busca

## 📱 Responsividade

O projeto usa **mobile-first** com Tailwind CSS:
- Mobile: base
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)

## 🔧 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **React 18** - Biblioteca UI

---

**El Roi** - Moda como ponte, entre o céu e a rua.
