'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Globe, HardDrive, Sparkles } from 'lucide-react';

export default function CreateImportPage() {
  const router = useRouter();
  const [importUrl, setImportUrl] = useState('https://genesisiq.ai/architecture-2026');
  const [loading, setLoading] = useState(false);

  async function handleImport(title: string) {
    setLoading(true);
    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        format: 'PRESENTATION',
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
      data-testid="create-import-page"
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
          <h1 className="text-2xl font-bold">Import file, Google Drive doc, or URL</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleImport('Imported PowerPoint Executive Deck')}
              className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-left space-y-2"
            >
              <Upload className="w-6 h-6 text-indigo-400" />
              <div className="font-bold text-sm">Upload PPTX, PDF, or DOCX</div>
              <p className="text-xs text-slate-400">
                Convert slides or documents into fluid Gamma cards.
              </p>
            </button>

            <button
              onClick={() => handleImport('Google Drive Q4 OKR Presentation')}
              className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-left space-y-2"
            >
              <HardDrive className="w-6 h-6 text-cyan-400" />
              <div className="font-bold text-sm">Import from Google Drive</div>
              <p className="text-xs text-slate-400">
                Connected via Workspace MCP Connector.
              </p>
            </button>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/15 space-y-3">
              <Globe className="w-6 h-6 text-emerald-400" />
              <div className="font-bold text-sm">Import from Webpage URL</div>
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white"
              />
              <button
                data-testid="import-url-btn"
                disabled={loading}
                onClick={() => handleImport(`Webpage Import: ${importUrl}`)}
                className="w-full py-2 rounded-xl bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Import URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
