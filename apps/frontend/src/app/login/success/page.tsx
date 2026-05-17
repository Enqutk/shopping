'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/auth.store';
import axios from 'axios';

export default function LoginSuccessPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/me`,
          { withCredentials: true }
        );
        if (response.data) {
          setUser(response.data);
          router.push('/');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
        router.push('/login');
      }
    };

    fetchProfile();
  }, [router, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Completing login...</p>
    </div>
  );
}
