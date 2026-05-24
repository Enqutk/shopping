'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/store/StoreFooter';
import StoreScene from '../../components/immersive/StoreScene';
import OrderStatusProgress from '../../components/orders/OrderStatusProgress';
import type { OrderSummary } from '@shopping/shared';
import { getOrderStatusLabel } from '@shopping/shared';
import { ORDER_STATUS_BADGE } from '../../lib/order-status-ui';
import { useAuthStore } from '../../store/auth.store';
import { apiFetch } from '../../lib/api-client';

export default function TrackOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await apiFetch('/orders');
        if (res.status === 401) {
          if (!cancelled) {
            setError('sign-in');
            setOrders([]);
          }
          return;
        }
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (!cancelled) {
          setOrders(json.data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('load');
          setOrders([]);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  return (
    <div className="store-page">
      <StoreScene>
        <StoreHeader />
        <main
          id="main-content"
          className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full flex-1"
        >
          <h1 className="section-heading text-2xl mb-1">Track orders</h1>
          <p className="text-xs text-arctic-light mb-6 normal-case">
            See status updates and order details in real time.
          </p>

          {error === 'sign-in' && (
            <div className="arctic-card p-6 text-center mb-6">
              <p className="text-sm text-arctic-light mb-4">
                Sign in to view and track your orders.
              </p>
              <Link
                href="/login?from=/orders"
                className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-femme-champagne hover:text-femme-champagne-light"
              >
                Sign in →
              </Link>
            </div>
          )}

          {error === 'load' && (
            <p className="mb-6 text-sm text-rose-300">
              Could not load orders. Please try again or sign in.
            </p>
          )}

          {orders === null && !error ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders && orders.length === 0 && error !== 'sign-in' ? (
            <div className="arctic-card p-8 text-center">
              <p className="text-sm text-arctic-light mb-4">No orders yet.</p>
              <Link href="/products" className="text-femme-champagne text-sm hover:underline">
                Start shopping →
              </Link>
            </div>
          ) : orders && orders.length > 0 ? (
            <ul className="divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/orders/${o.id}`}
                    className="block p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-arctic-deep">Order #{o.id}</p>
                        <p className="text-xs text-arctic-light mt-0.5 normal-case">
                          {new Date(o.createdAt).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })}{' '}
                          · {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-flex text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            ORDER_STATUS_BADGE[o.status]
                          }`}
                        >
                          {getOrderStatusLabel(o.status)}
                        </span>
                        <p className="text-sm text-femme-champagne font-semibold mt-1">
                          ${Number(o.totalPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <OrderStatusProgress status={o.status} />
                      <span className="text-[10px] uppercase tracking-wider text-arctic-light/70">
                        View details →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </main>
        <StoreFooter />
      </StoreScene>
    </div>
  );
}
