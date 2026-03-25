'use client';

import { useEffect, useState } from 'react';
import { useSalesStore } from '@/store/salesStore';
import { useProductStore } from '@/store/productStore';

const ADMIN_PASSWORD = 'admin123';

export default function SalesPage() {
  const sales = useSalesStore((state) => state.sales);
  const totalSales = useSalesStore((state) => state.getTotalSales());
  const totalRevenue = useSalesStore((state) => state.getTotalRevenue());
  const products = useProductStore((state) => state.products);

  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('elroi-admin-auth');
    if (saved === 'true') {
      setLoggedIn(true);
    }
  }, []);

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

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-elroi-lightblue flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-elroi-blue mb-4">Admin El Roi</h1>
          <p className="text-sm text-elroi-gray mb-4">Digite a senha para acessar o painel de vendas.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
            placeholder="Senha de admin"
          />
          <button onClick={handleLogin} className="w-full bg-elroi-blue text-white py-2 rounded-lg hover:bg-elroi-black transition">
            Entrar
          </button>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elroi-lightblue text-elroi-gray p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-elroi-blue mb-2">Dashboard de Vendas</h1>
          <a href="/admin" className="text-sm text-elroi-blue hover:underline">
            ← Voltar ao Painel de Produtos
          </a>
        </div>

        {/* Statistiques Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Total de Vendas</h2>
            <p className="text-4xl font-bold text-elroi-blue">{totalSales}</p>
            <p className="text-xs text-gray-500 mt-2">unidades vendidas</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Receita Total</h2>
            <p className="text-4xl font-bold text-elroi-blue">R$ {totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">no período</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Total de Pedidos</h2>
            <p className="text-4xl font-bold text-elroi-blue">{sales.length}</p>
            <p className="text-xs text-gray-500 mt-2">compras realizadas</p>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estoque de Produtos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Produto</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Preço</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Estoque</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="p-3 text-sm font-medium">{product.nome}</td>
                    <td className="p-3 text-sm">R$ {product.preco.toFixed(2)}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.estoque === 0
                          ? 'bg-red-100 text-red-700'
                          : product.estoque < 20
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.estoque} un.
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {product.estoque === 0 ? (
                        <span className="text-red-600 font-semibold">Fora de estoque</span>
                      ) : product.estoque < 20 ? (
                        <span className="text-yellow-600 font-semibold">Baixo estoque</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Em estoque</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales History */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Histórico de Vendas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Data</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Produtos</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Quantidade</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td className="p-3 text-sm text-gray-500" colSpan={4}>
                      Nenhuma venda registrada.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="border-t">
                      <td className="p-3 text-sm">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 text-sm">
                        <div className="space-y-1">
                          {sale.items.map((item, idx) => (
                            <span key={idx} className="block text-xs text-gray-600">
                              {item.nome}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{sale.items.reduce((sum, item) => sum + item.quantidade, 0)} un.</td>
                      <td className="p-3 text-sm font-semibold text-elroi-blue">R$ {sale.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
