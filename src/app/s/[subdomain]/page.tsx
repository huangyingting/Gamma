'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, Sparkles, ArrowUpRight, CheckCircle2, Layers } from 'lucide-react';

export default function PublishedSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = use(params);
  const [site, setSite] = useState<any | null>(null);
  const [doc, setDoc] = useState<any | null>(null);
  const [theme, setTheme] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/workspace')
      .then((r) => r.json())
      .then(async (wsJson) => {
        if (wsJson.ok && Array.isArray(wsJson.sites)) {
          const found =
            wsJson.sites.find((s: any) => s.subdomain === subdomain) ||
            wsJson.sites[0];
          if (found) {
            setSite(found);
            const docRes = await fetch(`/api/docs/${found.docId}`);
            const docJson = await docRes.json();
            if (docJson.ok && docJson.doc) {
              setDoc(docJson.doc);
              const matchedTheme = (docJson.themes || []).find(
                (t: any) => t.id === docJson.doc.themeId
              );
              setTheme(matchedTheme || null);
            }
          }
        }
      });
  }, [subdomain]);

  const bgColor = theme?.backgroundColor || '#0f172a';
  const surfaceColor = theme?.surfaceColor || '#1e293b';
  const textColor = theme?.textColor || '#f8fafc';
  const primaryColor = theme?.primaryColor || '#6366f1';

  return (
    <div
      data-testid="published-gamma-site"
      style={{ backgroundColor: bgColor, color: textColor }}
      className="min-h-screen transition-colors"
    >
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto sticky top-0 backdrop-blur-xl bg-slate-950/60 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{site?.customDomain || `${subdomain}.gamma.site`}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> SSL Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {doc && (
            <Link
              href={`/docs/${doc.id}`}
              className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              Edit in Gamma
            </Link>
          )}
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1"
          >
            Made with Gamma 5 <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-14 space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {site?.name || 'GenesisIQ 2026 Enterprise Architecture Portal'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            {site?.seoTitle || doc?.title || 'GenesisIQ 2026 Enterprise Architecture Portal'}
          </h1>
          <p className="opacity-80 max-w-2xl mx-auto text-base">
            {site?.seoDescription ||
              'Responsive multi-card web experience powered by Gamma Sites with automatic SEO metadata and zero-config SSL.'}
          </p>
        </div>

        {/* Live Published Cards from the Linked Document */}
        {doc?.cards && doc.cards.length > 0 && (
          <div className="space-y-6">
            {doc.cards.map((card: any, idx: number) => {
              let blocks: any[] = [];
              try {
                blocks = JSON.parse(card.blocksJson || '[]');
              } catch {
                blocks = [];
              }
              return (
                <article
                  key={card.id}
                  style={{ backgroundColor: surfaceColor }}
                  className="rounded-3xl border border-white/15 p-8 sm:p-10 shadow-xl space-y-4"
                >
                  <div
                    style={{ color: primaryColor }}
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    Section 0{idx + 1} • {card.layoutType}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">{card.title}</h2>
                  {card.subtitle && (
                    <p className="text-sm sm:text-base opacity-80">{card.subtitle}</p>
                  )}

                  {blocks.map((b: any, bIdx: number) => (
                    <div key={bIdx} className="pt-2">
                      {b.type === 'callout' && (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className="text-xs font-bold text-cyan-300 mb-1">
                            {b.title}
                          </div>
                          <p className="text-xs opacity-85">{b.text}</p>
                        </div>
                      )}
                      {(b.type === 'smart_boxes' || b.type === 'timeline') &&
                        Array.isArray(b.items) && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {b.items.map((it: any, i: number) => (
                              <div
                                key={i}
                                className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1"
                              >
                                <div className="text-xs font-bold text-cyan-300">
                                  {it.step}
                                </div>
                                <div className="text-sm font-bold">{it.title}</div>
                                <p className="text-xs opacity-75">{it.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      {b.type === 'stats' && Array.isArray(b.items) && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {b.items.map((st: any, i: number) => (
                            <div
                              key={i}
                              className="p-4 rounded-2xl bg-white/5 border border-white/10"
                            >
                              <div className="text-2xl font-black text-cyan-300">
                                {st.value}
                              </div>
                              <div className="text-xs font-bold mt-1">{st.label}</div>
                              <div className="text-[10px] opacity-65">{st.delta}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
