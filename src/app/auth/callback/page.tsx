"use client"
import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../core/hooks';
import { setOAuthSession } from '../../../core/slices/authSlice';
import { setAccessToken } from '../../../lib/api/axios';
import * as authApi from '../../../lib/api/authApi';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const error = searchParams.get('error');

      if (accessToken) {
        try {
          setAccessToken(accessToken);
          const user = await authApi.getProfile();
          dispatch(setOAuthSession({ user, accessToken }));

          // If this was opened as a popup (GitHub link flow), notify opener and close
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'github_linked', success: true }, window.location.origin);
            window.close();
            return;
          }

          router.push('/dashboard');
        } catch {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'github_linked', success: false }, window.location.origin);
            window.close();
            return;
          }
          router.push('/dashboard');
        }
      } else if (error) {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'github_linked', success: false, error }, window.location.origin);
          window.close();
          return;
        }
        router.push('/?error=oauth_failed');
      } else {
        router.push('/');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen bg-[var(--briefing-bg)] flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="bars-loader"><i/><i/><i/><i/></div>
        <p className="br-eyebrow">Completing authentication…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--briefing-bg)] flex items-center justify-center">
        <div className="bars-loader"><i/><i/><i/><i/></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
