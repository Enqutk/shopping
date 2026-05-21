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

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = apiBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, init);
}
