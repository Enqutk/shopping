import axios, { type InternalAxiosRequestConfig } from 'axios';
import { apiBaseUrl, refreshSession } from './api-client';
import { clearSessionTokens, getAccessToken } from './session-auth';

/** Axios client: resolves base URL per request; auth via Bearer token in sessionStorage (per tab). */
export const api = axios.create();

type RetryConfig = InternalAxiosRequestConfig & { _authRetry?: boolean };

api.interceptors.request.use((config) => {
  config.baseURL = apiBaseUrl();
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }
    const status = error.response?.status;
    const config = error.config as RetryConfig;
    if (status === 401 && !config._authRetry) {
      config._authRetry = true;
      const refreshed = await refreshSession();
      if (refreshed) {
        return api.request(config);
      }
      clearSessionTokens();
    }
    return Promise.reject(error);
  },
);

export function getAxiosStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}
