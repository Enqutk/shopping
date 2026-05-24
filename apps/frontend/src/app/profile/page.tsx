'use client';

import Link from 'next/link';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/store/StoreFooter';
import StoreScene from '../../components/immersive/StoreScene';
import { useAuthStore } from '../../store/auth.store';

function roleLabel(role: string) {
  return role === 'ADMIN' ? 'Admin' : 'Customer';
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  return (
    <div className="store-page">
      <StoreScene>
        <StoreHeader />
        <main
          id="main-content"
          className="max-w-lg mx-auto px-4 sm:px-6 py-8 w-full flex-1"
        >
          <h1 className="section-heading text-2xl mb-1">Profile</h1>
          <p className="text-xs text-arctic-light mb-8 normal-case">
            Your account details and quick links.
          </p>

          {loading ? (
            <div
              className="arctic-card p-8 animate-pulse h-48"
              aria-busy="true"
              aria-label="Loading profile"
            />
          ) : user ? (
            <div className="space-y-6">
              <div className="arctic-card p-6 sm:p-8">
                <div className="flex items-center gap-4 sm:gap-5">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-femme-champagne/40"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-femme-champagne/15 border border-femme-champagne/40 flex items-center justify-center text-2xl sm:text-3xl text-femme-champagne font-display font-semibold uppercase">
                      {(user.name?.[0] ?? user.email[0] ?? '?').toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg sm:text-xl text-arctic-deep truncate normal-case tracking-wide">
                      {user.name ?? 'User'}
                    </p>
                    <p className="text-sm text-arctic-light truncate mt-0.5">
                      {user.email}
                    </p>
                    <span
                      className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded border ${
                        user.role === 'ADMIN'
                          ? 'text-femme-champagne border-femme-champagne/50 bg-femme-champagne/10'
                          : 'text-arctic-light border-white/20 bg-white/5'
                      }`}
                    >
                      {roleLabel(user.role)}
                    </span>
                  </div>
                </div>

                <dl className="mt-8 pt-6 border-t border-white/10 grid gap-4">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-arctic-light mb-1">
                      Email
                    </dt>
                    <dd className="text-sm text-arctic-deep break-all normal-case">
                      {user.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-arctic-light mb-1">
                      Role
                    </dt>
                    <dd className="text-sm text-arctic-deep normal-case">
                      {roleLabel(user.role)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/orders" className="btn-primary text-center flex-1">
                  My orders
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="btn-ghost text-center flex-1 justify-center"
                  >
                    Admin panel
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="arctic-card p-8 text-center">
              <p className="text-sm text-arctic-light mb-4">
                Sign in to view your profile.
              </p>
              <Link
                href="/login?from=/profile"
                className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-femme-champagne hover:text-femme-champagne-light"
              >
                Sign in →
              </Link>
            </div>
          )}
        </main>
        <StoreFooter />
      </StoreScene>
    </div>
  );
}
