'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProductStore, Product } from '@/store/productStore';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
  const products = useProductStore((state) => state.products);
  const addProduct = useProductStore((state) => state.addProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Product, 'id'>>({
    nome: '',
    preco: 0,
    tamanho: 'M',
    imagem: '',
    badge: '',
    estoque: 0,
  });
  const [imagePreview, setImagePreview] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, imagem: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

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

  const logout = () => {
    window.localStorage.removeItem('elroi-admin-auth');
    setLoggedIn(false);
    setEditingProductId(null);
    setForm({ nome: '', preco: 0, tamanho: 'M', imagem: '', badge: '', estoque: 0 });
  };

  const startEdit = (product: Product) => {
    setEditingProductId(product.id);
    setForm({ nome: product.nome, preco: product.preco, tamanho: product.tamanho, imagem: product.imagem, badge: product.badge || '', estoque: product.estoque });
    setImagePreview(product.imagem);
  };

  const clearForm = () => {
    setEditingProductId(null);
    setForm({ nome: '', preco: 0, tamanho: 'M', imagem: '', badge: '', estoque: 0 });
    setImagePreview('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.nome.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }
    if (editingProductId) {
      updateProduct(editingProductId, form);
      clearForm();
      return;
    }
    addProduct(form);
    clearForm();
  };

  const totalProdutos = useMemo(() => products.length, [products]);

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-elroi-lightblue flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-elroi-blue mb-4">Admin El Roi</h1>
          <p className="text-sm text-elroi-gray mb-4">Digite a senha para acessar o painel de produtos.</p>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-elroi-blue">Painel Admin</h1>
            <div className="mt-2 flex gap-4">
              <a href="/admin/sales" className="text-sm text-elroi-blue hover:underline">
                → Ver Dashboard de Vendas
              </a>
            </div>
          </div>
          <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Sair
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Editar / Adicionar produto</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome"
              className="border border-gray-300 rounded-lg px-3 py-2"
              required
            />
            <input
              type="number"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })}
              placeholder="Preço"
              className="border border-gray-300 rounded-lg px-3 py-2"
              min={0}
              step="0.01"
              required
            />
            <select
              value={form.tamanho}
              onChange={(e) => setForm({ ...form, tamanho: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
            </select>
            <input
              value={form.imagem}
              onChange={(e) => {
                setForm({ ...form, imagem: e.target.value });
                setImagePreview(e.target.value);
              }}
              placeholder="URL da imagem ou carregue arquivo"
              className="border border-gray-300 rounded-lg px-3 py-2 col-span-1 sm:col-span-2 lg:col-span-1"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border border-gray-300 rounded-lg px-3 py-2 col-span-1 sm:col-span-2 lg:col-span-1"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview da imagem do produto"
                className="w-full h-24 object-cover rounded-lg col-span-full"
              />
            )}
            <input
              type="number"
              value={form.estoque}
              onChange={(e) => setForm({ ...form, estoque: parseInt(e.target.value) || 0 })}
              placeholder="Estoque"
              className="border border-gray-300 rounded-lg px-3 py-2"
              min={0}
              required
            />
            <input
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="Badge (opcional)"
              className="border border-gray-300 rounded-lg px-3 py-2 col-span-1 sm:col-span-2 lg:col-span-1"
            />
            <div className="flex gap-2 col-span-full">
              <button type="submit" className="bg-elroi-blue text-white px-5 py-2 rounded-lg hover:bg-elroi-black transition">
                {editingProductId ? 'Salvar alterações' : 'Adicionar produto'}
              </button>
              {editingProductId && (
                <button type="button" onClick={clearForm} className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Produtos cadastrados</h2>
            <span className="text-sm text-elroi-gray">Total: {totalProdutos}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Nome</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Preço</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Tamanho</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Estoque</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Badge</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="p-3 text-sm">{product.nome}</td>
                    <td className="p-3 text-sm">R$ {product.preco.toFixed(2)}</td>
                    <td className="p-3 text-sm">{product.tamanho}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        product.estoque === 0 ? 'bg-red-100 text-red-700' : product.estoque < 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.estoque}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{product.badge || '-'}</td>
                    <td className="p-3 text-sm flex gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td className="p-3 text-sm" colSpan={5}>Nenhum produto cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
