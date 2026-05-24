'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../../../lib/api-axios';
import OrderTimeline from '../../../../components/orders/OrderTimeline';
import type { OrderDetail, OrderStatus } from '@shopping/shared';
import {
  buildOrderTimeline,
  formatOrderLineVariant,
  getOrderStatusLabel,
  ORDER_STATUS_OPTIONS,
} from '@shopping/shared';
import { ORDER_STATUS_BADGE } from '../../../../lib/order-status-ui';

type AdminOrderDetail = OrderDetail & {
  userId: number;
  userName: string | null;
  userEmail: string | null;
  itemCount: number;
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminOrderDetail>(`/admin/orders/${params.id}`);
      setOrder(res.data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${order.id}/status`, { status });
      await load();
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const confirmPayment = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${order.id}/confirm-payment`);
      await load();
    } catch {
      alert('Failed to confirm payment');
    } finally {
      setUpdating(false);
    }
  };

  const { steps: timelineSteps, log: timelineLog } = useMemo(() => {
    if (!order) return { steps: [], log: [] };
    if (order.timeline?.length) {
      return { steps: order.timeline, log: order.statusLog ?? [] };
    }
    return buildOrderTimeline(order.status, order.statusLog ?? [], order.createdAt);
  }, [order]);

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-sm">Loading order…</div>;
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-400">Order not found.</p>
        <Link href="/admin/orders" className="text-indigo-400 text-sm mt-4 inline-block hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const badge = ORDER_STATUS_BADGE[order.status] ?? ORDER_STATUS_BADGE.PENDING;

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/orders"
        className="text-xs text-slate-500 hover:text-slate-300 mb-4 inline-block"
      >
        ← All orders
      </Link>

      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Order #{order.id}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {order.userName} · {order.userEmail}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-2 min-w-[180px]">
          <span
            className={`inline-flex justify-center px-3 py-1 rounded-full text-xs font-bold uppercase border ${badge}`}
          >
            {getOrderStatusLabel(order.status)}
          </span>
          <p className="text-xl font-semibold text-white text-right">
            ${Number(order.totalPrice).toFixed(2)}
          </p>
          {order.status === 'AWAITING_CONFIRMATION' && (
            <button
              type="button"
              disabled={updating}
              onClick={() => void confirmPayment()}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide disabled:opacity-50"
            >
              {updating ? 'Confirming…' : 'Confirm payment'}
            </button>
          )}
          <select
            value={order.status}
            disabled={updating}
            onChange={(e) => updateStatus(e.target.value as OrderStatus)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
          >
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold uppercase text-slate-500">
            Line items ({order.itemCount})
          </div>
          <ul className="divide-y divide-slate-800">
            {order.items.map((line) => {
              const variant = formatOrderLineVariant(line);
              return (
              <li key={line.id} className="flex gap-3 p-4">
                <div className="w-12 h-12 shrink-0 bg-slate-800 overflow-hidden rounded">
                  {line.productImageUrl && (
                    <img src={line.productImageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => router.push(`/products/${line.productId}`)}
                    className="text-sm text-slate-200 hover:text-white text-left"
                  >
                    {line.productName}
                  </button>
                  {variant ? (
                    <p className="text-xs text-indigo-300/90 mt-1 font-medium">{variant}</p>
                  ) : (
                    <p className="text-xs text-slate-600 mt-1 italic">No color/size recorded</p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">
                    Qty {line.quantity} · ${Number(line.price).toFixed(2)} each
                  </p>
                </div>
                <p className="text-sm font-medium text-white shrink-0">
                  ${(Number(line.price) * line.quantity).toFixed(2)}
                </p>
              </li>
            );
            })}
          </ul>
        </div>

        <aside className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          {timelineSteps.length > 0 ? (
            <OrderTimeline steps={timelineSteps} log={timelineLog} variant="dark" />
          ) : (
            <p className="text-sm text-slate-500">No timeline yet.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
