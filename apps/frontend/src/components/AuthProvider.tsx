'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/me`,
          { withCredentials: true }
        );
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
