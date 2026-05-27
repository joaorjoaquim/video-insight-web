import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

let _accessToken: string | null = null;
let _onLogout: (() => void) | null = null;
let _onTokenRefreshed: ((data: { accessToken: string; user: unknown }) => void) | null = null;

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
const pendingQueue: QueueEntry[] = [];

function flushQueue(token: string): void {
  pendingQueue.splice(0).forEach(({ resolve }) => resolve(token));
}

function rejectQueue(err: unknown): void {
  pendingQueue.splice(0).forEach(({ reject }) => reject(err));
}

function enqueue(): Promise<string> {
  return new Promise((resolve, reject) => pendingQueue.push({ resolve, reject }));
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function setLogoutHandler(fn: () => void): void {
  _onLogout = fn;
}

export function setTokenRefreshedHandler(
  fn: (data: { accessToken: string; user: unknown }) => void
): void {
  _onTokenRefreshed = fn;
}

const REFRESH_ENDPOINT = '/auth/refresh';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      // Network/timeout — transient, do not clear session
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Auth endpoints (login, signup, refresh) returning 401 means credential/token failure —
    // not an expired access token. Skip the refresh-retry entirely to prevent the interceptor
    // from calling /auth/refresh and then triggering a logout on bad-password errors.
    const AUTH_SKIP_URLS = [REFRESH_ENDPOINT, '/auth/login', '/auth/signup'];
    if (AUTH_SKIP_URLS.some(u => original.url?.includes(u))) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return enqueue().then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;

    try {
      const res = await api.post<{ accessToken: string; user: unknown }>(REFRESH_ENDPOINT);
      const { accessToken: newToken, user } = res.data;
      _accessToken = newToken;
      _onTokenRefreshed?.({ accessToken: newToken, user });
      flushQueue(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr: unknown) {
      const refreshAxiosErr = refreshErr as AxiosError;
      if (refreshAxiosErr.response?.status === 401) {
        // Definitive — refresh token rejected
        rejectQueue(refreshErr);
        performLogout();
      } else {
        // Network/5xx during refresh — transient, preserve session state
        rejectQueue(refreshErr);
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

function performLogout(): void {
  _accessToken = null;
  if (_onLogout) {
    _onLogout();
  } else if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export default api;
