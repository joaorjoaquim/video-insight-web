'use client';
import React, { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchProfile } from '../slices/authSlice';

interface GlobalProviderProps {
  children: ReactNode;
}

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, user } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, isAuthenticated, user]);

  return <>{children}</>;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  );
} 