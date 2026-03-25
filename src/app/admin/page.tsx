'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
const ADMIN_PASSWORD = 'admin123';

type Product = {
  id: string;
  name: string;
  description: string;
  categoria: string;
  price: number;
  tamanho: string;
  image_url: string;
  badge: string;
  stock_quantity: number;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoria: 'Geral',
    price: 0,
    tamanho: 'M',
    image_url: '',
    badge: '',
    stock_quantity: 0,
  });
  
  const [imagePreview, setImagePreview] = useState('');

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    if (error) console.error("Erro ao buscar produtos:", error);
  };

  useEffect(() => {
    const saved = window.localStorage.getItem('elroi-admin-auth');
    if (saved === 'true') {
      setLoggedIn(true);
      fetchProducts();
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, image_url: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      window.localStorage.setItem('elroi-admin-auth', 'true');
      setLoggedIn(true);
      setError(null);
      setPassword('');
      fetchProducts();
      return;
    }
    setError('Senha incorreta. Tente novamente.');
  };

  const logout = () => {
    window.localStorage.removeItem('elroi-admin-auth');
    setLoggedIn(false);
    clearForm();
  };

  const startEdit = (product: Product) => {
    setEditingProductId(product.id);
    setForm({ 
      name: product.name, 
      description: product.description || '',
      categoria: product.categoria || 'Geral',
      price: product.price, 
      tamanho: product.tamanho || 'M', 
      image_url: product.image_url || '', 
      badge: product.badge || '', 
      stock_quantity: product.stock_quantity 
    });
    setImagePreview(product.image_url || '');
  };

  const clearForm = () => {
    setEditingProductId(null);
    setForm({ name: '', description: '', categoria: 'Geral', price: 0, tamanho: 'M', image_url: '', badge: '', stock_quantity: 0 });
    setImagePreview('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }

    setLoading(true);

    if (editingProductId) {
      const { error } = await supabase
        .from('products')
        .update(form)
        .eq('id', editingProductId);
      
      if (!error) {
        await fetchProducts();
        clearForm();
      } else {
        alert('Erro ao atualizar produto.');
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([form]);
      
      if (!error) {
        await fetchProducts();
        clearForm();
      } else {
        alert('Erro ao salvar produto.');
        console.error(error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Tem certeza que deseja excluir permanentemente este produto?")) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      await fetchProducts();
    } else {
      alert("Erro ao excluir produto.");
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-elroi-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">
            ER
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel El Roi</h1>
          <p className="text-gray-500 mb-8">Acesso restrito à gestão da loja.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-elroi-blue focus:border-transparent outline-none transition"
            placeholder="Digite a senha administrativa"
          />
          <button onClick={handleLogin} className="w-full bg-elroi-blue text-white py-3 rounded-xl font-semibold hover:bg-elroi-black hover:shadow-lg transition-all duration-300">
            Acessar Painel
          </button>
          {error && <p className="text-sm text-red-500 mt-4 font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestão de Produtos</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie seu catálogo, estoque e categorias.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <a href="/admin/sales" className="px-5 py-2.5 bg-elroi-lightblue text-elroi-blue font-semibold rounded-xl hover:bg-blue-100 transition">
              Dashboard de Vendas
            </a>
            <button onClick={logout} className="px-5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition">
              Sair
            </button>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              {editingProductId ? '✏️ Editando Produto' : '✨ Novo Produto'}
            </h2>
            {editingProductId && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">Modo Edição</span>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Informações Principais</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Peça *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Camiseta Oversized" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-elroi-blue outline-none" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-elroi-blue outline-none">
                    <option value="Camisetas">Camisetas</option>
                    <option value="Moletons">Moletons</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes do tecido, caimento..." rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-elroi-blue outline-none resize-none" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Vendas e Estoque</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} placeholder="99.90" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-elroi-blue outline-none" min={0} step="0.01" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
                    <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-elroi-blue outline-none" min={0} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                    <select value={form.tamanho} onChange={(e) => setForm({ ...form, tamanho: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-elroi-blue outline-none">
                      <option value="U">Único (U)</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge (Ex: Novo)</label>
                    <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Opcional" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-elroi-blue outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mídia do Produto</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (URL ou Arquivo)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm mb-2" />
                  <input value={form.image_url} onChange={(e) => { setForm({ ...form, image_url: e.target.value }); setImagePreview(e.target.value); }} placeholder="Ou cole a URL da imagem aqui" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-elroi-blue outline-none text-sm" />
                </div>

                <div className="mt-2 border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-center justify-center overflow-hidden bg-gray-50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-400 text-sm">Preview da Imagem</span>
                  )}
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3 justify-end">
              {editingProductId && (
                <button type="button" onClick={clearForm} disabled={loading} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={loading} className="px-8 py-3 bg-elroi-blue text-white font-semibold rounded-xl hover:bg-elroi-black shadow-md hover:shadow-lg transition disabled:opacity-50">
                {loading ? 'Salvando...' : editingProductId ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Catálogo Atual</h2>
            <span className="bg-elroi-blue text-white text-xs font-bold px-3 py-1 rounded-full">{products.length} produtos</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Preço</th>
                  <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estoque</th>
                  <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                          {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Tam: {product.tamanho}</span>
                            {product.badge && <span className="text-xs text-elroi-blue bg-elroi-lightblue px-2 py-0.5 rounded font-semibold">{product.badge}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.stock_quantity === 0 ? 'bg-red-100 text-red-700' : product.stock_quantity < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.stock_quantity} un
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{product.categoria || 'Geral'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => startEdit(product)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-4 transition">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm transition">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      Nenhum produto cadastrado no banco de dados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}