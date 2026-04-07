'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type Pedido = {
  id: string;
  created_at: string;
  nome_cliente: string;
  email_cliente: string;
  endereco: string;
  itens: Array<{ nome: string; quantidade: number; tamanho?: string }>;
  total: number;
  status: string;
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('Todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPedidos(data);
    else console.error('Erro ao buscar pedidos:', error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const atualizarStatus = async (id: string, novoStatus: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('pedidos').update({ status: novoStatus }).eq('id', id);
    if (!error) {
      setPedidos(pedidos.map(p => (p.id === id ? { ...p, status: novoStatus } : p)));
    }
    setUpdatingId(null);
  };

  const pedidosFiltrados = filter === 'Todos' ? pedidos : pedidos.filter(p => p.status === filter);
  const counts = {
    Todos: pedidos.length,
    Pendente: pedidos.filter(p => p.status === 'Pendente').length,
    Pago: pedidos.filter(p => p.status === 'Pago').length,
    Enviado: pedidos.filter(p => p.status === 'Enviado').length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Filtrar:</span>
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === status
                ? 'bg-elroi-blue text-white border-elroi-blue'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {status} <span className="opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm text-gray-400 font-medium">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map(pedido => {
            const isExpanded = expandedId === pedido.id;
            return (
              <div
                key={pedido.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition"
              >
                <div
                  className="px-5 py-4 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : pedido.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      {/* Status indicator */}
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        pedido.status === 'Enviado' ? 'bg-blue-500' :
                        pedido.status === 'Pago' ? 'bg-green-500' :
                        'bg-amber-500'
                      }`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{pedido.nome_cliente || 'Sem nome'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-6 sm:ml-0">
                      <span className="text-sm font-bold text-gray-900">
                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                      </span>
                      <select
                        value={pedido.status}
                        onChange={e => { e.stopPropagation(); atualizarStatus(pedido.id, e.target.value); }}
                        disabled={updatingId === pedido.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer outline-none disabled:opacity-50 ${
                          pedido.status === 'Enviado' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                          pedido.status === 'Pago' ? 'border-green-200 text-green-700 bg-green-50' :
                          'border-amber-200 text-amber-700 bg-amber-50'
                        }`}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                        <option value="Enviado">Enviado</option>
                      </select>
                      <svg
                        className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Endereco de Entrega</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                          {pedido.endereco || 'Nao informado'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Email: {pedido.email_cliente || 'Nao informado'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Itens</h4>
                        <div className="space-y-2">
                          {pedido.itens?.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                              <span className="font-medium text-gray-900">{item.quantidade}x {item.nome}</span>
                              {item.tamanho && (
                                <span className="text-xs text-gray-400 font-medium bg-white px-2 py-0.5 rounded">
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
