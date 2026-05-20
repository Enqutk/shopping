'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import StoreHeader from '../../components/StoreHeader';
import { useCartStore } from '../../store/cart.store';

export default function CartPage() {
  const { items, setQuantity, removeLine } = useCartStore();

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0),
    [items],
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StoreHeader />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>
            <p className="text-sm text-gray-500 mt-1">
              {items.length === 0
                ? 'No items yet'
                : `${items.reduce((n, i) => n + i.quantity, 0)} items in cart`}
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-gray-600 font-medium">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <ul className="lg:col-span-2 space-y-4">
              {items.map((line) => (
                <li
                  key={line.productId}
                  className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
                >
                  <Link
                    href={`/products/${line.productId}`}
                    className="w-24 h-24 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center border border-gray-100"
                  >
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt={line.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-gray-300">📦</span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${line.productId}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2"
                    >
                      {line.name}
                    </Link>
                    <p className="text-indigo-600 font-bold mt-1">
                      ${Number(line.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Max {line.stock} (stock)
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.productId, line.quantity - 1)}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-lg text-lg leading-none"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-4 py-1.5 text-sm font-semibold text-gray-900 min-w-[2.5rem] text-center">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.productId, line.quantity + 1)}
                          disabled={line.quantity >= line.stock}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg text-lg leading-none disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.productId)}
                        className="text-sm text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${(Number(line.price) * line.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:col-span-1 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Summary
              </h2>
              <div className="flex justify-between mt-4 text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Taxes and shipping calculated at checkout.</p>
              <Link
                href="/checkout"
                className="mt-6 block w-full text-center py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
