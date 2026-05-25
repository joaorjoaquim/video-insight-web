'use client';
import React, { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { store } from '../store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout, applyRefreshedToken, refreshSession } from '../slices/authSlice';
import { setLogoutHandler, setTokenRefreshedHandler, setAccessToken } from '../../lib/api/axios';
import { QueryProvider } from './QueryProvider';

const PROTECTED_PREFIXES = ['/dashboard', '/wallet', '/submissions'];

function isProtectedPath(path: string | null): boolean {
  if (!path) return false;
  return PROTECTED_PREFIXES.some(p => path.startsWith(p));
}

interface GlobalProviderProps {
  children: ReactNode;
}

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isSessionLoading, isAuthenticated } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    setLogoutHandler(() => {
      setAccessToken(null);
      store.dispatch(logout());
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    });

    setTokenRefreshedHandler((data) => {
      store.dispatch(applyRefreshedToken(data as any));
    });

    dispatch(refreshSession());
  }, [dispatch]);

  // After session check resolves: if unauthenticated on a protected route, redirect to home.
  // This handles expired/invalid sessions without an infinite navigation loop (public routes
  // render in place as unauthenticated).
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated && isProtectedPath(pathname)) {
      router.replace('/');
    }
  }, [isSessionLoading, isAuthenticated, pathname, router]);

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[var(--briefing-bg)] flex items-center justify-center">
        <div className="bars-loader"><i /><i /><i /><i /></div>
      </div>
    );
  }

  return <>{children}</>;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </QueryProvider>
    </Provider>
  );
}
