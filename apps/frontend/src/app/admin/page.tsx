'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAxiosStatus } from '../../lib/api-axios';
import { useAuthStore } from '../../store/auth.store';
import type { AdminStats } from '@shopping/shared';
import { getOrderStatusLabel, ORDER_STATUS_OPTIONS } from '@shopping/shared';
import StatCard from '../../components/admin/StatCard';
import RevenueChart from '../../components/admin/RevenueChart';
import AdminActivityFeed from '../../components/admin/AdminActivityFeed';
import AdminPartnersComingSoon from '../../components/admin/AdminPartnersComingSoon';
import { useRealtimeStore } from '../../store/realtime.store';
import { adminStatusBadge, adminUi } from '../../lib/admin-ui';

export default function AdminDashboardPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const authLoading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
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
      const status = getAxiosStatus(e);
      if (status === 401) {
        logout();
        router.push('/login?from=/admin');
        return;
      }
      if (status === 403) {
        setAccessError(
          'This account does not have admin access. Log out and sign in with admin@luxe.com',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || user?.role !== 'ADMIN') return;
    loadStats();
  }, [authLoading, user?.role]);

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
        <div className={adminUi.spinner} />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className={adminUi.errorBox}>
        <p className="text-rose-200 text-sm normal-case tracking-normal">{accessError}</p>
        <Link href="/login" className={`inline-block mt-4 ${adminUi.link}`}>
          Go to sign in →
        </Link>
      </div>
    );
  }

  if (!stats) {
    return <p className={`${adminUi.muted} text-sm`}>Could not load dashboard statistics.</p>;
  }

  const pending = stats.ordersByStatus.PENDING ?? 0;
  const awaitingConfirm = stats.ordersByStatus.AWAITING_CONFIRMATION ?? 0;
  const paid = stats.ordersByStatus.PAID ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminUi.pageTitle}>Dashboard</h1>
        <p className={adminUi.pageSub}>Store overview: products, orders, and revenue at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total revenue"
          value={`$${Number(stats.totals.revenue).toFixed(2)}`}
          hint="All-time order value"
          accent="emerald"
        />
        <StatCard
          label="Orders"
          value={stats.totals.orders}
          hint={
            awaitingConfirm > 0
              ? `${awaitingConfirm} need payment confirm`
              : `${pending} awaiting payment`
          }
          accent="champagne"
        />
        <StatCard
          label="Products"
          value={stats.totals.products}
          hint={`${stats.totals.lowStock} low stock`}
          accent="steel"
        />
        <StatCard label="Customers" value={stats.totals.customers} hint="Unique buyers" accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${adminUi.cardPad}`}>
          <h2 className={`${adminUi.sectionTitle} mb-4`}>Revenue (last 7 days)</h2>
          <RevenueChart data={stats.revenueByDay} />
        </div>

        <div className={adminUi.cardPad}>
          <h2 className={`${adminUi.sectionTitle} mb-4`}>Orders by status</h2>
          <ul className="space-y-3">
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <li key={opt.value} className="flex justify-between items-center text-sm">
                <span
                  className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${adminStatusBadge(opt.value)}`}
                >
                  {opt.label}
                </span>
                <span className="text-arctic-deep font-bold tabular-nums">
                  {stats.ordersByStatus[opt.value] ?? 0}
                </span>
              </li>
            ))}
          </ul>
          <p className={`text-xs ${adminUi.muted} mt-6 normal-case tracking-normal`}>
            {paid} paid orders ready to ship or complete.
          </p>
        </div>
      </div>

      <AdminActivityFeed />

      <div className={adminUi.card}>
        <div
          className={`px-6 py-4 border-b ${adminUi.borderSubtle} flex justify-between items-center`}
        >
          <h2 className={adminUi.sectionTitle}>Recent orders</h2>
          <Link href="/admin/orders" className={adminUi.link}>
            View all →
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className={`p-8 text-center ${adminUi.muted} text-sm`}>No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={adminUi.tableHead}>
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${adminUi.divide}`}>
                {stats.recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className={adminUi.tableRow}
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                  >
                    <td className="px-6 py-3 font-medium text-arctic-deep">#{o.id}</td>
                    <td className={`px-6 py-3 ${adminUi.muted}`}>
                      {o.userName || o.userEmail || `User ${o.userId}`}
                    </td>
                    <td className="px-6 py-3 text-femme-champagne font-semibold">
                      ${Number(o.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${adminStatusBadge(o.status)}`}
                      >
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
        <Link href="/admin/products" className={adminUi.btnSecondary}>
          Manage products
        </Link>
        <Link href="/admin/orders" className={adminUi.btnPrimary}>
          Manage orders
        </Link>
      </div>
    </div>
  );
}
