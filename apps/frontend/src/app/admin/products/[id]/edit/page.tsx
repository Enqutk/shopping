'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api-axios';
import CategorySelect from '../../../../../components/admin/CategorySelect';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data;
        setName(product.name);
        setDescription(product.description || '');
        setPrice(String(product.price));
        setImageUrl(product.imageUrl || '');
        setStock(String(product.stock));
        setCategory(product.category || '');
      } catch (err: any) {
        console.error('Failed to fetch product for editing', err);
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError('Failed to load product details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setError('Stock must be an integer greater than or equal to 0.');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/products/${id}`, {
          name,
          description: description.trim() || undefined,
          price: parsedPrice,
          imageUrl: imageUrl.trim() || undefined,
          stock: parsedStock,
          category: category.trim() || undefined,
        });
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Failed to update product', err);
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to update product. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 focus:border-femme-champagne border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-arctic-light text-sm">Loading product details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-24 text-center">
        <p className="text-xl font-bold text-arctic-deep">Product not found</p>
        <p className="text-arctic-light text-sm mt-1">The product you are trying to edit does not exist.</p>
        <Link href="/admin/products" className="mt-4 text-femme-champagne hover:underline text-sm inline-block">
          ← Back to Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-sm text-arctic-light hover:text-femme-champagne flex items-center space-x-1 mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Inventory</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-arctic-deep">Edit Product</h1>
        <p className="text-arctic-light text-sm mt-1">Modify details for &quot;{name}&quot;</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="arctic-card border border-white/10 bg-femme-surface/90 rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-arctic-deep mb-2">Product Name *</label>
          <input
            type="text"
            required
            maxLength={256}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Air Max Alpha"
            className="w-full auth-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-arctic-deep mb-2">Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="49.99"
              className="w-full auth-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-arctic-deep mb-2">Stock Quantity *</label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full auth-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-arctic-deep mb-2">Category</label>
            <CategorySelect
              value={category}
              onChange={setCategory}
              className="w-full auth-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-arctic-deep mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full auth-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-arctic-deep mb-2">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a detailed description of the product features, sizing, materials..."
            className="w-full auth-input"
          />
        </div>

        <div className="flex justify-end space-x-4 border-t border-white/10 pt-6">
          <Link
            href="/admin/products"
            className="px-6 py-3 bg-femme-black/60 hover:border-femme-champagne text-arctic-deep font-semibold rounded-xl transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-femme-champagne hover:bg-femme-champagne-light text-arctic-deep font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.01] flex items-center space-x-2 shadow-lg shadow-[0_0_20px_rgba(201,169,98,0.15)] disabled:opacity-40 disabled:scale-100"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
