'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApiFetch } from '@/lib/admin-api-client';

type Pedido = {
  created_at: string;
  email_cliente: string;
  endereco: string;
  id: string;
  itens: Array<{ nome: string; quantidade: number; tamanho?: string }>;
  nome_cliente: string;
  status: string;
  total: number;
};

type OrdersResponse = {
  orders: Pedido[];
};

type OrderResponse = {
  order: Pedido;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}

export default function AdminPedidos({
  onSessionExpired,
}: {
  onSessionExpired?: () => void;
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('Todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);

    try {
      const response = await adminApiFetch<OrdersResponse>('/api/admin/orders');
      setPedidos(response.orders);
    } catch (fetchError) {
      const message = getErrorMessage(fetchError);

      if (message.includes('Nao autorizado')) {
        onSessionExpired?.();
      } else {
        console.error('Erro ao buscar pedidos:', fetchError);
      }
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const atualizarStatus = async (id: string, novoStatus: string) => {
    setUpdatingId(id);

    try {
      const response = await adminApiFetch<OrderResponse>(`/api/admin/orders/${id}`, {
        body: JSON.stringify({ status: novoStatus }),
        method: 'PATCH',
      });

      setPedidos((currentOrders) =>
        currentOrders.map((pedido) => (pedido.id === id ? response.order : pedido))
      );
    } catch (updateError) {
      const message = getErrorMessage(updateError);

      if (message.includes('Nao autorizado')) {
        onSessionExpired?.();
      } else {
        console.error('Erro ao atualizar pedido:', updateError);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const pedidosFiltrados =
    filter === 'Todos' ? pedidos : pedidos.filter((pedido) => pedido.status === filter);

  const counts = {
    Enviado: pedidos.filter((pedido) => pedido.status === 'Enviado').length,
    Pago: pedidos.filter((pedido) => pedido.status === 'Pago').length,
    Pendente: pedidos.filter((pedido) => pedido.status === 'Pendente').length,
    Todos: pedidos.length,
  };

  if (loading) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-12">
        {[1, 2, 3].map((row) => (
          <div key={row} className="h-24 animate-pulse rounded-xl bg-gray-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Filtrar:
        </span>
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              filter === status
                ? 'border-elroi-blue bg-elroi-blue text-white'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            {status} <span className="opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-16 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-sm font-medium text-gray-400">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map((pedido) => {
            const isExpanded = expandedId === pedido.id;

            return (
              <div
                key={pedido.id}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white transition hover:shadow-sm"
              >
                <div
                  className="cursor-pointer select-none px-5 py-4"
                  onClick={() => setExpandedId(isExpanded ? null : pedido.id)}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          pedido.status === 'Enviado'
                            ? 'bg-blue-500'
                            : pedido.status === 'Pago'
                              ? 'bg-green-500'
                              : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {pedido.nome_cliente || 'Sem nome'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="ml-6 flex items-center gap-4 sm:ml-0">
                      <span className="text-sm font-bold text-gray-900">
                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                      </span>
                      <select
                        value={pedido.status}
                        onChange={(event) => {
                          event.stopPropagation();
                          void atualizarStatus(pedido.id, event.target.value);
                        }}
                        disabled={updatingId === pedido.id}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold outline-none disabled:opacity-50 ${
                          pedido.status === 'Enviado'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : pedido.status === 'Pago'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                        <option value="Enviado">Enviado</option>
                      </select>
                      <svg
                        className={`h-4 w-4 text-gray-300 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-50 px-5 pb-5 pt-4">
                    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Endereco de Entrega
                        </h4>
                        <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">
                          {pedido.endereco || 'Nao informado'}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          Email: {pedido.email_cliente || 'Nao informado'}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Itens
                        </h4>
                        <div className="space-y-2">
                          {pedido.itens?.map((item, index) => (
                            <div
                              key={`${pedido.id}-${index}`}
                              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                            >
                              <span className="font-medium text-gray-900">
                                {item.quantidade}x {item.nome}
                              </span>
                              {item.tamanho && (
                                <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-gray-400">
                                  Tam: {item.tamanho}
                                </span>
                              )}
                            </div>
                          ))}
                          {!pedido.itens && (
                            <p className="text-xs text-gray-400">Detalhes nao disponiveis</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
