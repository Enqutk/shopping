'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@shopping/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API}/products/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        setProduct(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
        <button onClick={() => router.push('/products')} className="mt-4 text-indigo-600 hover:underline text-sm">
          ← Back to products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-indigo-600 mb-6 flex items-center gap-1">
          ← Back
        </button>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="h-80 md:h-full bg-gray-50 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-300 text-8xl">📦</div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              {product.category && (
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-3">{product.name}</h1>
              {product.description && (
                <p className="text-gray-600 mt-3 leading-relaxed">{product.description}</p>
              )}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-extrabold text-indigo-600">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  product.stock > 5 ? 'bg-green-50 text-green-700' :
                  product.stock > 0 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <button
                disabled={product.stock === 0}
                className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
