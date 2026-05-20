'use client';

import Link from 'next/link';
import type { Product } from '@shopping/shared';
import { useCartStore } from '../store/cart.store';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addProduct = useCartStore((s) => s.addProduct);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="block flex-1">
        <div className="relative h-56 bg-gray-50 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
              📦
            </div>
          )}
          {product.stock === 0 && (
            <span className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
              Out of stock
            </span>
          )}
          {product.category && (
            <span className="absolute top-3 left-3 bg-white/90 text-gray-600 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
              {product.category}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-bold text-indigo-600">
              ${Number(product.price).toFixed(2)}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                product.stock > 5
                  ? 'bg-green-50 text-green-700'
                  : product.stock > 0
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
              }`}
            >
              {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
            </span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          type="button"
          disabled={product.stock === 0}
          onClick={() => addProduct(product, 1)}
          className="w-full py-2.5 text-sm font-semibold rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
