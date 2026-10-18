'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';

export default function CreatePastePage() {
  const router = useRouter();
  const [title, setTitle] = useState('Q4 Product Strategy & Architecture Notes');
  const [sourceText, setSourceText] = useState(
    `# Q4 Strategic Objectives\n- Accelerate enterprise adoption of Gamma 5 Agent across 14,000 seats\n- Launch custom font families, SVG icon libraries, and SAML 2.0 governance\n- Publish interactive customer roadmaps on custom Gamma Sites domains`
  );
  const [mode, setMode] = useState<'Condense' | 'Preserve' | 'Expand'>('Condense');
  const [format, setFormat] = useState<'PRESENTATION' | 'WEBPAGE' | 'DOCUMENT'>('PRESENTATION');
  const [loading, setLoading] = useState(false);

  async function handlePasteCreate() {
    setLoading(true);
    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        format,
        sourceText,
        density: mode,
      }),
    });
    const json = await res.json();
    if (json.ok && json.doc) {
      router.push(`/docs/${json.doc.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <div
      data-testid="create-paste-page"
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

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-5">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
            <FileText className="w-4 h-4" />
            Paste in Text, Markdown or Meeting Notes
          </div>
          <h1 className="text-2xl font-bold">
            Turn rough notes or documents into structured cards
          </h1>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white"
          />

          <textarea
            data-testid="paste-text-area"
            rows={8}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/15 text-sm font-mono text-white outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(['Condense', 'Preserve', 'Expand'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                    mode === m ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {m} text
                </button>
              ))}
            </div>

            <button
              data-testid="paste-continue-btn"
              disabled={loading}
              onClick={handlePasteCreate}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Converting to Cards...' : 'Convert to Gamma →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
