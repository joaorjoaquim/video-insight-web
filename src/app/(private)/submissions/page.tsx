'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../../core/hooks';
import { logout } from '../../../core/slices/authSlice';
import { useAppDispatch } from '../../../core/hooks';

export default function SubmissionsPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src="/summary_videos_logo.png" 
                alt="SummaryVideos Logo" 
                className="h-8 w-auto mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Submissions</h2>
            <p className="text-gray-600">Manage your video submissions and track their analysis status.</p>
            
            <div className="mt-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📹</div>
                <p className="text-gray-500">No submissions yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Upload your first video to see it here
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 