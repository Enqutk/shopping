'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import type { AdminOrderSummary, PaginatedAdminOrders } from '@shopping/shared';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const STATUSES = ['', 'PENDING', 'PAID', 'SHIPPED', 'CANCELLED'] as const;

export default function AdminOrdersPage() {
  const [data, setData] = useState<PaginatedAdminOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [broadcast, setBroadcast] = useState('');
  const [audience, setAudience] = useState<'admin' | 'all'>('admin');
  const [sending, setSending] = useState(false);

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

  const updateStatus = async (orderId: number, status: string) => {
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Order management</h1>
        <p className="text-slate-400 text-sm mt-1">
          Search, filter, and update order status. Changes sync live to customers.
        </p>
      </div>

      <form
        onSubmit={sendBroadcast}
        className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
      >
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Live broadcast</h2>
        <textarea
          value={broadcast}
          onChange={(e) => setBroadcast(e.target.value)}
          placeholder="Notification message…"
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as 'admin' | 'all')}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300"
          >
            <option value="admin">Admins only</option>
            <option value="all">All clients</option>
          </select>
          <button
            type="submit"
            disabled={sending || !broadcast.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg disabled:opacity-40"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search order #, name, or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300"
        >
          {STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>
              {s || 'All statuses'}
            </option>
          ))}
        </select>
        {data && (
          <span className="text-sm text-slate-500 self-center whitespace-nowrap">
            {data.total} orders
          </span>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading && !data ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No orders match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Order</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Customer</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Date</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Total</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Items</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.data.map((o: AdminOrderSummary) => (
                  <tr key={o.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-white">#{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200 truncate max-w-[180px]">
                        {o.userName || '—'}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                        {o.userEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      ${Number(o.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{o.itemCount}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                      >
                        {STATUSES.filter(Boolean).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-xl border border-slate-800 text-slate-300 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm rounded-xl border border-slate-800 text-slate-300 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
