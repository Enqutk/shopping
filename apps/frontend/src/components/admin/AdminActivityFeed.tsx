'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { api } from '../../lib/api-axios';
import type { AdminActivityDto } from '@shopping/shared';
import { adminUi } from '../../lib/admin-ui';
import { useAuthStore } from '../../store/auth.store';
import { useRealtimeStore, type AdminActivityItem } from '../../store/realtime.store';

function activityIcon(type: string) {
  switch (type) {
    case 'order.placed':
      return 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z';
    case 'order.payment_submitted':
      return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'order.status_updated':
      return 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';
    case 'account.google':
    case 'account.registered':
      return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
}

function formatWhen(at: string) {
  const diff = Date.now() - new Date(at).getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(at).toLocaleString();
}

function ActivityRow({ item }: { item: AdminActivityItem }) {
  const content = (
    <>
      <span className={adminUi.iconBox}>
        <svg
          className="w-4 h-4 text-femme-champagne"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={activityIcon(item.type)}
          />
        </svg>
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-sm text-arctic-deep leading-snug normal-case tracking-normal`}>
          {item.message}
        </span>
        <span className={`block text-xs ${adminUi.muted} mt-1`}>{formatWhen(item.at ?? new Date().toISOString())}</span>
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
      >
        {content}
        <span className="text-arctic-light group-hover:text-femme-champagne self-center shrink-0 transition-colors">
          →
        </span>
      </Link>
    );
  }

  return <div className="flex gap-3 p-3 rounded-lg">{content}</div>;
}

export default function AdminActivityFeed() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const activities = useRealtimeStore((s) => s.adminActivities);
  const connected = useRealtimeStore((s) => s.connected);
  const clear = useRealtimeStore((s) => s.clearAdminActivities);
  const hydrate = useRealtimeStore((s) => s.hydrateAdminActivities);

  useEffect(() => {
    if (authLoading || user?.role !== 'ADMIN') return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<AdminActivityDto[]>('/admin/activity');
        if (!cancelled && Array.isArray(data)) {
          hydrate(
            data.map((row) => ({
              ...row,
              at: row.at ?? new Date().toISOString(),
            })),
          );
        }
      } catch {
        /* session expired or API offline */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate, authLoading, user?.role]);

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = activities.filter((a) => new Date(a.at).getTime() >= cutoff);

  return (
    <div className={adminUi.card}>
      <div
        className={`px-6 py-4 border-b ${adminUi.borderSubtle} flex justify-between items-center gap-3`}
      >
        <div>
          <h2 className={adminUi.sectionTitle}>Live activity</h2>
          <p className={`text-xs ${adminUi.muted} mt-1 normal-case tracking-normal`}>
            {connected ? 'Last 24 hours · live updates' : 'Last 24 hours · connecting…'}
          </p>
        </div>
        {activities.length > 0 && (
          <button type="button" onClick={clear} className={adminUi.link}>
            Clear
          </button>
        )}
      </div>
      {recent.length === 0 ? (
        <p className={`p-8 text-center ${adminUi.muted} text-sm normal-case tracking-normal`}>
          No activity in the last 24 hours. New orders, payments, and sign-ups will appear here.
        </p>
      ) : (
        <ul className={`divide-y ${adminUi.divide} max-h-80 overflow-y-auto`}>
          {recent.map((item) => (
            <li key={item.id}>
              <ActivityRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
