'use client';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../core/hooks';
import { openAuthDialog, closeAuthDialog, switchAuthMode } from '../core/slices/dialogSlice';
import { loginUser, signupUser, clearError } from '../core/slices/authSlice';
import { LoginFormData, SignupFormData } from '../types/auth';
import { getOAuthUrl } from '../lib/api/authApi';

export function AuthDialog() {
  const dispatch = useAppDispatch();
  const { isOpen, mode } = useAppSelector((state: any) => state.dialog);
  const { isLoading, error } = useAppSelector((state: any) => state.auth);

  const [formData, setFormData] = useState<LoginFormData | SignupFormData>({
    email: '',
    password: '',
  });

  const handleClose = () => {
    dispatch(closeAuthDialog());
    dispatch(clearError());
    setFormData({ email: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      await dispatch(loginUser(formData as LoginFormData));
    } else {
      await dispatch(signupUser(formData as SignupFormData));
    }
  };

  const handleOAuth = (provider: 'google' | 'discord') => {
    window.location.href = getOAuthUrl(provider);
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    dispatch(switchAuthMode(newMode));
    dispatch(clearError());
    setFormData({ email: '', password: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Google
            </button>
            <button
              onClick={() => handleOAuth('discord')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Discord
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={switchMode}
            className="text-indigo-600 hover:text-indigo-500"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </div>
    </div>
  );
} 