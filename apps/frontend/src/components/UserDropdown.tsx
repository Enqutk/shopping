'use client';

import { useAuthStore } from '../store/auth.store';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UserDropdown() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/logout`,
        { withCredentials: true }
      );
      logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-3">
        {user.avatar ? (
          <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            {user.name.charAt(0)}
          </div>
        )}
        <span className="text-sm font-medium">{user.name}</span>
        <button
          onClick={handleLogout}
          className="ml-4 text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
