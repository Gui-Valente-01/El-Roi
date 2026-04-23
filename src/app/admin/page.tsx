'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import AdminPedidos from '@/components/AdminPedidos';
import { adminApiFetch } from '@/lib/admin-api-client';

type Produto = {
  badge: string;
  categoria: string;
  created_at?: string;
  descricao: string;
  estoque: number;
  id: string;
  imagem: string;
  nome: string;
  preco: number;
  tamanho: string;
};

type SessionResponse = {
  authenticated: boolean;
};

type ProductsResponse = {
  products: Produto[];
};

type ProductResponse = {
  product: Produto;
};

type Toast = {
  id: string;
  message: string;
  type: 'error' | 'info' | 'success';
};

const emptyForm = {
  badge: '',
  categoria: 'Camisetas',
  descricao: '',
  estoque: 0,
  imagem: '',
  nome: '',
  preco: 0,
  tamanho: 'M',
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}

export default function AdminPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProdutoId, setEditingProdutoId] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'pedidos' | 'produtos'>('produtos');
  const [busca, setBusca] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState('');

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const handleUnauthorized = useCallback(() => {
    setLoggedIn(false);
    setProdutos([]);
    setError('Sua sessao expirou. Entre novamente.');
    setEditingProdutoId(null);
    setForm(emptyForm);
    setImagePreview('');
  }, []);

  const fetchProdutos = useCallback(async () => {
    setFetchLoading(true);

    try {
      const response = await adminApiFetch<ProductsResponse>('/api/admin/products');
      setProdutos(response.products);
      setError(null);
    } catch (fetchError) {
      const message = getErrorMessage(fetchError);

      if (message.includes('Nao autorizado')) {
        handleUnauthorized();
        return;
      }

      console.error('Erro ao buscar produtos:', fetchError);
      setError(message);
    } finally {
      setFetchLoading(false);
    }
  }, [handleUnauthorized]);

  const checkSession = useCallback(async () => {
    setSessionLoading(true);

    try {
      const response = await adminApiFetch<SessionResponse>('/api/admin/session');

      if (response.authenticated) {
        setLoggedIn(true);
        await fetchProdutos();
      } else {
        setLoggedIn(false);
      }
    } catch (sessionError) {
      console.error('Erro ao verificar sessao:', sessionError);
      setError('Nao foi possivel validar a sessao administrativa.');
    } finally {
      setSessionLoading(false);
      setFetchLoading(false);
    }
  }, [fetchProdutos]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const clearForm = useCallback(() => {
    setEditingProdutoId(null);
    setForm(emptyForm);
    setImagePreview('');
  }, []);

  const handleLogin = async () => {
    setSubmitting(true);

    try {
      await adminApiFetch('/api/admin/login', {
        body: JSON.stringify({ token }),
        method: 'POST',
      });

      setLoggedIn(true);
      setError(null);
      setToken('');
      await fetchProdutos();
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setSubmitting(false);
      setSessionLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminApiFetch('/api/admin/logout', { method: 'POST' });
    } catch (logoutError) {
      console.error('Erro ao encerrar sessao admin:', logoutError);
    }

    handleUnauthorized();
    setError(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast('Imagem muito grande. Use uma de ate 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((currentForm) => ({ ...currentForm, imagem: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (produto: Produto) => {
    setEditingProdutoId(produto.id);
    setForm({
      badge: produto.badge || '',
      categoria: produto.categoria || 'Camisetas',
      descricao: produto.descricao || '',
      estoque: produto.estoque || 0,
      imagem: produto.imagem || '',
      nome: produto.nome || '',
      preco: produto.preco || 0,
      tamanho: produto.tamanho || 'M',
    });
    setImagePreview(produto.imagem || '');
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.nome.trim()) {
      addToast('O nome do produto e obrigatorio.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (editingProdutoId) {
        await adminApiFetch<ProductResponse>(`/api/admin/products/${editingProdutoId}`, {
          body: JSON.stringify(form),
          method: 'PATCH',
        });
        addToast('Produto atualizado com sucesso!', 'success');
      } else {
        await adminApiFetch<ProductResponse>('/api/admin/products', {
          body: JSON.stringify(form),
          method: 'POST',
        });
        addToast('Produto adicionado ao catalogo!', 'success');
      }

      await fetchProdutos();
      clearForm();
    } catch (submitError) {
      const message = getErrorMessage(submitError);

      if (message.includes('Nao autorizado')) {
        handleUnauthorized();
        return;
      }

      addToast(message, 'error');
      console.error('Erro ao salvar produto:', submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Excluir "${nome}" permanentemente?`)) {
      return;
    }

    try {
      await adminApiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      await fetchProdutos();
      addToast(`"${nome}" excluido.`, 'info');
    } catch (deleteError) {
      const message = getErrorMessage(deleteError);

      if (message.includes('Nao autorizado')) {
        handleUnauthorized();
        return;
      }

      addToast(message, 'error');
    }
  };

  const categoriaStats: Record<string, number> = {};
  for (const produto of produtos) {
    const categoria = produto.categoria || 'Geral';
    categoriaStats[categoria] = (categoriaStats[categoria] || 0) + 1;
  }

  const stats = {
    baixoEstoque: produtos.filter(
      (produto) => (produto.estoque || 0) > 0 && (produto.estoque || 0) < 10
    ).length,
    mediaPreco:
      produtos.length > 0
        ? produtos.reduce((sum, produto) => sum + (produto.preco || 0), 0) / produtos.length
        : 0,
    totalEstoque: produtos.reduce((sum, produto) => sum + (produto.estoque || 0), 0),
    totalProdutos: produtos.length,
  };

  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (produto.categoria || '').toLowerCase().includes(busca.toLowerCase())
  );

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-elroi-blue" />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-elroi-blue text-xl font-black text-white shadow-lg">
            ER
          </div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Painel Admin</h1>
          <p className="mb-8 text-sm text-gray-400">El Roi - Acesso restrito</p>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && void handleLogin()}
            className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-elroi-blue"
            placeholder="Token de acesso"
          />
          <button
            onClick={() => void handleLogin()}
            disabled={submitting}
            className="w-full rounded-xl bg-elroi-blue py-3 text-sm font-semibold text-white transition-all hover:bg-elroi-black disabled:opacity-50"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
          {error && <p className="mt-4 text-xs text-red-500">{error}</p>}

          <Toasts toasts={toasts} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toasts toasts={toasts} />

      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-elroi-blue text-sm font-black text-white">
              ER
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-gray-900">El Roi Admin</h1>
              <p className="text-xs leading-tight text-gray-400">Painel de gestao</p>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            className="text-xs font-medium text-gray-500 transition hover:text-red-600"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8">
        <div className="flex w-fit gap-1 rounded-xl border border-gray-100 bg-white p-1">
          <button
            onClick={() => setAbaAtiva('produtos')}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
              abaAtiva === 'produtos'
                ? 'bg-elroi-blue text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setAbaAtiva('pedidos')}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Total de Produtos" value={stats.totalProdutos} icon={<StatsIcon />} />
              <StatCard label="Estoque Total" value={stats.totalEstoque} icon={<StockIcon />} />
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

            {Object.keys(categoriaStats).length > 0 && (
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Categorias:
                </span>
                {Object.entries(categoriaStats).map(([categoria, count]) => (
                  <span
                    key={categoria}
                    className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {categoria} <span className="text-gray-400">({count})</span>
                  </span>
                ))}
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-800">
                  {editingProdutoId ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                {editingProdutoId && (
                  <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Editando
                  </span>
                )}
              </div>

              <form onSubmit={(event) => void handleSubmit(event)} className="p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Nome *
                      </span>
                      <input
                        value={form.nome}
                        onChange={(event) => setForm({ ...form, nome: event.target.value })}
                        placeholder="Ex: Camiseta Oversized"
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-elroi-blue"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Categoria
                      </span>
                      <select
                        value={form.categoria}
                        onChange={(event) => setForm({ ...form, categoria: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-elroi-blue"
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
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Descricao
                      </span>
                      <textarea
                        value={form.descricao}
                        onChange={(event) => setForm({ ...form, descricao: event.target.value })}
                        placeholder="Detalhes do produto..."
                        rows={3}
                        className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-elroi-blue"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Preco (R$) *
                        </span>
                        <input
                          type="number"
                          value={form.preco}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              preco: Number.parseFloat(event.target.value) || 0,
                            })
                          }
                          placeholder="99.90"
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-elroi-blue"
                          min={0}
                          step="0.01"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Estoque *
                        </span>
                        <input
                          type="number"
                          value={form.estoque}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              estoque: Number.parseInt(event.target.value, 10) || 0,
                            })
                          }
                          placeholder="0"
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-elroi-blue"
                          min={0}
                          required
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Tamanho
                        </span>
                        <select
                          value={form.tamanho}
                          onChange={(event) => setForm({ ...form, tamanho: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-elroi-blue"
                        >
                          <option>U</option>
                          <option>P</option>
                          <option>M</option>
                          <option>G</option>
                          <option>GG</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Badge
                        </span>
                        <input
                          value={form.badge}
                          onChange={(event) => setForm({ ...form, badge: event.target.value })}
                          placeholder="Ex: Novo"
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-elroi-blue"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Imagem
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <input
                          value={form.imagem}
                          onChange={(event) => {
                            setForm({ ...form, imagem: event.target.value });
                            setImagePreview(event.target.value);
                          }}
                          placeholder="Ou cole a URL da imagem"
                          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-elroi-blue"
                        />
                      </label>
                    </div>

                    <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          unoptimized
                          className="h-full w-full object-contain"
                          sizes="128px"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">Preview da imagem</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-gray-50 pt-4">
                  {editingProdutoId && (
                    <button
                      type="button"
                      onClick={clearForm}
                      disabled={submitting}
                      className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-elroi-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-elroi-black disabled:opacity-50"
                  >
                    {submitting
                      ? 'Salvando...'
                      : editingProdutoId
                        ? 'Salvar Alteracoes'
                        : 'Adicionar ao Catalogo'}
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="flex flex-col justify-between gap-3 border-b border-gray-50 px-6 py-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-gray-800">Catalogo</h2>
                  <span className="rounded-full bg-elroi-blue px-2.5 py-0.5 text-xs font-bold text-white">
                    {produtosFiltrados.length}
                  </span>
                </div>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar produto..."
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-elroi-blue sm:w-64"
                  />
                </div>
              </div>

              {fetchLoading ? (
                <div className="space-y-3 p-12">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex animate-pulse items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-gray-100" />
                        <div className="h-3 w-1/4 rounded bg-gray-50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Produto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Preco
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Estoque
                        </th>
                        <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {produtosFiltrados.map((produto) => (
                        <tr key={produto.id} className="transition hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                {produto.imagem ? (
                                  <Image
                                    src={produto.imagem}
                                    alt={produto.nome}
                                    fill
                                    unoptimized
                                    className="h-full w-full object-cover"
                                    sizes="44px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-300">
                                    ?
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {produto.nome}
                                </p>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <span className="rounded bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-400">
                                    Tam: {produto.tamanho}
                                  </span>
                                  {produto.badge && (
                                    <span className="rounded bg-elroi-lightblue px-1.5 py-0.5 text-xs font-semibold text-elroi-blue">
                                      {produto.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold">
                              R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                produto.estoque === 0
                                  ? 'bg-red-50 text-red-700'
                                  : produto.estoque < 10
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-green-50 text-green-700'
                              }`}
                            >
                              {produto.estoque} un
                            </span>
                          </td>
                          <td className="hidden px-6 py-4 sm:table-cell">
                            <span className="text-xs text-gray-500">
                              {produto.categoria || 'Geral'}
                            </span>
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
                                onClick={() => void handleDelete(produto.id, produto.nome)}
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
                    <div className="py-16 text-center">
                      <p className="text-sm text-gray-400">
                        {busca
                          ? 'Nenhum produto encontrado para a busca.'
                          : 'Nenhum produto no banco de dados.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <AdminPedidos onSessionExpired={handleUnauthorized} />
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  alert,
}: {
  alert?: boolean;
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white p-4 ${
        alert ? 'border-red-200' : 'border-gray-100'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          alert ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold leading-tight text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function StatsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}
