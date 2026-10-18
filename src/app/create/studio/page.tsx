'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wand2, Sparkles, Layers } from 'lucide-react';

export default function CreateStudioPage() {
  const router = useRouter();
  const [studioPrompt, setStudioPrompt] = useState(
    'Visual Storyboard: Autonomous Enterprise AI Architecture & Security Mesh'
  );
  const [aspect, setAspect] = useState<'16:9 Widescreen' | '4:5 Social Carousel' | '9:16 Story'>(
    '16:9 Widescreen'
  );

  async function handleLaunchStudio() {
    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: studioPrompt,
        format: 'SOCIAL',
      }),
    });
    const json = await res.json();
    if (json.ok && json.doc) {
      router.push(`/docs/${json.doc.id}`);
    }
  }

  return (
    <div
      data-testid="create-studio-page"
      className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 text-white p-6"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Create Hub
        </Link>

        <div className="bg-white/5 border border-white/15 rounded-3xl p-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
            <Wand2 className="w-3.5 h-3.5" />
            Gamma 5 AI Studio Mode (studioModeV2 • designAnything)
          </div>
          <h1 className="text-3xl font-black">
            Multi-Card Visual Storyboarding &amp; Infographic Studio
          </h1>
          <p className="text-sm text-slate-300">
            Generate cohesive visual carousels, architectural infographics, and executive storyboards with synchronized Flux 1.1 art direction.
          </p>

          <div className="flex flex-wrap gap-2">
            {(['16:9 Widescreen', '4:5 Social Carousel', '9:16 Story'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAspect(a)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  aspect === a ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-300'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={studioPrompt}
            onChange={(e) => setStudioPrompt(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm text-white"
          />

          <button
            data-testid="studio-launch-btn"
            onClick={handleLaunchStudio}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-bold flex items-center gap-2 shadow-xl"
          >
            <Sparkles className="w-4 h-4" />
            Synthesize Studio Storyboard →
          </button>
        </div>
      </div>
    </div>
  );
}
