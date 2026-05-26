/** Per-tab auth tokens (sessionStorage is isolated per browser tab). */

const ACCESS_KEY = 'luxe_access_token';
const REFRESH_KEY = 'luxe_refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setSessionTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  sessionStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearSessionTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

/** Google OAuth redirect puts tokens in the URL hash — store them once per page load. */
export function consumeOAuthTokensFromUrl(): boolean {
  if (typeof window === 'undefined' || !window.location.hash) return false;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const access = params.get('access_token');
  const refresh = params.get('refresh_token');
  if (!access || !refresh) return false;

  setSessionTokens(access, refresh);
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search,
  );
  return true;
}

export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function withAuthHeaders(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return { ...init, headers };
}
