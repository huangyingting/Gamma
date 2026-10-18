'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Shield, Zap, Building2 } from 'lucide-react';

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      subtitle: 'For individuals exploring AI-powered presentations',
      credits: '400 AI credits at signup',
      features: [
        'Unlimited users & viewers',
        'Generate up to 10 cards per prompt',
        'Export to PDF & PPTX (with Gamma badge)',
        '7-day version history snapshots',
      ],
      cta: 'Current Starter Tier',
      highlight: false,
    },
    {
      name: 'Plus',
      price: annual ? '$8' : '$10',
      subtitle: 'Remove branding and unlock custom card counts',
      credits: 'Unlimited AI creations (Standard)',
      features: [
        'Remove "Made with Gamma" badge',
        'Generate up to 20 cards per prompt',
        'Custom fonts & custom themes',
        '30-day version history snapshots',
      ],
      cta: 'Upgrade to Plus',
      highlight: false,
    },
    {
      name: 'Pro',
      price: annual ? '$15' : '$20',
      subtitle: 'Advanced AI models, custom domains & analytics',
      credits: 'Unlimited AI + Flux Pro 1.1 Images',
      features: [
        'Gamma 5 Research Mode with citations',
        'Custom domains for Gamma Sites',
        'Detailed card-by-card viewer analytics',
        'Password-protected public links & API access',
      ],
      cta: 'Upgrade to Pro',
      highlight: true,
    },
    {
      name: 'Enterprise / Ultra',
      price: annual ? '$45' : '$60',
      subtitle: 'Full security governance, SAML SSO, MCP & Audit Logs',
      credits: '12,450+ Shared Workspace Credits Pool',
      features: [
        'Okta SAML 2.0 SSO & SCIM Groups',
        'Immutable Security Audit Logs & Public Link Registry',
        'Ownerless Gammas & Unowned Folders recovery',
        'Custom MCP Connectors & Template Generation API',
      ],
      cta: 'Active Workspace Plan',
      highlight: false,
    },
  ];

  return (
    <div data-testid="pricing-page" className="min-h-screen bg-slate-950 text-white">
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-lg">
            G
          </div>
          <span className="font-bold text-xl tracking-tight">GAMMA</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/?view=marketing"
            className="text-sm text-slate-300 hover:text-white px-3 py-1.5"
          >
            Product Tour
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold"
          >
            Open Workspace
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Gamma 5 Pricing &amp; Enterprise Licensing
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Plans built for velocity at every scale
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            From individual storytellers to SAML-governed enterprise organizations.
          </p>

          <div className="inline-flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                annual ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Annual billing (Save 20%)
            </button>
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                !annual ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Monthly billing
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl p-6 flex flex-col justify-between border ${
                p.highlight
                  ? 'bg-gradient-to-b from-indigo-950/90 to-slate-900 border-indigo-400 shadow-2xl shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold">{p.name}</h2>
                  {p.highlight && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500 text-white">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 min-h-[34px]">{p.subtitle}</p>
                <div className="my-5">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className="text-xs text-slate-400"> / seat / month</span>
                </div>
                <div className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-3 py-2 mb-5">
                  ✨ {p.credits}
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/"
                className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition ${
                  p.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
