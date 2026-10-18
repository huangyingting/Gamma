'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('wlfjck@gmail.com');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f5f2] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
          <Mail className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Reset your password</h1>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Enter the email associated with your Gamma workspace account and we&apos;ll
          send password recovery instructions.
        </p>

        {sent ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Recovery instructions queued
            </div>
            <p>
              If an active account exists for <strong>{email}</strong>, a reset
              link has been logged. Administrators can also reset credentials via{' '}
              <code>npm run bootstrap:admin</code>.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
            >
              Send password reset link
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/signin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
