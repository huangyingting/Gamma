'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutTemplate, Sparkles } from 'lucide-react';

export default function CreateFromTemplatePage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(
    'Executive Product Roadmap & OKRs'
  );
  const [customTopic, setCustomTopic] = useState(
    'Q4 2026 Enterprise AI Agent Rollout & Security Milestones'
  );

  const blueprints = [
    {
      title: 'Executive Product Roadmap & OKRs',
      category: 'Strategy',
      cards: 8,
    },
    {
      title: 'Venture Capital Series B Pitch Deck',
      category: 'Fundraising',
      cards: 10,
    },
    {
      title: 'Enterprise Solution Architecture Proposal',
      category: 'Sales',
      cards: 7,
    },
    {
      title: 'Quarterly Business Review (QBR) Telemetry',
      category: 'Reporting',
      cards: 8,
    },
  ];

  async function handleCreate() {
    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${selectedTemplate}: ${customTopic}`,
        format: 'PRESENTATION',
      }),
    });
    const json = await res.json();
    if (json.ok && json.doc) {
      router.push(`/docs/${json.doc.id}`);
    }
  }

  return (
    <div
      data-testid="create-from-template-page"
      className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Create Hub
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase">
            <LayoutTemplate className="w-4 h-4" />
            Template-Driven AI Synthesis
          </div>
          <h1 className="text-2xl font-bold">
            Select a structural blueprint &amp; describe your topic
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blueprints.map((b) => (
              <button
                key={b.title}
                onClick={() => setSelectedTemplate(b.title)}
                className={`p-4 rounded-2xl border text-left transition ${
                  selectedTemplate === b.title
                    ? 'bg-indigo-600/30 border-indigo-400'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-cyan-300">
                  {b.category} • {b.cards} cards
                </div>
                <div className="font-bold text-sm mt-1">{b.title}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Your Topic &amp; Context
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-sm text-white"
            />
          </div>

          <button
            data-testid="generate-from-template-btn"
            onClick={handleCreate}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate from Template →
          </button>
        </div>
      </div>
    </div>
  );
}
