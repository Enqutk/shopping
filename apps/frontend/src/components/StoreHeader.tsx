'use client';

import Link from 'next/link';
import { useCartStore } from '../store/cart.store';
import UserDropdown from './UserDropdown';

export default function StoreHeader() {
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href="/products" className="text-lg font-bold text-gray-900">
            Shop<span className="text-indigo-600">Store</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-sm font-medium">
            <Link href="/products" className="text-gray-600 hover:text-indigo-600">
              Catalog
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-indigo-600 relative">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] leading-none font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <Link href="/orders" className="text-gray-600 hover:text-indigo-600">
              Orders
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/cart"
            className="sm:hidden text-sm font-medium text-indigo-600 relative px-2"
          >
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 uppercase tracking-wide hidden md:inline"
          >
            Admin
          </Link>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
