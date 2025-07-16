'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export default function NotFound() {
  const router = useRouter();

  // Auto-redirect to home page after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl font-bold text-zinc-200 dark:text-zinc-800 mb-4">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl">🤖</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Page Not Found
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Redirecting to home page in 5 seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={Home01Icon} className="text-lg" />
            Go to Home Page
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="text-lg" />
            Go Back
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
} 