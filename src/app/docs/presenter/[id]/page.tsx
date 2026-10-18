'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, ChevronLeft, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import type { DocDetail } from '@/components/editor/GammaEditor';

export default function PresenterSpeakerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [idx, setIdx] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    fetch(`/api/docs/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setDoc(json.doc);
      });
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentCard = doc?.cards[idx];
  const nextCard = doc?.cards[idx + 1];
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div
      data-testid="presenter-speaker-view"
      className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between"
    >
      <header className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/docs/${id}`}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
          <h1 className="text-sm font-bold">{doc?.title || 'Speaker View'}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {mins}:{secs}
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-6">
        {/* Current Slide Preview */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-white/15 p-8 space-y-4">
          <div className="text-xs font-bold uppercase text-indigo-400">
            Current Card ({idx + 1} of {doc?.cards.length || 1})
          </div>
          <h2 className="text-3xl font-black">{currentCard?.title}</h2>
          <p className="text-sm text-slate-300">{currentCard?.subtitle}</p>
        </div>

        {/* Next Card + Speaker Notes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-white/15 p-6 space-y-2">
            <div className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Speaker Notes &amp; Talking Points
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {currentCard?.speakerNotes ||
                'Emphasize real-time collaborative cards, Smart Layouts, and single-use invitation security.'}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 space-y-2">
            <div className="text-xs font-bold uppercase text-slate-400">
              Up Next
            </div>
            <div className="text-base font-bold">
              {nextCard ? nextCard.title : 'End of Deck — Q&A'}
            </div>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
        <button
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous Card
        </button>
        <button
          disabled={!doc || idx >= doc.cards.length - 1}
          onClick={() =>
            setIdx((i) => Math.min((doc?.cards.length || 1) - 1, i + 1))
          }
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold flex items-center gap-1"
        >
          Next Card <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
