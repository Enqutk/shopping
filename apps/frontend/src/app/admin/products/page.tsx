'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { PaginatedProducts } from '@shopping/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function AdminProductsPage() {
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search && { search }),
        ...(category && { category }),
      });
      const response = await axios.get<PaginatedProducts>(`${API}/products?${params}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [search, category, page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/products/${id}`, { withCredentials: true });
      // Refresh the product list
      await fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div>
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Product Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, update, and monitor product stock levels</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all hover:scale-[1.02] flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none transition-colors"
          >
            <option value="">All Categories</option>
            <option value="footwear">Footwear</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="electronics">Electronics</option>
          </select>
        </div>

        {data && (
          <span className="text-slate-400 text-sm">
            Total products: <span className="font-semibold text-white">{data.total}</span>
          </span>
        )}
      </div>

      {/* Products Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading && !data ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Loading products...</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-24 text-center text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg font-semibold text-slate-300">No products found</p>
            <p className="text-sm mt-1">Try adjusting filters or search string</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Price</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.data.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[240px]">
                            {product.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded-full border border-slate-700 capitalize">
                        {product.category || 'uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-200">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        product.stock > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {product.stock > 0 ? `${product.stock} units` : 'Sold out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg transition-colors border border-indigo-500/10"
                          title="Edit Product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/10 disabled:opacity-40"
                          title="Delete Product"
                        >
                          {deletingId === product.id ? (
                            <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl border border-slate-800 disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                p === page
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl border border-slate-800 disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
