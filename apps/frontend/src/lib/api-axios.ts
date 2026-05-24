import axios, { type InternalAxiosRequestConfig } from 'axios';
import { apiBaseUrl, refreshSession } from './api-client';

/** Axios client: resolves base URL per request so SSR never pins :3000 in the browser. */
export const api = axios.create({
  withCredentials: true,
});

type RetryConfig = InternalAxiosRequestConfig & { _authRetry?: boolean };

api.interceptors.request.use((config) => {
  config.baseURL = apiBaseUrl();
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
