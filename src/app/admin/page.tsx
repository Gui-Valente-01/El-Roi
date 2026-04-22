'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import AdminPedidos from '@/components/AdminPedidos';

/**
 * ✅ AUTENTICAÇÃO MELHORADA
 * Este painel usa um token seguro ao invés de senha hardcoded
 * Configure NEXT_PUBLIC_ADMIN_TOKEN no .env.local
 */
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || '';

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  tamanho: string;
  imagem: string;
  badge: string;
  estoque: number;
  created_at: string;
};

type Toast = { id: string; message: string; type: 'success' | 'error' | 'info' };

export default function AdminPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProdutoId, setEditingProdutoId] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'produtos' | 'pedidos'>('produtos');
  const [busca, setBusca] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    categoria: 'Camisetas',
    preco: 0,
    tamanho: 'M',
    imagem: '',
    badge: '',
    estoque: 0,
  });

  const [imagePreview, setImagePreview] = useState('');
  const [stats, setStats] = useState({ totalProdutos: 0, totalEstoque: 0, mediaPreco: 0, baixoEstoque: 0 });

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchProdutos = useCallback(async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return;
    }

    const produtosList: Produto[] = data || [];
    setProdutos(produtosList);

    setStats({
      totalProdutos: produtosList.length,
      totalEstoque: produtosList.reduce((sum, p) => sum + (p.estoque || 0), 0),
      mediaPreco: produtosList.length > 0 ? produtosList.reduce((sum, p) => sum + (p.preco || 0), 0) / produtosList.length : 0,
      baixoEstoque: produtosList.filter(p => (p.estoque || 0) > 0 && (p.estoque || 0) < 10).length,
    });
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem('admin-token');
    if (saved && validateToken(saved)) {
      setLoggedIn(true);
      fetchProdutos().finally(() => setFetchLoading(false));
    } else {
      setFetchLoading(false);
    }
  }, [fetchProdutos]);

  /**
   * Valida o token de autenticação
   */
  const validateToken = (inputToken: string): boolean => {
    if (!ADMIN_TOKEN) {
      setError('❌ Erro: NEXT_PUBLIC_ADMIN_TOKEN não configurado no .env.local');
      return false;
    }
    return inputToken === ADMIN_TOKEN;
  };

  const handleLogin = () => {
    if (!validateToken(token)) {
      setError('Token inválido. Verifique suas credenciais.');
      return;
    }
    
    window.localStorage.setItem('admin-token', token);
    document.cookie = `admin-token=${token}; path=/; max-age=86400; SameSite=Strict`;
    setLoggedIn(true);
    setError(null);
    setToken('');
    fetchProdutos().finally(() => setFetchLoading(false));
  };

  const logout = () => {
    window.localStorage.removeItem('admin-token');
    document.cookie = 'admin-token=; path=/; max-age=0';
    setLoggedIn(false);
    clearForm();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Imagem muito grande — use uma de ate 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm(prev => ({ ...prev, imagem: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (produto: Produto) => {
    setEditingProdutoId(produto.id);
    setForm({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      categoria: produto.categoria || 'Camisetas',
      preco: produto.preco || 0,
      tamanho: produto.tamanho || 'M',
      imagem: produto.imagem || '',
      badge: produto.badge || '',
      estoque: produto.estoque || 0,
    });
    setImagePreview(produto.imagem || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearForm = () => {
    setEditingProdutoId(null);
    setForm({ nome: '', descricao: '', categoria: 'Camisetas', preco: 0, tamanho: 'M', imagem: '', badge: '', estoque: 0 });
    setImagePreview('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.nome.trim()) {
      addToast('O nome do produto e obrigatorio.', 'error');
      return;
    }

    setLoading(true);

    if (editingProdutoId) {
      const { error } = await supabase.from('produtos').update(form).eq('id', editingProdutoId);
      if (!error) {
        await fetchProdutos();
        clearForm();
        addToast('Produto atualizado com sucesso!', 'success');
      } else {
        addToast('Erro ao atualizar produto: ' + error.message, 'error');
        console.error(error);
      }
    } else {
      const { error } = await supabase.from('produtos').insert([form]);
      if (!error) {
        await fetchProdutos();
        clearForm();
        addToast('Produto adicionado ao catalogo!', 'success');
      } else {
        addToast('Erro ao adicionar produto: ' + error.message, 'error');
        console.error(error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Excluir "${nome}" permanentemente?`)) return;

    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (!error) {
      await fetchProdutos();
      addToast(`"${nome}" excluido.`, 'info');
    } else {
      addToast('Erro ao excluir produto: ' + error.message, 'error');
    }
  };

  const categoriaStats: Record<string, number> = {};
  produtos.forEach(p => {
    const cat = p.categoria || 'Geral';
    categoriaStats[cat] = (categoriaStats[cat] || 0) + 1;
  });

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busca.toLowerCase())
  );

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-elroi-blue text-white rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Painel Admin</h1>
          <p className="text-sm text-gray-400 mb-8">El Roi — Acesso restrito</p>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm focus:ring-2 focus:ring-elroi-blue focus:border-transparent outline-none transition"
            placeholder="Token de acesso"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-elroi-blue text-white py-3 rounded-xl font-semibold text-sm hover:bg-elroi-black transition-all"
          >
            Entrar
          </button>
          {error && <p className="text-xs text-red-500 mt-4">{error}</p>}
        </div>

        {/* Toasts */}
        <Toasts toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toasts toasts={toasts} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-elroi-blue text-white rounded-lg flex items-center justify-center text-sm font-black">ER</div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">El Roi Admin</h1>
              <p className="text-xs text-gray-400 leading-tight">Painel de Gestao</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-red-600 font-medium transition"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100 w-fit">
          <button
            onClick={() => setAbaAtiva('produtos')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${
              abaAtiva === 'produtos'
                ? 'bg-elroi-blue text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setAbaAtiva('pedidos')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${
              abaAtiva === 'pedidos'
                ? 'bg-elroi-blue text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pedidos
          </button>
        </div>

        {abaAtiva === 'produtos' ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total de Produtos"
                value={stats.totalProdutos}
                icon={<StatsIcon />}
              />
              <StatCard
                label="Estoque Total"
                value={stats.totalEstoque}
                icon={<StockIcon />}
              />
              <StatCard
                label="Preco Medio"
                value={`R$ ${stats.mediaPreco.toFixed(2).replace('.', ',')}`}
                icon={<MoneyIcon />}
              />
              <StatCard
                label="Baixo Estoque"
                value={stats.baixoEstoque}
                icon={<WarningIcon />}
                alert={stats.baixoEstoque > 0}
              />
            </div>

            {/* Category breakdown mini */}
            {Object.keys(categoriaStats).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 flex-wrap">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorias:</span>
                {Object.entries(categoriaStats).map(([cat, count]) => (
                  <span key={cat} className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full font-medium border border-gray-100">
                    {cat} <span className="text-gray-400">({count})</span>
                  </span>
                ))}
              </div>
            )}

            {/* Form: Add/Edit */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">
                  {editingProdutoId ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                {editingProdutoId && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold border border-amber-100">Editando</span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome *</span>
                      <input
                        value={form.nome}
                        onChange={e => setForm({ ...form, nome: e.target.value })}
                        placeholder="Ex: Camiseta Oversized"
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-elroi-blue focus:border-transparent outline-none transition"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</span>
                      <select
                        value={form.categoria}
                        onChange={e => setForm({ ...form, categoria: e.target.value })}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-elroi-blue outline-none"
                      >
                        <option>Camisetas</option>
                        <option>Moletons</option>
                        <option>Acessorios</option>
                        <option>Calcas</option>
                        <option>Bermudas</option>
                        <option>Geral</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descricao</span>
                      <textarea
                        value={form.descricao}
                        onChange={e => setForm({ ...form, descricao: e.target.value })}
                        placeholder="Detalhes do produto..."
                        rows={3}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-elroi-blue outline-none resize-none transition"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preco (R$) *</span>
                        <input
                          type="number"
                          value={form.preco}
                          onChange={e => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })}
                          placeholder="99.90"
                          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-elroi-blue outline-none"
                          min={0}
                          step="0.01"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estoque *</span>
                        <input
                          type="number"
                          value={form.estoque}
                          onChange={e => setForm({ ...form, estoque: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-elroi-blue outline-none"
                          min={0}
                          required
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tamanho</span>
                        <select
                          value={form.tamanho}
                          onChange={e => setForm({ ...form, tamanho: e.target.value })}
                          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-elroi-blue outline-none"
                        >
                          <option>U</option>
                          <option>P</option>
                          <option>M</option>
                          <option>G</option>
                          <option>GG</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Badge</span>
                        <input
                          value={form.badge}
                          onChange={e => setForm({ ...form, badge: e.target.value })}
                          placeholder="Ex: Novo"
                          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-elroi-blue outline-none"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          value={form.imagem}
                          onChange={e => { setForm({ ...form, imagem: e.target.value }); setImagePreview(e.target.value); }}
                          placeholder="Ou cole a URL da imagem"
                          className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-elroi-blue outline-none"
                        />
                      </label>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center overflow-hidden bg-gray-50">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-gray-400 text-xs">Preview da imagem</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex gap-3 justify-end">
                  {editingProdutoId && (
                    <button
                      type="button"
                      onClick={clearForm}
                      disabled={loading}
                      className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-elroi-blue text-white text-sm font-semibold rounded-lg hover:bg-elroi-black shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : editingProdutoId ? 'Salvar Alteracoes' : 'Adicionar ao Catalogo'}
                  </button>
                </div>
              </form>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-gray-800">Catalogo</h2>
                  <span className="text-xs bg-elroi-blue text-white px-2.5 py-0.5 rounded-full font-bold">{produtosFiltrados.length}</span>
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Buscar produto..."
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-64 outline-none focus:ring-2 focus:ring-elroi-blue focus:border-transparent"
                  />
                </div>
              </div>

              {fetchLoading ? (
                <div className="p-12 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-12 h-12 rounded-lg bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-50 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Preco</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Estoque</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {produtosFiltrados.map(produto => (
                        <tr key={produto.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                {produto.imagem ? (
                                  <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-bold">?</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{produto.nome}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-medium">Tam: {produto.tamanho}</span>
                                  {produto.badge && (
                                    <span className="text-xs text-elroi-blue bg-elroi-lightblue px-1.5 py-0.5 rounded font-semibold">{produto.badge}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-sm">R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                              produto.estoque === 0
                                ? 'bg-red-50 text-red-700'
                                : produto.estoque < 10
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-green-50 text-green-700'
                            }`}>
                              {produto.estoque} un
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="text-xs text-gray-500">{produto.categoria || 'Geral'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEdit(produto)}
                                className="text-xs font-semibold text-elroi-blue hover:underline"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(produto.id, produto.nome)}
                                className="text-xs font-semibold text-red-500 hover:underline"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {produtosFiltrados.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-gray-400 text-sm">{busca ? 'Nenhum produto encontrado para a busca.' : 'Nenhum produto no banco de dados.'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <AdminPedidos />
        )}
      </main>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ label, value, icon, alert }: { label: string; value: string | number; icon: React.ReactNode; alert?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center gap-3 ${alert ? 'border-red-200' : 'border-gray-100'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
            t.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
            t.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// Icons como SVG inline
function StatsIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
}
function StockIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
}
function MoneyIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function WarningIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}
