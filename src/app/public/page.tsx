'use client';
import React from 'react';
import { useAppDispatch } from '../../core/hooks';
import { openAuthDialog } from '../../core/slices/dialogSlice';
import { AuthDialog } from '../../components/AuthDialog';

export default function LandingPage() {
  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    dispatch(openAuthDialog('signup'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AuthDialog />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-bold">VideoInsight</div>
          <button
            onClick={() => dispatch(openAuthDialog('login'))}
            className="text-white hover:text-indigo-200 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Transform Your Videos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
              Into Insights
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-indigo-200 mb-8 max-w-3xl mx-auto">
            Upload your videos and get instant AI-powered analysis, summaries, and actionable insights to enhance your content strategy.
          </p>

          <button
            onClick={handleGetStarted}
            className="bg-white text-indigo-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Analysis</h3>
              <p className="text-indigo-200">
                Get detailed insights about your video content, audience engagement, and performance metrics.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Summaries</h3>
              <p className="text-indigo-200">
                Automatically generate concise summaries and key points from your video content.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-4">Actionable Insights</h3>
              <p className="text-indigo-200">
                Receive recommendations to improve your content and boost engagement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Videos?
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Join thousands of creators who are already using VideoInsight to enhance their content.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center text-indigo-200">
          <p>&copy; 2024 VideoInsight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 