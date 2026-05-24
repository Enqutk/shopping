'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api-axios';
import type { AdminStats } from '@shopping/shared';
import { getOrderStatusLabel, ORDER_STATUS_OPTIONS } from '@shopping/shared';
import StatCard from '../../components/admin/StatCard';
import RevenueChart from '../../components/admin/RevenueChart';
import AdminActivityFeed from '../../components/admin/AdminActivityFeed';
import AdminPartnersComingSoon from '../../components/admin/AdminPartnersComingSoon';
import { useRealtimeStore } from '../../store/realtime.store';

function statusColor(status: string) {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'SHIPPED':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'CANCELLED':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const adminActivities = useRealtimeStore((s) => s.adminActivities);

  const loadStats = async () => {
    try {
      const res = await api.get<AdminStats>('/admin/stats');
      setStats(res.data);
      setAccessError(null);
    } catch (e: unknown) {
      const status = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { status?: number } }).response?.status
        : undefined;
      if (status === 403) {
        setAccessError(
          'This account does not have admin access. Log out and sign in with admin@luxe.com',
        );
      } else {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (adminActivities.length === 0) return;
    const latest = adminActivities[0];
    if (
      latest.type === 'order.placed' ||
      latest.type === 'order.payment_submitted' ||
      latest.type === 'account.registered' ||
      latest.type === 'account.google' ||
      latest.type === 'order.status_updated'
    ) {
      loadStats();
    }
  }, [adminActivities]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
        <p className="text-rose-200 text-sm">{accessError}</p>
        <Link href="/login" className="inline-block mt-4 text-indigo-400 text-sm font-semibold hover:underline">
          Go to sign in →
        </Link>
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-slate-400 text-sm">Could not load dashboard statistics.</p>
    );
  }

  const pending = stats.ordersByStatus.PENDING ?? 0;
  const awaitingConfirm = stats.ordersByStatus.AWAITING_CONFIRMATION ?? 0;
  const paid = stats.ordersByStatus.PAID ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Store overview — products, orders, and revenue at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total revenue"
          value={`$${Number(stats.totals.revenue).toFixed(2)}`}
          hint="All-time order value"
          accent="emerald"
        />
        <StatCard label="Orders" value={stats.totals.orders} hint={`${pending} pending`} accent="indigo" />
        <StatCard label="Products" value={stats.totals.products} hint={`${stats.totals.lowStock} low stock`} accent="cyan" />
        <StatCard label="Customers" value={stats.totals.customers} hint="Unique buyers" accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">
            Revenue (last 7 days)
          </h2>
          <RevenueChart data={stats.revenueByDay} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">
            Orders by status
          </h2>
          <ul className="space-y-3">
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <li key={opt.value} className="flex justify-between items-center text-sm">
                <span
                  className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${statusColor(opt.value)}`}
                >
                  {opt.label}
                </span>
                <span className="text-white font-bold tabular-nums">
                  {stats.ordersByStatus[opt.value] ?? 0}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-6">
            {paid} paid orders ready to ship or complete.
          </p>
        </div>
      </div>

      <AdminActivityFeed />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View all →
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="p-8 text-center text-slate-500 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-800/40 cursor-pointer"
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                  >
                    <td className="px-6 py-3 font-medium text-white">#{o.id}</td>
                    <td className="px-6 py-3 text-slate-400">
                      {o.userName || o.userEmail || `User ${o.userId}`}
                    </td>
                    <td className="px-6 py-3 text-slate-200">
                      ${Number(o.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColor(o.status)}`}>
                        {getOrderStatusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminPartnersComingSoon />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700"
        >
          Manage products
        </Link>
        <Link
          href="/admin/orders"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl"
        >
          Manage orders
        </Link>
      </div>
    </div>
  );
}
