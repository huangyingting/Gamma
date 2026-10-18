'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  Plus,
  Trash2,
  Sliders,
  Image as ImageIcon,
  Palette,
  Wand2,
} from 'lucide-react';

export default function CreateGeneratePage() {
  const router = useRouter();
  const [format, setFormat] = useState<'PRESENTATION' | 'WEBPAGE' | 'DOCUMENT' | 'SOCIAL'>(
    'PRESENTATION'
  );
  const [cardCount, setCardCount] = useState(5);
  const [language, setLanguage] = useState('English (US)');
  const [prompt, setPrompt] = useState(
    '2026 Enterprise AI Platform Strategy, Agentic Velocity & Cloud Governance'
  );
  const [step, setStep] = useState<1 | 2>(2);
  const [density, setDensity] = useState<'Brief' | 'Medium' | 'Detailed'>('Medium');
  const [imageModel, setImageModel] = useState('Flux Fast 1.1');
  const [themeId, setThemeId] = useState('theme_prism');
  const [outline, setOutline] = useState<string[]>([
    'Executive Vision & 2026 Enterprise AI Catalyst',
    'Three Pillars of Agentic Architecture (Smart Layout)',
    'Quarterly Velocity Benchmarks & Area Telemetry Chart',
    'Cross-Functional Rollout Timeline (Q1–Q4)',
    'Quantifiable ROI Metrics, SAML Governance & Next Steps',
  ]);
  const [generating, setGenerating] = useState(false);

  async function handleGenerateOutline() {
    const res = await fetch('/api/ai/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'outline',
        prompt,
      }),
    });
    const json = await res.json();
    if (json.ok && Array.isArray(json.outline)) {
      setOutline(json.outline);
      setStep(2);
    }
  }

  async function handleFinalCreate() {
    setGenerating(true);
    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: prompt,
        format,
        themeId,
        density,
        imageModel,
        outline,
      }),
    });
    const json = await res.json();
    if (json.ok && json.doc) {
      router.push(`/docs/${json.doc.id}`);
    } else {
      setGenerating(false);
    }
  }

  return (
    <div
      data-testid="create-generate-page"
      className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Create Hub
          </Link>
          <span className="text-xs font-semibold text-indigo-300">
            Step {step} of 2 • Prompt &amp; Outline Editor
          </span>
        </div>

        {/* Step 1: Format, Card Count, Language & Prompt */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(['PRESENTATION', 'WEBPAGE', 'DOCUMENT', 'SOCIAL'] as const).map((f) => (
                <button
                  key={f}
                  data-testid={`format-pill-${f.toLowerCase()}`}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    format === f
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white"
              >
                {[4, 5, 6, 8, 10].map((c) => (
                  <option key={c} value={c} className="text-slate-900">
                    {c} cards
                  </option>
                ))}
              </select>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white"
              >
                <option value="English (US)" className="text-slate-900">
                  English (US)
                </option>
                <option value="Español" className="text-slate-900">
                  Español
                </option>
                <option value="日本語" className="text-slate-900">
                  日本語
                </option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              data-testid="generate-prompt-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to make..."
              className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleGenerateOutline}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center justify-center gap-2 shrink-0"
            >
              <Wand2 className="w-4 h-4 text-cyan-300" />
              Refresh Outline
            </button>
          </div>
        </div>

        {/* Step 2: Card-by-Card Outline Editor + Settings (matching 64_create_generate_step2_outline_editor.png) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card-by-Card Outline List */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                Card-by-Card Outline ({outline.length} Cards)
              </h2>
              <button
                onClick={() =>
                  setOutline([...outline, `Card ${outline.length + 1}: Strategic Appendix`])
                }
                className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Card
              </button>
            </div>

            <div className="space-y-2.5">
              {outline.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3"
                >
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    data-testid={`outline-card-input-${idx}`}
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const next = [...outline];
                      next[idx] = e.target.value;
                      setOutline(next);
                    }}
                    className="flex-1 bg-transparent text-xs font-medium text-white outline-none"
                  />
                  {outline.length > 2 && (
                    <button
                      onClick={() => setOutline(outline.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Density, AI Image Model & Theme Picker */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Text Content Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Brief', 'Medium', 'Detailed'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDensity(d)}
                      className={`py-2 rounded-xl text-xs font-semibold ${
                        density === d
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  AI Image Model
                </label>
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white"
                >
                  <option value="Flux Fast 1.1" className="text-slate-900">
                    Flux Fast 1.1 (Default)
                  </option>
                  <option value="Imagen 3 Pro" className="text-slate-900">
                    Imagen 3 Pro (Ultra HD)
                  </option>
                  <option value="DALL-E 3 HD" className="text-slate-900">
                    DALL-E 3 HD
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                  <Palette className="w-3.5 h-3.5 text-violet-400" />
                  Visual Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'theme_prism', name: 'Prism Dark' },
                    { id: 'theme_stratos', name: 'Stratos Light' },
                    { id: 'theme_aurora', name: 'Aurora Emerald' },
                    { id: 'theme_obsidian', name: 'Obsidian Pro' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-left border ${
                        themeId === t.id
                          ? 'bg-indigo-600/30 border-indigo-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              data-testid="launch-generate-deck-btn"
              disabled={generating}
              onClick={handleFinalCreate}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Synthesizing Cards...' : 'Generate Gamma (40 credits)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
