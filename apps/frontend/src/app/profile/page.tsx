'use client';

import StoreHeader from '../../components/StoreHeader';
import { useAuthStore } from '../../store/auth.store';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  return (
    <div className="store-page">
      <StoreHeader />
      <main id="main-content" className="max-w-lg mx-auto px-4 py-10 w-full flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse h-40" aria-busy="true" />
        ) : user ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl text-indigo-600 font-bold">
                  {(user.name?.[0] ?? user.email[0] ?? '?').toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{user.name ?? 'User'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium">{user.role}</dd>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium break-all">{user.email}</dd>
            </dl>
          </div>
        ) : (
          <p className="text-gray-500">Sign in to view your profile.</p>
        )}
      </main>
    </div>
  );
}
