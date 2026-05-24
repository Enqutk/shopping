'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PRODUCT_CATEGORIES } from '@shopping/shared';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import UserDropdown from './UserDropdown';

const LEFT_NAV = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/about', label: 'About' },
] as const;

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20L16.6 16.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function StoreHeader({ transparent = false }: { transparent?: boolean }) {
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

        <div className="flex md:hidden items-center">
          <button
            type="button"
            className="femme-icon-btn p-1"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>

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
            href="/orders"
            className={`femme-icon-btn inline-flex items-center gap-1.5 ${
              pathname === '/orders' || pathname.startsWith('/orders/')
                ? 'text-femme-champagne'
                : ''
            }`}
            aria-label="Track orders"
            title="Track orders"
          >
            <OrdersIcon />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] hidden sm:inline">
              Orders
            </span>
          </Link>
          <Link
            href="/cart"
            className={`femme-icon-btn relative ${
              pathname === '/cart' ? 'text-femme-champagne' : ''
            }`}
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
          {!authLoading && !user && (
            <>
              <Link href="/login" className="femme-nav-link hidden sm:inline">
                Sign in
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.15em] text-femme-champagne hover:text-femme-champagne-light transition-colors"
              >
                Register
              </Link>
            </>
          )}
          <UserDropdown />
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t border-white/10 bg-femme-black/98 backdrop-blur-md px-4 py-4"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {LEFT_NAV.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`block py-3 px-2 text-[11px] font-bold uppercase tracking-[0.15em] ${
                    pathname === href
                      ? 'text-femme-champagne'
                      : 'text-white/80 hover:text-femme-champagne'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            {PRODUCT_CATEGORIES.filter((c) => c.value)
              .slice(0, 4)
              .map((c) => (
                <li key={c.value}>
                  <Link
                    href={`/products?category=${c.value}`}
                    className="block py-2.5 px-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/70 hover:text-femme-champagne"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
