'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, RefreshIcon } from '@hugeicons/core-free-icons';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  // Auto-redirect to home page after 10 seconds for critical errors
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleReset = () => {
    reset();
  };

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-950 dark:to-zinc-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="relative">
                <div className="text-8xl font-bold text-red-200 dark:text-red-800 mb-4">
                  ⚠️
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Something Went Wrong
              </h1>
              <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-2">
                An unexpected error occurred. We're working to fix it.
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Redirecting to home page in 10 seconds...
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Details (Development):
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={RefreshIcon} className="text-lg" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="w-full flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={Home01Icon} className="text-lg" />
                Go to Home Page
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                If this problem persists, please contact our support team with the error details.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 