'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../core/hooks';
import { openAuthDialog } from '../core/slices/dialogSlice';
import { HugeiconsIcon } from '@hugeicons/react'
import { AiBrain03Icon, ChartLineData02Icon, ZapIcon } from '@hugeicons/core-free-icons';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Se autenticado, vai para o dashboard
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      // Se não autenticado, mostra a landing page (não redireciona)
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  // Se está carregando e autenticado, mostra loading
  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h1>
          <p className="text-gray-600">Please wait.</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, mostra a landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Fallback
  return null;
}

// Componente da landing page (movido da página pública)
function LandingPage() {
  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    dispatch(openAuthDialog('login'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="px-3 md:px-6 py-4 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/summary_videos_logo.png" 
              alt="SummaryVideos Logo" 
              className="h-8 w-auto"
            />
            <div className="text-black text-2xl font-bold">SummaryVideos</div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGetStarted}
              className="bg-white border border-indigo-900 text-indigo-900 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-3 py-10 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl leading-tight sm:text-5xl md:text-6xl font-bold text-black mb-4 sm:mb-6">
            Transform Your Videos Into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F2A240] via-[#af65ab] to-[#7E1DFD] leading-[1.1] sm:leading-tight">
              Powerful Insights
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Upload your videos and get AI-powered analysis, summaries, and actionable insights 
            to enhance your content strategy and reach more viewers.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Start Analyzing Videos
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-3 py-10 md:py-20 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Why Choose SummaryVideos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#7E1DFD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon icon={AiBrain03Icon} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-indigo-200">
                Advanced AI algorithms analyze your content and provide detailed insights about viewer engagement, content quality, and optimization opportunities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#7E1DFD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={ChartLineData02Icon} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Detailed Analytics</h3>
              <p className="text-indigo-200">
                Get comprehensive analytics including viewer retention, engagement metrics, and content performance insights to optimize your strategy.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#7E1DFD] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={ZapIcon} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-indigo-200">
                Process videos quickly with our optimized infrastructure. Get results in minutes, not hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-3 py-10 sm:px-6 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Transform Your Content?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-indigo-200 mb-6 sm:mb-8">
            Join thousands of creators who are already using SummaryVideos to enhance their content.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-3 md:px-6 py-8 border-t border-white/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img 
              src="/summary_videos_logo.png" 
              alt="SummaryVideos Logo" 
              className="h-6 w-auto"
            />
            <span className="text-white font-semibold">SummaryVideos</span>
          </div>
          <p className="text-indigo-200">&copy; 2025 SummaryVideos. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
