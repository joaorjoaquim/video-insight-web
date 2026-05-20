'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../core/hooks';
import { closeAuthDialog, switchAuthMode } from '../core/slices/dialogSlice';
import { loginUser, signupUser, clearError } from '../core/slices/authSlice';
import { LoginFormData, SignupFormData } from '../types/auth';
import { getOAuthUrl } from '../lib/api/authApi';
import { useT } from '../lib/i18n';

export function AuthDialog() {
  const t = useT();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isOpen, mode } = useAppSelector((state: any) => state.dialog);
  const { isLoading, error, isAuthenticated } = useAppSelector((state: any) => state.auth);

  const [formData, setFormData] = useState<LoginFormData | SignupFormData>({ email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      dispatch(closeAuthDialog());
      router.push('/dashboard');
    }
  }, [isAuthenticated, isOpen, dispatch, router]);

  const validatePassword = (password: string) => {
    if (password.length < 8) return t('validation.password.length');
    if (!/(?=.*[a-z])/.test(password)) return t('validation.password.lowercase');
    if (!/(?=.*[A-Z])/.test(password)) return t('validation.password.uppercase');
    if (!/(?=.*\d)/.test(password)) return t('validation.password.number');
    if (!/(?=.*[@$!%*?&])/.test(password)) return t('validation.password.special');
    return '';
  };

  const handleClose = () => {
    dispatch(closeAuthDialog());
    dispatch(clearError());
    setFormData({ email: '', password: '' });
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      const err = validatePassword(formData.password);
      if (err) { setPasswordError(err); return; }
      if (formData.password !== confirmPassword) { setPasswordError(t('validation.password.match')); return; }
    }
    if (mode === 'login') {
      await dispatch(loginUser(formData as LoginFormData));
    } else {
      await dispatch(signupUser(formData as SignupFormData));
    }
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    if (mode === 'signup') setPasswordError(validatePassword(password));
  };

  const handleOAuth = (provider: 'google' | 'discord') => {
    window.location.href = getOAuthUrl(provider);
  };

  const switchMode = () => {
    const next = mode === 'login' ? 'signup' : 'login';
    dispatch(switchAuthMode(next));
    dispatch(clearError());
    setFormData({ email: '', password: '' });
    setConfirmPassword('');
    setPasswordError('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,17,23,0.7)' }}
      onClick={handleClose}
    >
      <div
        className="relative bg-[var(--briefing-bg)] rounded-[14px] p-8 w-full max-w-md"
        style={{ boxShadow: 'var(--shadow-modal)', fontFamily: 'var(--font-sans-br, system-ui, sans-serif)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          aria-label={t('auth.close')}
          className="absolute top-5 right-5 text-[var(--ink-3)] hover:text-[var(--ink-1)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="logo-bars"><i/><i/><i/></span>
          <span className="br-eyebrow">§ {mode === 'login' ? t('auth.section.login') : t('auth.section.signup')}</span>
        </div>
        <h3
          style={{ fontFamily: 'var(--font-display-br, Georgia, serif)', fontSize: '1.75rem', letterSpacing: '-0.012em', lineHeight: 1.15 }}
          className="text-[var(--ink-1)] mb-1"
        >
          {mode === 'login'
            ? <>{t('auth.headline.login')} <span className="ital-bar">{t('auth.headlineAccent.login')}</span>.</>
            : <>{t('auth.headline.signup')} <span className="ital-bar">{t('auth.headlineAccent.signup')}</span>.</>
          }
        </h3>
        <p className="br-eyebrow mb-6">
          {mode === 'login' ? t('auth.sub.login') : t('auth.sub.signup')}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="auth-email" className="br-eyebrow block mb-1.5">{t('auth.email')}</label>
            <input
              id="auth-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full border border-[var(--rule)] rounded-[6px] px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--bars)] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="br-eyebrow block mb-1.5">{t('auth.password')}</label>
            <input
              id="auth-password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[var(--rule)] rounded-[6px] px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--bars)] transition-colors"
            />
            {mode === 'signup' && formData.password && (
              <p className="br-eyebrow mt-1.5">{t('auth.passwordHint')}</p>
            )}
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-confirm" className="br-eyebrow block mb-1.5">{t('auth.confirmPassword')}</label>
              <input
                id="auth-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[var(--rule)] rounded-[6px] px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--bars)] transition-colors"
              />
            </div>
          )}

          {(error || passwordError) && (
            <p className="text-[var(--led-failed)] text-sm">{error || passwordError}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || (mode === 'signup' && (!!passwordError || formData.password !== confirmPassword))}
            className="flex items-center justify-center gap-2 w-full bg-[var(--play)] hover:bg-[var(--play-700)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-[6px] transition-colors text-sm mt-1"
          >
            {isLoading ? (
              <span className="bars-loader scale-75"><i/><i/><i/><i/></span>
            ) : (
              <>
                {mode === 'login' ? t('auth.submit.login') : t('auth.submit.signup')}
                <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--rule)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-[var(--briefing-bg)] br-eyebrow">{t('auth.or')}</span>
          </div>
        </div>

        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 border border-[var(--rule)] rounded-[6px] py-2.5 text-sm text-[var(--ink-2)] hover:border-[var(--ink-2)] hover:text-[var(--ink-1)] bg-white dark:bg-zinc-900 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => handleOAuth('discord')}
            className="flex items-center justify-center gap-2 border border-[var(--rule)] rounded-[6px] py-2.5 text-sm text-[var(--ink-2)] hover:border-[var(--ink-2)] hover:text-[var(--ink-1)] bg-white dark:bg-zinc-900 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#5865F2" d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.078.037c-.211.375-.445.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.319 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.01c.12.099.246.198.372.292a.077.077 0 0 1-.006.128c-.598.349-1.22.645-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discord
          </button>
        </div>

        {/* Switch mode */}
        <div className="text-center mt-6">
          <button onClick={switchMode} className="br-eyebrow hover:text-[var(--ink-1)] transition-colors">
            {mode === 'login' ? t('auth.switch.toSignup') : t('auth.switch.toLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
