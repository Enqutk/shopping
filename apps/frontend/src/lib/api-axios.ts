import axios from 'axios';
import { apiBaseUrl } from './api-client';

/** Axios client: resolves base URL per request so SSR never pins :3000 in the browser. */
export const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.baseURL = apiBaseUrl();
  return config;
});
