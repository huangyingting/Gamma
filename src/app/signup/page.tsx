'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState(
    searchParams.get('code') || searchParams.get('token') || 'GAMMA-EXEC-2026'
  );
  const [email, setEmail] = useState(
    searchParams.get('email') || 'alex.chen@genesisiq.ai'
  );
  const [name, setName] = useState('Alex Chen');
  const [password, setPassword] = useState('GammaInvitePass2026!');
  const [inviteStatus, setInviteStatus] = useState<{
    status: string;
    role?: string;
    maskedEmail?: string | null;
    email?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function verifyCode(targetCode: string) {
    if (!targetCode.trim()) {
      setInviteStatus(null);
      return;
    }
    try {
      const res = await fetch(
        `/api/invitations/verify?code=${encodeURIComponent(targetCode.trim())}`
      );
      const data = await res.json();
      if (data.invitation) {
        setInviteStatus(data.invitation);
        if (data.invitation.email && !searchParams.get('email')) {
          setEmail(data.invitation.email);
        }
      }
    } catch {
      setInviteStatus(null);
    }
  }

  useEffect(() => {
    verifyCode(code);
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          email: email.trim(),
          name: name.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || 'Invitation registration rejected.');
        setSubmitting(false);
        return;
      }

      router.push(
        `/signin?registered=1&email=${encodeURIComponent(email.trim())}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2] flex flex-col justify-between">
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/?view=marketing" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md">
            G
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            GAMMA
          </span>
        </Link>
        <Link
          href="/signin"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-semibold shadow-sm"
        >
          Sign in
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5" />
            Invite-Only Account Admission
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Accept your Gamma invitation
          </h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Public self-signup is disabled. Enter a valid single-use workspace
            invitation code issued for your email address.
          </p>

          {error && (
            <div
              data-testid="signup-error-alert"
              className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                  Single-Use Invitation Code
                </label>
                <button
                  type="button"
                  onClick={() => verifyCode(code)}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Verify code
                </button>
              </div>
              <input
                data-testid="signup-invite-code-input"
                type="text"
                required
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  verifyCode(e.target.value);
                }}
                placeholder="GAMMA-XXXX-XXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase tracking-wider focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
              {inviteStatus && (
                <div
                  data-testid="invite-verification-pill"
                  className={`mt-2 px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                    inviteStatus.status === 'pending'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status:{' '}
                    <strong className="uppercase">{inviteStatus.status}</strong>
                    {inviteStatus.maskedEmail
                      ? ` (${inviteStatus.maskedEmail})`
                      : ''}
                  </span>
                  {inviteStatus.role && (
                    <span className="px-2 py-0.5 rounded-md bg-white/80 font-bold text-[10px]">
                      Role: {inviteStatus.role}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Invited Email Address
              </label>
              <input
                data-testid="signup-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                data-testid="signup-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Create Password (min. 8 characters)
              </label>
              <input
                data-testid="signup-password-input"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <button
              data-testid="signup-submit-button"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              {submitting
                ? 'Redeeming Invitation...'
                : 'Redeem Invitation & Join Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        Single-use expiring invitations enforced with transactional Prisma lock &amp; AuditLog
      </footer>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f5f2]" />}>
      <SignUpContent />
    </Suspense>
  );
}
