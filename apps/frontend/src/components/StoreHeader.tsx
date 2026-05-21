'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRODUCT_CATEGORIES } from '@shopping/shared';
import { useCartStore } from '../store/cart.store';
import UserDropdown from './UserDropdown';

const LEFT_NAV = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products', label: 'About' },
] as const;

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20L16.6 16.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function StoreHeader({ transparent = false }: { transparent?: boolean }) {
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const pathname = usePathname();
  const onHome = pathname === '/';

  const headerShell =
    transparent && onHome
      ? 'absolute top-0 left-0 right-0 z-50'
      : 'sticky top-0 z-50 femme-header';

  return (
    <header className={headerShell}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
          {LEFT_NAV.map(({ href, label }) => (
            <Link
              key={`${href}-${label}`}
              href={href}
              className={`femme-nav-link ${pathname === href ? 'femme-nav-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
          {PRODUCT_CATEGORIES.filter((c) => c.value)
            .slice(0, 2)
            .map((c) => (
              <Link
                key={c.value}
                href={`/products?category=${c.value}`}
                className="femme-nav-link hidden lg:inline"
              >
                {c.label}
              </Link>
            ))}
        </nav>

        <div className="md:hidden" />

        <Link
          href="/"
          className="font-display text-xl sm:text-2xl font-semibold uppercase tracking-[0.2em] text-white text-center col-span-1 justify-self-center"
        >
          LUXE
        </Link>

        <div className="flex items-center justify-end gap-4 sm:gap-5 text-white/80">
          <Link href="/products" className="femme-icon-btn md:hidden" aria-label="Search">
            <SearchIcon />
          </Link>
          <form action="/products" method="get" className="fashion-search hidden md:inline-flex" role="search">
            <input
              type="search"
              name="q"
              className="fashion-search__input"
              placeholder="Search..."
              aria-label="Search products"
            />
            <button type="submit" className="fashion-search__btn" aria-label="Submit search">
              <SearchIcon />
            </button>
          </form>
          <Link
            href="/cart"
            className="femme-icon-btn relative"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 5H5L7 16H18L20 8H8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="19.5" r="1" fill="currentColor" />
              <circle cx="17" cy="19.5" r="1" fill="currentColor" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 flex items-center justify-center rounded-full bg-femme-champagne text-femme-black text-[9px] font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <Link href="/login" className="femme-nav-link hidden sm:inline">
            Sign in
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.15em] text-femme-champagne hover:text-femme-champagne-light transition-colors"
          >
            Register
          </Link>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
