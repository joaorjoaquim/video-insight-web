'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  // Auto-redirect to home page after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 8000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-orange-950 dark:to-zinc-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl font-bold text-orange-200 dark:text-orange-800 mb-4">
              ⚡
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Something Went Wrong
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-2">
            We encountered an error while loading this page.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Redirecting to home page in 8 seconds...
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-left">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
              Error Details (Development):
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 font-mono">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
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
            <HugeiconsIcon icon={ArrowLeft01Icon} className="text-lg" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="text-lg" />
            Go Back
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
            If this problem persists, please try refreshing the page or contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
} 