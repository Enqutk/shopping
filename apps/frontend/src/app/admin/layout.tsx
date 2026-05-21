'use client';

import { useAuthStore } from '../../store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

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
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
          : 'text-slate-300 hover:text-white hover:bg-slate-800'
      }`}
    >
      <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
      </svg>
      {label}
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Checking credentials...</p>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6 shrink-0">
        <div>
          <Link href="/admin" className="flex items-center space-x-2 mb-8">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Shop Admin
            </span>
          </Link>

          <nav className="space-y-2">
            {nav.map((item) => (
              <NavLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
            <Link
              href="/products"
              className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200 border-t border-slate-800 mt-4 pt-4"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Storefront
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3 border-t border-slate-800 pt-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">Administrator</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
