'use client';

import { useAuthStore } from '../../store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { adminUi } from '../../lib/admin-ui';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/admin/products/new', label: 'Add product', icon: 'M12 4v16m8-8H4' },
];

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link href={href} className={active ? adminUi.navActive : adminUi.navInactive}>
      <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
      </svg>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em]">{label}</span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-femme-black flex flex-col items-center justify-center">
        <div className={adminUi.spinner} />
        <p className={`${adminUi.muted} text-sm font-medium mt-4 animate-pulse`}>
          Checking credentials…
        </p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-femme-black text-arctic-deep flex font-sans">
      <aside
        className={`w-64 bg-femme-surface border-r ${adminUi.borderSubtle} flex flex-col justify-between p-6 shrink-0`}
      >
        <div>
          <Link href="/admin" className="block mb-8">
            <p className="font-script text-femme-champagne text-3xl leading-none">LUXE</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-arctic-light mt-1">
              Admin
            </p>
          </Link>

          <nav className="space-y-1.5">
            {nav.map((item) => (
              <NavLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
            <Link
              href="/products"
              className={`${adminUi.navInactive} border-t ${adminUi.borderSubtle} mt-4 pt-4`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Storefront</span>
            </Link>
          </nav>
        </div>

        <div className={`flex items-center gap-3 border-t ${adminUi.borderSubtle} pt-4`}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-10 h-10 rounded-full border-2 border-femme-champagne/50"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-femme-champagne/20 border border-femme-champagne/40 flex items-center justify-center font-bold text-femme-champagne">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-arctic-deep truncate">{user.name}</p>
            <p className={`text-xs ${adminUi.muted} truncate`}>Administrator</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-femme-black">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
