'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Pedido = {
  id: string;
  created_at: string;
  nome_cliente: string;
  email_cliente: string;
  endereco: string;
  itens: any[];
  total: number;
  status: string;
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os pedidos no banco de dados
  useEffect(() => {
    const fetchPedidos = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false }); // Mostra o mais recente no topo

      if (error) {
        console.error("Erro ao buscar pedidos:", error);
      } else {
        setPedidos(data || []);
      }
      setLoading(false);
    };

    fetchPedidos();
  }, []);

  // Atualiza o status do pedido (Pendente -> Pago -> Enviado)
  const atualizarStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', id);

    if (!error) {
      setPedidos(pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    } else {
      alert("Erro ao atualizar status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#1C2E4A]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100">
      <h2 className="font-monigue text-4xl text-[#1C2E4A] tracking-widest mb-8">Últimos Pedidos</h2>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 font-bold tracking-wider uppercase">Nenhum pedido recebido ainda</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="border border-gray-200 rounded-2xl p-6 bg-[#F8F9FA] hover:shadow-md transition-all">
              
              {/* Cabeçalho do Pedido */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-black text-[#1C2E4A] uppercase tracking-wider">{pedido.nome_cliente}</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {new Date(pedido.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })} 
                    <span className="mx-2">|</span> 
                    {pedido.email_cliente}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-black text-2xl text-green-600">
                    R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                  </span>
                  <select 
                    value={pedido.status}
                    onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                    className={`font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl border-2 cursor-pointer outline-none transition-all shadow-sm ${
                      pedido.status === 'Enviado' ? 'border-green-500 text-green-700 bg-green-50' :
                      pedido.status === 'Pago' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                      'border-orange-500 text-orange-700 bg-orange-50'
                    }`}
                  >
                    <option value="Pendente">⏳ Pendente</option>
                    <option value="Pago">✅ Pago</option>
                    <option value="Enviado">📦 Enviado</option>
                  </select>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gray-200 mb-6"></div>

              {/* Informações de Entrega e Itens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Endereço */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Endereço de Entrega</h4>
                  <p className="text-sm text-gray-700 font-medium bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {pedido.endereco}
                  </p>
                </div>

                {/* Lista de Produtos */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Itens Comprados</h4>
                  <ul className="space-y-2">
                    {pedido.itens?.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <span className="font-bold text-[#1C2E4A]">{item.quantidade}x {item.nome}</span>
                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-bold text-xs">Tam: {item.tamanho}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}