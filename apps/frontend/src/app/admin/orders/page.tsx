'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import type { AdminOrderSummary, OrderStatus, PaginatedAdminOrders } from '@shopping/shared';
import {
  getOrderStatusLabel,
  ORDER_STATUS_OPTIONS,
} from '@shopping/shared';
import { ORDER_STATUS_BADGE } from '../../../lib/order-status-ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function AdminOrdersPage() {
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
      const res = await axios.get<PaginatedAdminOrders>(`${API}/admin/orders?${params}`, {
        withCredentials: true,
      });
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
      await axios.patch(
        `${API}/orders/${orderId}/status`,
        { status },
        { withCredentials: true },
      );
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
      await axios.post(
        `${API}/orders/admin/broadcast`,
        { message: broadcast.trim(), audience },
        { withCredentials: true },
      );
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Orders</h1>
          <p className="text-slate-400 text-sm mt-1">
            Update status — customers get a live notification.
          </p>
        </div>
        {data && (
          <p className="text-sm text-slate-500">
            <span className="text-white font-semibold">{data.total}</span> total
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
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
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
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300"
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
          className="flex-1 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500/60"
        />
        <button
          type="button"
          onClick={() => setShowBroadcast((v) => !v)}
          className="text-xs font-semibold uppercase tracking-wider text-slate-400 border border-slate-800 rounded-lg px-4 py-2 hover:text-white hover:border-slate-600"
        >
          {showBroadcast ? 'Hide broadcast' : 'Broadcast'}
        </button>
      </div>

      {showBroadcast && (
        <form
          onSubmit={sendBroadcast}
          className="mb-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3"
        >
          <textarea
            value={broadcast}
            onChange={(e) => setBroadcast(e.target.value)}
            placeholder="Notification message…"
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500/60"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as 'admin' | 'all')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
            >
              <option value="admin">Admins only</option>
              <option value="all">All customers</option>
            </select>
            <button
              type="submit"
              disabled={sending || !broadcast.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg disabled:opacity-40"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading && !data ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading orders…</div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm rounded-xl border border-slate-800 bg-slate-900/40">
            No orders match your filters.
          </div>
        ) : (
          data.data.map((o: AdminOrderSummary) => {
            const status = o.status as OrderStatus;
            const badge = ORDER_STATUS_BADGE[status] ?? ORDER_STATUS_BADGE.PENDING;

            return (
              <article
                key={o.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                        Order
                      </p>
                      <p className="font-semibold text-white">#{o.id}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                        Customer
                      </p>
                      <p className="text-sm text-slate-200 truncate">{o.userName || '—'}</p>
                      <p className="text-xs text-slate-500 truncate">{o.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                        Total
                      </p>
                      <p className="font-semibold text-white">
                        ${Number(o.totalPrice).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                        Placed
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(o.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-end lg:items-end gap-2 lg:min-w-[200px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                    <span
                      className={`inline-flex justify-center items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badge}`}
                    >
                      {getOrderStatusLabel(status)}
                    </span>
                    <select
                      value={status}
                      disabled={updatingId === o.id}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/60 disabled:opacity-50"
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
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-800 text-slate-300 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-800 text-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
