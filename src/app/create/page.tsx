'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  Upload,
  LayoutTemplate,
  Wand2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export default function CreateHubPage() {
  const modes = [
    {
      title: 'Generate',
      badge: 'POPULAR',
      desc: 'Create from a one-line prompt in a few seconds with step-by-step outline & theme control.',
      href: '/create/generate',
      icon: Sparkles,
      gradient: 'from-indigo-600 via-violet-600 to-cyan-500',
    },
    {
      title: 'Paste in text',
      badge: 'NOTES / OUTLINE',
      desc: 'Create from existing notes, an outline, markdown, or executive brief content.',
      href: '/create/paste',
      icon: FileText,
      gradient: 'from-violet-600 to-fuchsia-600',
    },
    {
      title: 'Import file or URL',
      badge: 'PPTX / PDF / URL',
      desc: 'Enhance existing PowerPoint decks, PDFs, Word docs, or scrape any live webpage URL.',
      href: '/create/import',
      icon: Upload,
      gradient: 'from-blue-600 to-cyan-500',
    },
    {
      title: 'Create from template',
      badge: '12 CATEGORIES',
      desc: 'Start with a structural enterprise template and populate cards automatically with AI.',
      href: '/create/from-template',
      icon: LayoutTemplate,
      gradient: 'from-emerald-600 to-teal-500',
    },
    {
      title: 'Gamma 5 AI Studio Mode',
      badge: 'STUDIO V2',
      desc: 'Multi-artifact visual storyboarding for social carousels, infographics, and hero cards.',
      href: '/create/studio',
      icon: Wand2,
      gradient: 'from-amber-500 to-rose-600',
    },
  ];

  return (
    <div
      data-testid="create-hub-page"
      className="min-h-screen bg-gradient-to-br from-[#0b1026] via-[#131b42] to-[#0f172a] text-white p-6 flex flex-col justify-between"
    >
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <div className="text-xs font-semibold text-cyan-300">
          ✨ 12,450 Workspace AI Credits Available
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto my-auto py-12 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Create with Gamma 5 AI
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            How would you like to get started?
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Choose a creation workflow below. Every card is 100% editable with Smart Layouts, live themes, and the Gamma Agent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                href={m.href}
                data-testid={`create-mode-${m.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="group rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/60 p-5 flex flex-col justify-between transition shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                      {m.badge}
                    </span>
                  </div>
                  <h2 className="text-base font-bold mb-1.5 group-hover:text-cyan-300 transition">
                    {m.title}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-indigo-300 group-hover:text-white">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-3">
        Gamma 5 Creation Suite • Presentations • Webpages • Documents • Social
      </footer>
    </div>
  );
}
