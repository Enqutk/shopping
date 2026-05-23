'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/store/StoreFooter';
import StoreScene from '../../components/immersive/StoreScene';
import type { OrderSummary } from '@shopping/shared';
import { getOrderStatusLabel } from '@shopping/shared';
import { ORDER_STATUS_BADGE } from '../../lib/order-status-ui';
import { apiFetch } from '../../lib/api-client';

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await apiFetch('/orders');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (!cancelled) setOrders(json.data);
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
    <div className="store-page">
      <StoreScene>
        <StoreHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
          <h1 className="section-heading text-2xl mb-1">Orders</h1>
          <p className="text-xs text-arctic-light mb-6 normal-case">Your order history</p>

          {error && (
            <p className="mb-6 text-sm text-rose-300">{error}</p>
          )}

          {orders === null ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-arctic-light py-8">
              No orders yet.{' '}
              <Link href="/products" className="text-femme-champagne hover:underline">
                Shop
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-arctic-deep">Order #{o.id}</p>
                      <p className="text-xs text-arctic-light mt-0.5 normal-case">
                        {new Date(o.createdAt).toLocaleDateString()} · {o.itemCount}{' '}
                        {o.itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          ORDER_STATUS_BADGE[o.status]
                        }`}
                      >
                        {getOrderStatusLabel(o.status)}
                      </span>
                      <span className="text-sm text-femme-champagne font-semibold">
                        ${Number(o.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
        <StoreFooter />
      </StoreScene>
    </div>
  );
}
