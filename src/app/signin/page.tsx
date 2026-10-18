'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  ArrowRight,
  Lock,
} from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired') === '1';
  const revoked = searchParams.get('revoked') === '1';
  const registered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState(
    searchParams.get('email') || 'wlfjck@gmail.com'
  );
  const [password, setPassword] = useState('GammaAdminPassword2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [ssoMode, setSsoMode] = useState(false);
  const [error, setError] = useState<string | null>(
    revoked
      ? 'Your workspace account access has been revoked by an administrator.'
      : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);
    if (res?.error) {
      if (res.error.includes('ACCOUNT_REVOKED')) {
        setError(
          'Access revoked: Your account has been deactivated by a workspace administrator.'
        );
      } else {
        setError('Invalid email or password. Please verify your credentials.');
      }
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2] flex flex-col justify-between relative overflow-hidden">
      {/* Decorative gradient orbs matching gamma.app/signin */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />

      {/* Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <Link href="/?view=marketing" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md">
            G
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            GAMMA
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            5.0 Enterprise
          </span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/pricing"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-800 font-semibold shadow-sm transition"
          >
            Redeem Invite Code
          </Link>
        </div>
      </header>

      {/* Main Sign-in Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-[430px] bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign in to Gamma
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Invite-only AI presentation, document &amp; agent workspace
            </p>
          </div>

          {registered && (
            <div
              data-testid="registration-success-banner"
              className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Invitation redeemed! Your account is active — sign in below.
              </span>
            </div>
          )}

          {error && (
            <div
              data-testid="signin-error-alert"
              className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google & SAML SSO Buttons */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={() => setSsoMode(!ssoMode)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2.5 transition"
            >
              <KeyRound className="w-4 h-4 text-indigo-600" />
              {ssoMode ? 'Use Email & Password' : 'Single sign-on (SAML 2.0 SSO)'}
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              or continue with email
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <input
                data-testid="signin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
              />
            </div>

            {!ssoMode && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    data-testid="signin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              data-testid="signin-submit-button"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
            >
              {loading
                ? 'Authenticating...'
                : ssoMode
                ? 'Continue with Okta SAML SSO'
                : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Have an invitation code?{' '}
              <Link
                href="/signup"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Redeem invite &amp; create account
              </Link>
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px]">
              <Lock className="w-3 h-3 text-indigo-600" />
              Invite-Only Admission • CLI Admin Bootstrap
            </div>
          </div>
        </div>
      </main>

      {/* Session Expired Toast (matching 03_signin_session_expired_toast.png) */}
      {(expired || revoked) && (
        <div
          data-testid="session-expired-toast"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <div>
            <div className="font-semibold text-xs">
              {revoked ? 'Account Access Revoked' : "You've been signed out."}
            </div>
            <div className="text-[11px] text-slate-300">
              {revoked
                ? 'Your session was terminated by a workspace admin.'
                : 'Please sign in again to continue to your workspace.'}
            </div>
          </div>
        </div>
      )}

      <footer className="py-4 text-center text-xs text-slate-400">
        Gamma 5 Enterprise Workspace • Protected by NextAuth &amp; CASL RBAC
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f5f2]" />}>
      <SignInContent />
    </Suspense>
  );
}
