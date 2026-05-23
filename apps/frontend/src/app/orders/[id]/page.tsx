'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import StoreHeader from '../../../components/StoreHeader';
import StoreFooter from '../../../components/store/StoreFooter';
import StoreScene from '../../../components/immersive/StoreScene';
import OrderTimeline from '../../../components/orders/OrderTimeline';
import type { OrderDetail, OrderStatus } from '@shopping/shared';
import { buildOrderTimeline, getOrderStatusLabel } from '@shopping/shared';
import { ORDER_STATUS_BADGE } from '../../../lib/order-status-ui';
import { useRealtimeStore } from '../../../store/realtime.store';
import { apiFetch } from '../../../lib/api-client';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const orderIdNum = Number(id);
  const liveStatus = useRealtimeStore((s) =>
    Number.isFinite(orderIdNum) ? s.orderStatusById[orderIdNum] : undefined,
  );
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await apiFetch(`/orders/${id}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to load');
        if (!cancelled) setOrder(await res.json());
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, liveStatus]);

  const displayStatus = liveStatus ?? order?.status;
  const statusKey = (displayStatus ?? 'PENDING') as keyof typeof ORDER_STATUS_BADGE;
  const badge = ORDER_STATUS_BADGE[statusKey] ?? ORDER_STATUS_BADGE.PENDING;

  const { steps: timelineSteps, log: timelineLog } = useMemo(() => {
    if (!order) return { steps: [], log: [] };
    const status = (displayStatus ?? order.status) as OrderStatus;
    if (order.timeline?.length && !liveStatus) {
      return { steps: order.timeline, log: order.statusLog ?? [] };
    }
    return buildOrderTimeline(status, order.statusLog ?? [], order.createdAt);
  }, [order, displayStatus, liveStatus]);

  return (
    <div className="store-page">
      <StoreScene>
        <StoreHeader />
        <main
          id="main-content"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1"
        >
          <Link
            href="/orders"
            className="text-[10px] uppercase tracking-wider text-arctic-light hover:text-femme-champagne mb-6 inline-block"
          >
            ← Orders
          </Link>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notFound || !order ? (
            <div className="arctic-card p-10 text-center">
              <p className="text-arctic-deep font-medium uppercase tracking-widest text-sm">
                Order not found
              </p>
              <Link href="/orders" className="text-femme-champagne text-sm mt-4 inline-block hover:underline">
                Back to orders
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_280px] gap-8 lg:gap-10 items-start">
              <div className="space-y-6 min-w-0">
                <header className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="section-heading text-2xl">Order #{order.id}</h1>
                    <p className="text-xs text-arctic-light mt-1 normal-case">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badge}`}
                    >
                      {getOrderStatusLabel(displayStatus ?? order.status)}
                    </span>
                    <p className="text-xl font-display text-femme-champagne mt-2">
                      ${Number(order.totalPrice).toFixed(2)}
                    </p>
                  </div>
                </header>

                <div className="arctic-card overflow-hidden">
                  <ul className="divide-y divide-white/10">
                    {order.items.map((line) => (
                      <li key={line.id} className="flex gap-3 p-4">
                        <Link
                          href={`/products/${line.productId}`}
                          className="w-14 h-14 shrink-0 overflow-hidden bg-white/5 border border-white/10"
                        >
                          {line.productImageUrl && (
                            <img
                              src={line.productImageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${line.productId}`}
                            className="text-sm text-arctic-deep hover:text-femme-champagne line-clamp-2"
                          >
                            {line.productName || `Product #${line.productId}`}
                          </Link>
                          <p className="text-xs text-arctic-light mt-1">
                            {line.quantity} × ${Number(line.price).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm text-femme-champagne shrink-0">
                          ${(Number(line.price) * line.quantity).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <aside className="arctic-card p-5 lg:sticky lg:top-24">
                {timelineSteps.length > 0 ? (
                  <OrderTimeline steps={timelineSteps} log={timelineLog} variant="dark" />
                ) : (
                  <p className="text-sm text-arctic-light">No tracking data yet.</p>
                )}
              </aside>
            </div>
          )}
        </main>
        <StoreFooter />
      </StoreScene>
    </div>
  );
}
