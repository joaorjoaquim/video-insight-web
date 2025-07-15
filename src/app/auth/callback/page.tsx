"use client"
import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../core/hooks';
import { setOAuthSession } from '../../../core/slices/authSlice';
import * as authApi from '../../../lib/api/authApi';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (token) {
        try {
          // Store token in localStorage for client-side access
          localStorage.setItem('auth_token', token);
          
          // Set token in cookie for server-side access
          document.cookie = `auth_token=${token}; path=/; max-age=${15 * 24 * 60 * 60}; samesite=lax`;
          
          // Fetch user profile to get complete user data
          const user = await authApi.getProfile();
          
          // Dispatch OAuth session action
          dispatch(setOAuthSession({ user, token }));
          
          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // If profile fetch fails, still redirect but user will need to refresh
          router.push('/dashboard');
        }
      } else if (error) {
        // Redirect to public page with error
        router.push('/public?error=oauth_failed');
      } else {
        // No token or error, redirect to public page
        router.push('/public');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Completing authentication...
        </h1>
        <p className="text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h1>
          <p className="text-gray-600">Please wait.</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 