/**
 * In the browser, use same-origin `/api` so Next.js can rewrite to Nest on :3000
 * (avoids CORS and connection issues). Server components use the full URL.
 */
export function apiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    if (!env || env.includes('localhost:3000') || env.includes('127.0.0.1:3000')) {
      return '/api';
    }
    return env;
  }
  return env || 'http://localhost:3000/api';
}

/** Refresh the access_token cookie using refresh_token. */
export async function refreshSession(): Promise<boolean> {
  const base = apiBaseUrl();
  try {
    const res = await fetch(`${base}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch(
  path: string,
  init?: RequestInit & { _authRetry?: boolean },
): Promise<Response> {
  const base = apiBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const { _authRetry, ...fetchInit } = init ?? {};
  const opts: RequestInit = { credentials: 'include', ...fetchInit };

  let res = await fetch(url, opts);
  if (res.status === 401 && !_authRetry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await apiFetch(path, { ...init, _authRetry: true });
    }
  }
  return res;
}
