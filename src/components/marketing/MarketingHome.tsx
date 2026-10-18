'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Globe,
  Wand2,
  ShieldCheck,
  Menu,
  X,
  Play,
} from 'lucide-react';

export function MarketingHome({ onEnterWorkspace }: { onEnterWorkspace?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      data-testid="marketing-home-page"
      className="min-h-screen bg-gradient-to-b from-[#0b1026] via-[#131b42] to-[#0f172a] text-white overflow-x-hidden"
    >
      {/* Top announcement bar matching 01_marketing_home.png */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>
          Gamma 5 is here — Meet the new Gamma Agent, Studio Mode &amp; Enterprise Governance
        </span>
        <Link href="/create" className="underline ml-1">
          Try it now →
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-lg shadow-lg">
              G
            </div>
            <span className="font-extrabold text-xl tracking-tight">GAMMA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
            <Link href="/create" className="hover:text-white">
              Product
            </Link>
            <Link href="/templates" className="hover:text-white">
              Templates
            </Link>
            <Link href="/sites" className="hover:text-white">
              Gamma Sites
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/signin"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-semibold transition"
          >
            Redeem Invite
          </Link>
          <button
            onClick={onEnterWorkspace}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition"
          >
            Open Workspace →
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          data-testid="mobile-marketing-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-6 space-y-3 bg-slate-900/95 border-b border-white/10">
          <Link href="/create" className="block py-2 text-sm font-semibold">
            AI Generator
          </Link>
          <Link href="/templates" className="block py-2 text-sm font-semibold">
            Templates
          </Link>
          <Link href="/pricing" className="block py-2 text-sm font-semibold">
            Pricing
          </Link>
          <Link href="/signin" className="block py-2 text-sm font-semibold text-indigo-400">
            Sign in
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-cyan-300 mb-6">
          <Wand2 className="w-3.5 h-3.5" />
          Powered by Gamma 5 Conversational Agent &amp; Fluid Smart Layouts
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
          A new medium for presenting ideas,{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            powered by AI.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-9 leading-relaxed">
          Generate polished presentations, responsive webpages, and executive documents
          in seconds. Refine cards with our conversational Agent, live themes, and
          enterprise-grade security.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/create/generate"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs/amqq3hoavnc5sek"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-cyan-300" />
            Launch Live Flagship Deck
          </Link>
        </div>

        {/* Interactive Hero Stage Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-lg">
            <Layers className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="font-bold text-base mb-1.5">Fluid Smart Layouts</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cards expand and reflow automatically across desktop and mobile. Convert
              bullets into 3-column boxes, timelines, pyramids, and interactive charts in
              one click.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-lg">
            <Globe className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="font-bold text-base mb-1.5">One-Click Gamma Sites</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Publish any deck as a responsive multi-section website with custom domains,
              navigation headers, and card-by-card engagement analytics.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-base mb-1.5">Enterprise Governance</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Invite-only account admission, single-use expiring invitation codes, Okta
              SAML 2.0 SSO, MCP connectors, and immutable security audit logs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
