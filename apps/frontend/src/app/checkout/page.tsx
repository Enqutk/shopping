'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import axios from 'axios';
import StoreHeader from '../../components/StoreHeader';
import { useCartStore } from '../../store/cart.store';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0),
    [items],
  );

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API}/orders/checkout`,
        {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
        { withCredentials: true },
      );
      clear();
      router.push(`/orders/${data.id}`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string | string[] } } };
      const msg = ax.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(', ') : msg || 'Checkout failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StoreHeader />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Link
          href="/cart"
          className="text-sm text-gray-500 hover:text-indigo-600 mb-6 inline-block"
        >
          ← Back to cart
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-sm text-gray-500 mb-8">
          Review your order and place it securely. Payment integration can be added in a later sprint.
        </p>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-gray-600 mb-6">Your cart is empty.</p>
            <Link href="/products" className="text-indigo-600 font-medium hover:underline">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
                {error}
              </div>
            )}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {items.map((line) => (
                  <div
                    key={line.productId}
                    className="flex justify-between gap-4 px-5 py-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{line.name}</p>
                      <p className="text-gray-500 mt-0.5">
                        Qty {line.quantity} × ${Number(line.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 shrink-0">
                      ${(Number(line.price) * line.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-indigo-600">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="mt-8 w-full py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {submitting && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
