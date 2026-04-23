'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/admin-api-client';

type Pedido = {
  created_at: string;
  email_cliente: string;
  id: string;
  itens: Array<{ nome: string; preco: number; quantidade: number; tamanho?: string }>;
  nome_cliente: string;
  status: string;
  total: number;
};

type Produto = {
  categoria: string;
  estoque: number;
  id: string;
  nome: string;
  preco: number;
};

type OrdersResponse = {
  orders: Pedido[];
};

type ProductsResponse = {
  products: Produto[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}

export default function SalesPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [ordersResponse, productsResponse] = await Promise.all([
          adminApiFetch<OrdersResponse>('/api/admin/orders'),
          adminApiFetch<ProductsResponse>('/api/admin/products'),
        ]);

        setPedidos(ordersResponse.orders);
        setProdutos(productsResponse.products);
        setError(null);
      } catch (fetchError) {
        const message = getErrorMessage(fetchError);

        if (message.includes('Nao autorizado')) {
          router.replace('/admin');
          return;
        }

        console.error('Erro ao carregar dashboard de vendas:', fetchError);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [router]);

  const totalVendas = pedidos.filter(
    (pedido) => pedido.status === 'Pago' || pedido.status === 'Enviado'
  ).length;

  const totalReceita = pedidos
    .filter((pedido) => pedido.status === 'Pago' || pedido.status === 'Enviado')
    .reduce((sum, pedido) => sum + (Number(pedido.total) || 0), 0);

  const pedidosPendentes = pedidos.filter((pedido) => pedido.status === 'Pendente').length;

  const totalItens = pedidos
    .filter((pedido) => pedido.status === 'Pago' || pedido.status === 'Enviado')
    .reduce(
      (sum, pedido) =>
        sum +
        (pedido.itens?.reduce(
          (itemSum, item) => itemSum + (item.quantidade || 1),
          0
        ) || 0),
      0
    );

  const produtosEstoque = produtos.map((produto) => ({
    ...produto,
    statusEstoque:
      produto.estoque === 0 ? 'esgotado' : produto.estoque < 10 ? 'baixo' : 'ok',
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-elroi-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-elroi-blue text-sm font-black text-white">
              ER
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-gray-900">
                Dashboard de Vendas
              </h1>
              <p className="text-xs leading-tight text-gray-400">Metricas e relatorio</p>
            </div>
          </div>
          <Link href="/admin" className="text-xs font-medium text-gray-500 hover:underline">
            Voltar ao Painel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Receita Total"
            value={`R$ ${totalReceita.toFixed(2).replace('.', ',')}`}
          />
          <MetricCard label="Vendas Confirmadas" value={totalVendas} />
          <MetricCard
            label="Pedidos Pendentes"
            value={pedidosPendentes}
            alert={pedidosPendentes > 0}
          />
          <MetricCard label="Itens Vendidos" value={totalItens} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-50 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-800">Estoque de Produtos</h2>
            </div>
            <div className="max-h-80 overflow-x-auto overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-400">
                      Produto
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-400">
                      Preco
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-400">
                      Estoque
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {produtosEstoque.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="max-w-32 truncate text-sm font-medium text-gray-900">
                          {produto.nome}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                            produto.statusEstoque === 'esgotado'
                              ? 'bg-red-50 text-red-700'
                              : produto.statusEstoque === 'baixo'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {produto.estoque} un
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {produto.statusEstoque === 'esgotado' ? (
                          <span className="text-red-600">Esgotado</span>
                        ) : produto.statusEstoque === 'baixo' ? (
                          <span className="text-amber-600">Baixo</span>
                        ) : (
                          <span className="text-green-600">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {produtosEstoque.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-50 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-800">Historico de Pedidos</h2>
            </div>
            <div className="max-h-80 overflow-x-auto overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-400">
                      Data
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-400">
                      Cliente
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-400">
                      Total
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pedidos.length > 0 ? (
                    pedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-500">
                            {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-32 truncate text-sm font-medium text-gray-900">
                            {pedido.nome_cliente}
                          </p>
                          <p className="max-w-32 truncate text-xs text-gray-400">
                            {pedido.email_cliente}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                              pedido.status === 'Enviado'
                                ? 'bg-blue-50 text-blue-700'
                                : pedido.status === 'Pago'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {pedido.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                        Nenhum pedido registrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {!loading && pedidos.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-50 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-800">Produtos Mais Vendidos</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getTopProducts(pedidos).map((item, index) => (
                  <div
                    key={item.nome}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-elroi-blue">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{item.nome}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{item.qty}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  alert,
}: {
  alert?: boolean;
  label: string;
  value: number | string;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 ${
        alert ? 'border-amber-200' : 'border-gray-100'
      }`}
    >
      <p
        className={`text-2xl font-bold leading-tight ${
          alert ? 'text-amber-600' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-400">{label}</p>
    </div>
  );
}

function getTopProducts(pedidos: Pedido[]) {
  const productCounts: Record<string, number> = {};

  for (const pedido of pedidos) {
    for (const item of pedido.itens || []) {
      productCounts[item.nome] = (productCounts[item.nome] || 0) + (item.quantidade || 1);
    }
  }

  return Object.entries(productCounts)
    .map(([nome, qty]) => ({ nome, qty }))
    .sort((left, right) => right.qty - left.qty)
    .slice(0, 6);
}
