'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import StoreHeader from '../../components/StoreHeader';
import type { OrderSummary } from '@shopping/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function statusBadge(status: OrderSummary['status']) {
  const map: Record<OrderSummary['status'], string> = {
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    SHIPPED: 'bg-arctic-mist text-arctic-deep border-arctic-steel/40',
    CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200',
  };
  return map[status] ?? map.PENDING;
}

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get<{ data: OrderSummary[] }>(`${API}/orders`, {
          withCredentials: true,
        });
        if (!cancelled) setOrders(res.data.data);
      } catch {
        if (!cancelled) {
          setError('Could not load orders. Please sign in again.');
          setOrders([]);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StoreHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order history</h1>
        <p className="text-sm text-gray-500 mb-8">Orders you&apos;ve placed on this account.</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-100">
            {error}
          </div>
        )}

        {orders === null ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-block mt-6 text-indigo-600 font-semibold hover:underline"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-semibold text-gray-900">Order #{o.id}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(o.createdAt).toLocaleString()} · {o.itemCount}{' '}
                      {o.itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${statusBadge(o.status)}`}
                    >
                      {o.status}
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${Number(o.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
