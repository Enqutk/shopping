'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type AdminOrderRow = {
  id: number;
  userId: number;
  totalPrice: string;
  status: string;
  createdAt: string;
  itemCount: number;
};

const STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'] as const;

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcast, setBroadcast] = useState('');
  const [audience, setAudience] = useState<'admin' | 'all'>('admin');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<{ data: AdminOrderRow[] }>(`${API}/orders/admin/recent`, {
        withCredentials: true,
      });
      setRows(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Orders &amp; realtime</h1>
        <p className="text-slate-400 text-sm mt-1">
          Update order status (pushes live to customers) or broadcast to admins / everyone.
        </p>
      </div>

      <form
        onSubmit={sendBroadcast}
        className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Admin broadcast</h2>
        <textarea
          value={broadcast}
          onChange={(e) => setBroadcast(e.target.value)}
          placeholder="Notification message…"
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm text-slate-400 flex items-center gap-2">
            Audience
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as 'admin' | 'all')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm"
            >
              <option value="admin">Admins only</option>
              <option value="all">All connected clients</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={sending || !broadcast.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl disabled:opacity-40"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading orders…</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-slate-400 font-semibold">Order</th>
                  <th className="px-4 py-3 text-slate-400 font-semibold">User</th>
                  <th className="px-4 py-3 text-slate-400 font-semibold">Total</th>
                  <th className="px-4 py-3 text-slate-400 font-semibold">Items</th>
                  <th className="px-4 py-3 text-slate-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-white font-medium">#{r.id}</td>
                    <td className="px-4 py-3 text-slate-400">{r.userId}</td>
                    <td className="px-4 py-3 text-slate-200">${Number(r.totalPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-400">{r.itemCount}</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                      >
                        {STATUSES.map((s) => (
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

      <p className="mt-6 text-xs text-slate-500">
        New checkouts and status changes also emit over WebSockets — see toasts while this page is open.
      </p>
    </div>
  );
}
