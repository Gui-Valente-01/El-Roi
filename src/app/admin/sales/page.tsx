'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = 'admin123';

type Pedido = {
  id: string;
  created_at: string;
  nome_cliente: string;
  email_cliente: string;
  endereco: string;
  itens: Array<{ nome: string; preco: number; quantidade: number; tamanho?: string }>;
  total: number;
  status: string;
};

type Produto = {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  categoria: string;
};

export default function SalesPage() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem('elroi-admin-auth');
    if (saved === 'true') {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchData();
    }
  }, [loggedIn]);

  const fetchData = async () => {
    setLoading(true);
    const [pedidosRes, produtosRes] = await Promise.all([
      supabase.from('pedidos').select('*').order('created_at', { ascending: false }),
      supabase.from('produtos').select('id, nome, preco, estoque, categoria'),
    ]);

    if (pedidosRes.data) setPedidos(pedidosRes.data);
    else console.error('Erro ao buscar pedidos:', pedidosRes.error);

    if (produtosRes.data) setProdutos(produtosRes.data);
    else console.error('Erro ao buscar produtos:', produtosRes.error);

    setLoading(false);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      window.localStorage.setItem('elroi-admin-auth', 'true');
      setLoggedIn(true);
      setError(null);
      setPassword('');
      return;
    }
    setError('Senha incorreta. Tente novamente.');
  };

  // Metrics
  const totalVendas = pedidos.filter(p => p.status === 'Pago' || p.status === 'Enviado').length;
  const totalReceita = pedidos
    .filter(p => p.status === 'Pago' || p.status === 'Enviado')
    .reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  const pedidosPendentes = pedidos.filter(p => p.status === 'Pendente').length;
  const totalItens = pedidos
    .filter(p => p.status === 'Pago' || p.status === 'Enviado')
    .reduce((sum, p) => sum + (p.itens?.reduce((iSum, i) => iSum + (i.quantidade || 1), 0) || 0), 0);

  // Estoque
  const produtosEstoque = produtos.map(p => ({
    ...p,
    statusEstoque: p.estoque === 0 ? 'esgotado' : p.estoque < 10 ? 'baixo' : 'ok',
  }));

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-elroi-blue text-white rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg">
            ER
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard de Vendas</h1>
          <p className="text-sm text-gray-400 mb-8">El Roi — Acesso restrito</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm focus:ring-2 focus:ring-elroi-blue focus:border-transparent outline-none transition"
            placeholder="Senha administrativa"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-elroi-blue text-white py-3 rounded-xl font-semibold text-sm hover:bg-elroi-black transition-all"
          >
            Entrar
          </button>
          {error && <p className="text-xs text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-elroi-blue text-white rounded-lg flex items-center justify-center text-sm font-black">ER</div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Dashboard de Vendas</h1>
              <p className="text-xs text-gray-400 leading-tight">Metricas e relatorio</p>
            </div>
          </div>
          <a href="/admin" className="text-xs text-gray-500 hover:underline font-medium">
            ← Voltar ao Painel
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Receita Total" value={`R$ ${totalReceita.toFixed(2).replace('.', ',')}`} />
          <MetricCard label="Vendas Confirmadas" value={totalVendas} />
          <MetricCard label="Pedidos Pendentes" value={pedidosPendentes} alert={pedidosPendentes > 0} />
          <MetricCard label="Itens Vendidos" value={totalItens} />
        </div>

        {/* Inventory + Sales History */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Estoque */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-800">Estoque de Produtos</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Produto</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Preco</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Estoque</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {produtosEstoque.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32">{p.nome}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">R$ {Number(p.preco).toFixed(2).replace('.', ',')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.statusEstoque === 'esgotado' ? 'bg-red-50 text-red-700' :
                            p.statusEstoque === 'baixo' ? 'bg-amber-50 text-amber-700' :
                            'bg-green-50 text-green-700'
                          }`}>{p.estoque} un</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium">
                          {p.statusEstoque === 'esgotado' ? <span className="text-red-600">Esgotado</span> :
                           p.statusEstoque === 'baixo' ? <span className="text-amber-600">Baixo</span> :
                           <span className="text-green-600">OK</span>}
                        </td>
                      </tr>
                    ))}
                    {produtosEstoque.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">Nenhum produto encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historico de Vendas */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-800">Historico de Pedidos</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Data</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Total</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pedidos.length > 0 ? pedidos.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-500">
                            {new Date(p.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32">{p.nome_cliente}</p>
                          <p className="text-xs text-gray-400 truncate max-w-32">{p.email_cliente}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">R$ {Number(p.total).toFixed(2).replace('.', ',')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.status === 'Enviado' ? 'bg-blue-50 text-blue-700' :
                            p.status === 'Pago' ? 'bg-green-50 text-green-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>{p.status}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">Nenhum pedido registrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        {!loading && pedidos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-800">Produtos Mais Vendidos</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTopProducts(pedidos).map((item, idx) => (
                  <div key={item.nome} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-elroi-blue">#{idx + 1}</span>
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

// --- Sub-components ---

function MetricCard({ label, value, alert }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${alert ? 'border-amber-200' : 'border-gray-100'}`}>
      <p className={`text-2xl font-bold leading-tight ${alert ? 'text-amber-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

// Helper: count product sales from orders
function getTopProducts(pedidos: Pedido[]) {
  const map: Record<string, number> = {};
  pedidos.forEach(p => {
    p.itens?.forEach(item => {
      map[item.nome] = (map[item.nome] || 0) + (item.quantidade || 1);
    });
  });
  return Object.entries(map)
    .map(([nome, qty]) => ({ nome, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);
}
