'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/auth.store';
import { apiBaseUrl } from '../../lib/api-client';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
}

function passwordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const isRegister = mode === 'register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checks = useMemo(() => passwordChecks(password), [password]);
  const strengthScore = Object.values(checks).filter(Boolean).length;
  const passwordStrong = strengthScore === 5;

  const backendUrl = apiBaseUrl();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (!passwordStrong) {
          setError(
            'Use a stronger password: 8+ characters with uppercase, lowercase, number, and symbol.',
          );
          return;
        }
      }

      const path = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const { data } = await axios.post(`${backendUrl}${path}`, body, {
        withCredentials: true,
      });

      setUser(data.user);
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/');
      router.refresh();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : String(err.response.data.message)
          : err instanceof Error
            ? err.message
            : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page min-h-screen flex bg-femme-black">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden border-r border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1600&q=80)',
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-femme-black via-femme-black/80 to-transparent" />
        <div className="relative z-10 max-w-md">
          <p className="font-script text-femme-champagne text-4xl mb-4">Natural Beauty</p>
          <h1 className="font-display text-4xl uppercase tracking-wide text-white leading-tight">
            {isRegister ? 'Join the collection' : 'Welcome back'}
          </h1>
          <p className="text-arctic-light mt-4 normal-case tracking-normal leading-relaxed">
            {isRegister
              ? 'Create your account to track orders, save your cart, and shop exclusive drops.'
              : 'Sign in to continue where you left off.'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="font-display text-xl uppercase tracking-[0.2em] text-white lg:hidden mb-8 inline-block"
          >
            LUXE
          </Link>

          <p className="font-script text-femme-champagne text-2xl mb-1">
            {isRegister ? 'Create account' : 'Sign in'}
          </p>
          <h2 className="font-display text-3xl uppercase tracking-wide text-white">
            {isRegister ? 'Register' : 'Welcome'}
          </h2>
          <p className="text-arctic-light text-sm mt-2 mb-8 normal-case">
            {isRegister
              ? 'Use your email or continue with Google'
              : 'Email sign-in or Google'}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {isRegister && (
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-arctic-light">
                  Full name
                </span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input mt-1.5"
                  placeholder="Your name"
                />
              </label>
            )}

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-arctic-light">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input mt-1.5"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-arctic-light">
                Password
              </span>
              <input
                type="password"
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input mt-1.5"
                placeholder="••••••••"
              />
            </label>

            {isRegister && (
              <>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-arctic-light">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input mt-1.5"
                    placeholder="••••••••"
                  />
                </label>
                {password.length > 0 && (
                  <p
                    className={`text-xs normal-case ${
                      passwordStrong ? 'text-femme-champagne' : 'text-arctic-light'
                    }`}
                  >
                    {passwordStrong ? 'Strong password' : 'Add upper, lower, number & symbol (8+ chars)'}
                  </p>
                )}
              </>
            )}

            {error && (
              <p className="text-sm text-rose-400 normal-case tracking-normal" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="femme-divider !my-0" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-femme-black px-3 text-[10px] uppercase tracking-widest text-arctic-light">
              or
            </span>
          </div>

          <a
            href={`${backendUrl}/auth/google`}
            className="flex items-center justify-center w-full gap-3 px-6 py-3 border border-white/30 text-sm font-semibold text-white hover:border-femme-champagne hover:text-femme-champagne transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-5 h-5" />
            Continue with Google
          </a>

          <p className="text-center text-xs text-arctic-light mt-8 normal-case">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <Link href="/login" className="text-femme-champagne hover:underline font-semibold">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{' '}
                <Link href="/register" className="text-femme-champagne hover:underline font-semibold">
                  Create an account
                </Link>
              </>
            )}
            <span className="block mt-3">
              <Link href="/products" className="hover:text-white transition-colors">
                Browse as guest →
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
