'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../lib/api-axios';
import type { AdminOrderSummary, OrderStatus, PaginatedAdminOrders } from '@shopping/shared';
import {
  getOrderStatusLabel,
  ORDER_STATUS_OPTIONS,
} from '@shopping/shared';
import { ORDER_STATUS_BADGE } from '../../../lib/order-status-ui';
import { adminUi } from '../../../lib/admin-ui';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedAdminOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [broadcast, setBroadcast] = useState('');
  const [audience, setAudience] = useState<'admin' | 'all'>('admin');
  const [sending, setSending] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        ...(statusFilter && { status: statusFilter }),
        ...(search.trim() && { search: search.trim() }),
      });
      const res = await api.get<PaginatedAdminOrders>(`/admin/orders?${params}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const updateStatus = async (orderId: number, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.trim()) return;
    setSending(true);
    try {
      await api.post('/orders/admin/broadcast', { message: broadcast.trim(), audience });
      setBroadcast('');
    } catch (err) {
      console.error(err);
      alert('Broadcast failed');
    } finally {
      setSending(false);
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="max-w-6xl">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className={adminUi.pageTitle}>Orders</h1>
          <p className={adminUi.pageSub}>
            Update status — customers get a live notification.
          </p>
        </div>
        {data && (
          <p className="text-sm text-arctic-light">
            <span className="text-arctic-deep font-semibold">{data.total}</span> total
          </p>
        )}
      </header>

      <div className="flex flex-wrap gap-2 mb-5">
        {ORDER_STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setStatusFilter(statusFilter === opt.value ? '' : opt.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              statusFilter === opt.value
                ? ORDER_STATUS_BADGE[opt.value]
                : 'border-white/15 text-arctic-light hover:border-slate-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {statusFilter && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs text-arctic-light hover:text-arctic-deep"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search order #, name, email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={`flex-1 ${adminUi.input}`}
        />
        <button
          type="button"
          onClick={() => setShowBroadcast((v) => !v)}
          className="text-xs font-semibold uppercase tracking-wider text-arctic-light border border-white/10 rounded-lg px-4 py-2 hover:text-femme-champagne hover:border-slate-600"
        >
          {showBroadcast ? 'Hide broadcast' : 'Broadcast'}
        </button>
      </div>

      {showBroadcast && (
        <form
          onSubmit={sendBroadcast}
          className="mb-5 arctic-card border border-white/10 bg-femme-surface/80 rounded-xl p-4 space-y-3"
        >
          <textarea
            value={broadcast}
            onChange={(e) => setBroadcast(e.target.value)}
            placeholder="Notification message…"
            rows={2}
            className="w-full auth-input bg-femme-black border border-white/10 rounded-lg px-3 py-2 text-sm text-arctic-deep outline-none focus:border-femme-champagne"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as 'admin' | 'all')}
              className="auth-input bg-femme-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-arctic-deep"
            >
              <option value="admin">Admins only</option>
              <option value="all">All customers</option>
            </select>
            <button
              type="submit"
              disabled={sending || !broadcast.trim()}
              className={`px-3 py-1.5 ${adminUi.btnPrimary} !inline-flex disabled:opacity-40`}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading && !data ? (
          <div className="py-12 text-center text-arctic-light text-sm">Loading orders…</div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-12 text-center text-arctic-light text-sm rounded-xl border border-white/10 arctic-card border border-white/10 bg-femme-surface/60">
            No orders match your filters.
          </div>
        ) : (
          data.data.map((o: AdminOrderSummary) => {
            const status = o.status as OrderStatus;
            const badge = ORDER_STATUS_BADGE[status] ?? ORDER_STATUS_BADGE.PENDING;

            return (
              <article
                key={o.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/orders/${o.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/admin/orders/${o.id}`);
                  }
                }}
                className="rounded-xl border border-white/10 bg-slate-900/50 p-4 sm:p-5 hover:border-white/15 hover:bg-slate-900/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-femme-champagne/40"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-arctic-light mb-0.5">
                        Order
                      </p>
                      <p className="font-semibold text-arctic-deep group-hover:text-femme-champagne-light">
                        #{o.id}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] uppercase tracking-wider text-arctic-light mb-0.5">
                        Customer
                      </p>
                      <p className="text-sm text-arctic-deep truncate">{o.userName || '—'}</p>
                      <p className="text-xs text-arctic-light truncate">{o.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-arctic-light mb-0.5">
                        Total
                      </p>
                      <p className="font-semibold text-arctic-deep">
                        ${Number(o.totalPrice).toFixed(2)}
                      </p>
                      <p className="text-xs text-arctic-light">
                        {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                      <p className="text-[10px] uppercase tracking-wider text-arctic-light mb-0.5">
                        Placed
                      </p>
                      <p className="text-xs text-arctic-light">
                        {new Date(o.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-end lg:items-end gap-2 lg:min-w-[200px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <span
                      className={`inline-flex justify-center items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badge}`}
                    >
                      {getOrderStatusLabel(status)}
                    </span>
                    <select
                      value={status}
                      disabled={updatingId === o.id}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        void updateStatus(o.id, e.target.value as OrderStatus);
                      }}
                      className="w-full auth-input bg-femme-black border border-white/15 rounded-lg px-3 py-2 text-sm text-arctic-deep outline-none focus:border-femme-champagne disabled:opacity-50 cursor-pointer"
                      aria-label={`Update status for order ${o.id}`}
                    >
                      {ORDER_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-arctic-deep disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-arctic-light">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-arctic-deep disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
