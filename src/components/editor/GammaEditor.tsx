'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Home,
  Sparkles,
  Palette,
  Share2,
  Play,
  MoreHorizontal,
  Plus,
  Trash2,
  Copy,
  Wand2,
  Sliders,
  LayoutGrid,
  BarChart3,
  MessageSquare,
  History,
  FileCode,
  Settings2,
  Image as ImageIcon,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  List,
  Type,
  Paperclip,
  Globe,
  Send,
} from 'lucide-react';

export interface CardItem {
  id: string;
  orderIndex: number;
  title: string;
  subtitle?: string | null;
  layoutType: string;
  accentPosition: string;
  backgroundColor?: string | null;
  accentImageUrl?: string | null;
  bgColor?: string | null;
  bgImage?: string | null;
  fullBleed: boolean;
  contentAlignment: string;
  smartLayoutConfigJson?: string | null;
  smartLayoutJson?: string | null;
  blocksJson: string;
  chartConfigJson?: string | null;
  chartDataJson?: string | null;
  speakerNotes?: string | null;
}

export interface DocDetail {
  id: string;
  title: string;
  slug?: string;
  format: string;
  themeId: string;
  status: string;
  workspaceAccess?: string;
  publicAccess?: string;
  viewCount: number;
  isFavorite: boolean;
  customCodeJson?: string | null;
  pageSetupJson?: string | null;
  cards: CardItem[];
  snapshots: Array<{
    id: string;
    versionNumber: number;
    label: string;
    authorName?: string;
    authorEmail?: string;
    summary?: string;
    createdAt: string;
  }>;
  comments: Array<{
    id: string;
    cardId?: string | null;
    authorName: string;
    authorEmail?: string;
    content?: string;
    body?: string;
    reactionsJson?: string;
    resolved: boolean;
    createdAt: string;
  }>;
}

type RightDrawerMode =
  | null
  | 'theme'
  | 'share'
  | 'history'
  | 'page-setup'
  | 'analytics'
  | 'custom-code'
  | 'insert-media'
  | 'comments'
  | 'chart-editor';

export function GammaEditor({
  docId,
  initialPresentMode = false,
  readOnly = false,
}: {
  docId: string;
  initialPresentMode?: boolean;
  readOnly?: boolean;
}) {
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCardIdx, setActiveCardIdx] = useState(0);

  // Panels & popovers
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentMode, setAgentMode] = useState<'EXPRESS' | 'STANDARD' | 'RESEARCH'>('STANDARD');
  const [agentInput, setAgentInput] = useState('');
  const [agentMessages, setAgentMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string }>
  >([
    {
      role: 'assistant',
      text: 'Hi! I am the Gamma 5 Agent. Ask me to rewrite cards, switch Smart Layouts, or synthesize new executive metrics.',
    },
  ]);

  const [rightDrawer, setRightDrawer] = useState<RightDrawerMode>(null);
  const [docMenuOpen, setDocMenuOpen] = useState(false);
  const [presentMode, setPresentMode] = useState(initialPresentMode);

  // Card-level popovers
  const [stylingPopoverCardId, setStylingPopoverCardId] = useState<string | null>(null);
  const [smartLayoutPopoverCardId, setSmartLayoutPopoverCardId] = useState<string | null>(
    null
  );
  const [slashMenuCardId, setSlashMenuCardId] = useState<string | null>(null);
  const [filmstripMenuCardId, setFilmstripMenuCardId] = useState<string | null>(null);
  const [notesOpenCardId, setNotesOpenCardId] = useState<string | null>(null);
  const [editingChartCardId, setEditingChartCardId] = useState<string | null>(null);

  // Formatting bar state
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [activeTextColor, setActiveTextColor] = useState('#6366f1');

  // Comment, Snapshot, Page Setup & Export state
  const [newCommentText, setNewCommentText] = useState('');
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [customHeadCode, setCustomHeadCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchDoc = useCallback(async () => {
    try {
      const docRes = await fetch(`/api/docs/${docId}`);
      const docJson = await docRes.json();
      if (docJson.ok && docJson.doc) {
        setDoc(docJson.doc);
        try {
          const parsedCode = JSON.parse(docJson.doc.customCodeJson || '{}');
          setCustomHeadCode(parsedCode.headHtml || '');
        } catch {
          setCustomHeadCode('');
        }
      }
      if (docJson.ok && Array.isArray(docJson.themes)) {
        setThemes(docJson.themes);
      }
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  async function mutateDoc(payload: Record<string, unknown>) {
    const res = await fetch(`/api/docs/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.ok && json.doc) {
      setDoc(json.doc);
    } else if (json.ok) {
      await fetchDoc();
    }
    return json;
  }

  function downloadArtifact(filename: string, mimeType: string, content: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleExportDeck(kind: 'pdf' | 'html' | 'md' | 'json') {
    if (!doc) return;
    const safeSlug = doc.slug || doc.id;
    if (kind === 'pdf') {
      window.print();
      return;
    }
    if (kind === 'json') {
      downloadArtifact(
        `${safeSlug}.gamma.json`,
        'application/json',
        JSON.stringify(doc, null, 2)
      );
      return;
    }
    if (kind === 'md') {
      const md = [
        `# ${doc.title}`,
        `> Format: ${doc.format} | Theme: ${doc.themeId}`,
        '',
        ...doc.cards.map(
          (c, i) =>
            `## Card ${i + 1}: ${c.title}\n${c.subtitle ? `*${c.subtitle}*\n` : ''}\n- Layout: ${
              c.layoutType
            }\n- Speaker Notes: ${c.speakerNotes || 'None'}\n`
        ),
      ].join('\n');
      downloadArtifact(`${safeSlug}.md`, 'text/markdown', md);
      return;
    }
    if (kind === 'html') {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${doc.title}</title><style>body{background:#0f172a;color:#f8fafc;font-family:system-ui,sans-serif;padding:40px;max-width:960px;margin:0 auto}.card{background:#1e293b;border-radius:24px;padding:32px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.12)}</style></head><body><h1>${doc.title}</h1>${doc.cards
        .map(
          (c, i) =>
            `<section class="card"><small>Card ${i + 1} • ${c.layoutType}</small><h2>${
              c.title
            }</h2><p>${c.subtitle || ''}</p></section>`
        )
        .join('')}</body></html>`;
      downloadArtifact(`${safeSlug}.html`, 'text/html', html);
    }
  }

  async function handleSendAgent() {
    if (!agentInput.trim()) return;
    const prompt = agentInput;
    setAgentInput('');
    setAgentMessages((prev) => [...prev, { role: 'user', text: prompt }]);

    const activeCard = doc?.cards[activeCardIdx];
    const res = await fetch('/api/ai/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        mode: agentMode,
        docId,
        cardId: activeCard?.id,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setAgentMessages((prev) => [...prev, { role: 'assistant', text: json.reply }]);
      await fetchDoc();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-sm font-semibold text-indigo-300 animate-pulse">
          Loading Gamma 5 Collaborative Card Editor...
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="text-lg font-bold">Gamma Document Not Found</div>
        <Link href="/" className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold">
          Return to Workspace
        </Link>
      </div>
    );
  }

  const matchedTheme = themes.find((t) => t.id === doc.themeId) || themes[0];
  const currentTheme = {
    id: matchedTheme?.id || doc.themeId || 'theme_prism',
    name: matchedTheme?.name || 'Prism Dark',
    mode: matchedTheme?.category || 'STANDARD',
    primaryColor: matchedTheme?.primaryColor || '#6366f1',
    accentColor: matchedTheme?.accentColor || '#06b6d4',
    bgColor: matchedTheme?.backgroundColor || matchedTheme?.bgColor || '#0b1026',
    cardBgColor: matchedTheme?.surfaceColor || matchedTheme?.cardBgColor || '#131b3d',
    textColor: matchedTheme?.textColor || '#f8fafc',
    headingFont: matchedTheme?.headingFont || 'Plus Jakarta Sans',
    bodyFont: matchedTheme?.bodyFont || 'Inter',
  };

  let pageSetup = {
    aspectRatio: '16:9 Widescreen',
    cardWidth: 'medium',
    backdrop: 'aurora',
    showPageNumbers: true,
  };
  if (doc.pageSetupJson) {
    try {
      pageSetup = { ...pageSetup, ...JSON.parse(doc.pageSetupJson) };
    } catch {
      // fallback
    }
  }

  // Fullscreen Presentation Mode
  if (presentMode) {
    const slide = doc.cards[activeCardIdx] || doc.cards[0];
    return (
      <div
        data-testid="fullscreen-presenter-overlay"
        style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor }}
        className="fixed inset-0 z-50 flex flex-col justify-between p-8 sm:p-16"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold">
              {doc.title}
            </span>
            <span className="text-xs opacity-70">
              Card {activeCardIdx + 1} of {doc.cards.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/docs/presenter/${doc.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5"
            >
              <Monitor className="w-3.5 h-3.5" />
              Speaker View
            </Link>
            <button
              data-testid="exit-present-mode-btn"
              onClick={() => setPresentMode(false)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              Exit Presentation (Esc)
            </button>
          </div>
        </div>

        {slide && (
          <div
            style={{ backgroundColor: currentTheme.cardBgColor }}
            className="max-w-5xl w-full mx-auto my-auto rounded-3xl p-10 sm:p-14 border border-white/15 shadow-2xl space-y-6"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Card {activeCardIdx + 1} • {slide.layoutType}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-base sm:text-xl opacity-80">{slide.subtitle}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <button
            disabled={activeCardIdx === 0}
            onClick={() => setActiveCardIdx((i) => Math.max(0, i - 1))}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {doc.cards.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setActiveCardIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeCardIdx ? 'w-8 bg-indigo-400' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
          <button
            disabled={activeCardIdx >= doc.cards.length - 1}
            onClick={() =>
              setActiveCardIdx((i) => Math.min(doc.cards.length - 1, i + 1))
            }
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const editingChartCard = doc.cards.find((c) => c.id === editingChartCardId) || doc.cards[2];

  return (
    <div
      data-testid="gamma-editor-shell"
      className="h-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden select-none"
    >
      {/* 1. Unified Top Toolbar (48px) */}
      <header
        data-testid="editor-unified-toolbar"
        className="h-12 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0 z-30"
      >
        <div className="flex items-center gap-2">
          <Link
            href="/"
            data-testid="editor-home-btn"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {!readOnly && (
            <button
              data-testid="editor-agent-toggle-btn"
              onClick={() => setAgentOpen((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                agentOpen
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Agent
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <input
            data-testid="editor-doc-title-input"
            type="text"
            readOnly={readOnly}
            value={doc.title}
            onChange={(e) => setDoc({ ...doc, title: e.target.value })}
            onBlur={(e) => mutateDoc({ title: e.target.value })}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 outline-none max-w-[200px] sm:max-w-xs truncate"
          />
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              data-testid="editor-theme-btn"
              onClick={() =>
                setRightDrawer(rightDrawer === 'theme' ? null : 'theme')
              }
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Theme: {currentTheme.name}</span>
            </button>
          )}

          <button
            data-testid="editor-share-btn"
            onClick={() =>
              setRightDrawer(rightDrawer === 'share' ? null : 'share')
            }
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            data-testid="editor-present-btn"
            onClick={() => setPresentMode(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            Present
          </button>

          <div
            title="Active Collaborator: wlfjck@gmail.com"
            className="hidden sm:flex w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold items-center justify-center ring-2 ring-emerald-400"
          >
            W
          </div>

          {/* Overflow Document Menu (...) */}
          <div className="relative">
            <button
              data-testid="editor-overflow-menu-btn"
              onClick={() => setDocMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {docMenuOpen && (
              <div
                data-testid="editor-overflow-dropdown"
                className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs"
              >
                <button
                  data-testid="doc-menu-version-history"
                  onClick={() => {
                    setRightDrawer('history');
                    setDocMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <History className="w-4 h-4 text-indigo-600" />
                  Version history &amp; snapshots
                </button>
                <button
                  data-testid="doc-menu-page-setup"
                  onClick={() => {
                    setRightDrawer('page-setup');
                    setDocMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <Settings2 className="w-4 h-4 text-indigo-600" />
                  Page setup &amp; card size
                </button>
                <button
                  data-testid="doc-menu-analytics"
                  onClick={() => {
                    setRightDrawer('analytics');
                    setDocMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Document analytics ({doc.viewCount} views)
                </button>
                <button
                  data-testid="doc-menu-custom-code"
                  onClick={() => {
                    setRightDrawer('custom-code');
                    setDocMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  Custom head/body code
                </button>
                <Link
                  href={`/docs/presenter/${doc.id}`}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                >
                  <Monitor className="w-4 h-4 text-indigo-600" />
                  Presenter Speaker View
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Fixed Secondary Formatting Bar (40px) */}
      {!readOnly && (
        <div
          data-testid="editor-formatting-bar"
          className="h-10 bg-slate-50 border-b border-slate-200 px-3 flex items-center justify-between text-xs shrink-0 z-20"
        >
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 mr-2">
              <button
                onClick={() => setAgentOpen(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                  !agentOpen ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Manual Edit
              </button>
              <button
                onClick={() => setAgentOpen(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                  agentOpen ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Agent
              </button>
            </div>

            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Undo">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Redo">
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            <button
              data-testid="toolbar-insert-block-btn"
              onClick={() =>
                setRightDrawer(rightDrawer === 'insert-media' ? null : 'insert-media')
              }
              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Insert Block / Media
            </button>

            {/* Font Family Picker */}
            <div className="relative">
              <button
                data-testid="toolbar-font-picker-btn"
                onClick={() => setFontPickerOpen((prev) => !prev)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-200 font-medium flex items-center gap-1"
              >
                <Type className="w-3.5 h-3.5" />
                <span>{currentTheme.headingFont}</span>
              </button>
              {fontPickerOpen && (
                <div
                  data-testid="toolbar-font-picker-popover"
                  className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40"
                >
                  {[
                    'Genesis Sans Display',
                    'Inter',
                    'Plus Jakarta Sans',
                    'Space Grotesk',
                    'JetBrains Mono',
                  ].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFontPickerOpen(false)}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Text & Highlight Color Swatch Picker */}
            <div className="relative">
              <button
                data-testid="toolbar-color-picker-btn"
                onClick={() => setColorPickerOpen((prev) => !prev)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-200 font-medium flex items-center gap-1.5"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeTextColor }}
                />
                <span>Color</span>
              </button>
              {colorPickerOpen && (
                <div
                  data-testid="toolbar-color-picker-popover"
                  className="absolute left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-40 space-y-2"
                >
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Theme Text &amp; Highlight Swatches
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      '#6366f1',
                      '#38bdf8',
                      '#10b981',
                      '#f59e0b',
                      '#f43f5e',
                      '#a855f7',
                      '#0f172a',
                      '#475569',
                      '#ffffff',
                      '#ec4899',
                      '#14b8a6',
                      '#eab308',
                    ].map((sw) => (
                      <button
                        key={sw}
                        onClick={() => {
                          setActiveTextColor(sw);
                          setColorPickerOpen(false);
                        }}
                        style={{ backgroundColor: sw }}
                        className="w-6 h-6 rounded-md border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-700">
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-700">
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-700">
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-700">
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-700">
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              data-testid="toolbar-comments-drawer-btn"
              onClick={() =>
                setRightDrawer(rightDrawer === 'comments' ? null : 'comments')
              }
              className="px-2.5 py-1 rounded-lg hover:bg-slate-200 text-slate-600 font-medium flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Comments ({doc.comments.length})
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Body: Filmstrip + Docked Agent + Fluid Card Stream + Right Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Card Filmstrip (190px) */}
        <aside
          data-testid="editor-card-filmstrip"
          className="hidden md:flex w-52 bg-white border-r border-slate-200 flex-col justify-between p-3 overflow-y-auto shrink-0"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cards ({doc.cards.length})
              </span>
              {!readOnly && (
                <button
                  data-testid="filmstrip-add-card-btn"
                  onClick={() =>
                    mutateDoc({
                      action: 'add_card',
                      title: `New Strategic Card ${doc.cards.length + 1}`,
                      layoutType: 'SMART_BOXES',
                    })
                  }
                  className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  title="Add Card"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {doc.cards.map((card, idx) => (
              <div key={card.id} className="relative group">
                <div
                  data-testid={`filmstrip-card-thumb-${idx}`}
                  onClick={() => {
                    setActiveCardIdx(idx);
                    const el = document.getElementById(`card-canvas-${card.id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                    activeCardIdx === idx
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {!readOnly && (
                      <button
                        data-testid={`filmstrip-context-btn-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilmstripMenuCardId(
                            filmstripMenuCardId === card.id ? null : card.id
                          );
                        }}
                        className="p-0.5 rounded hover:bg-slate-200 text-slate-500"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-2">
                    {card.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {card.layoutType}
                  </div>
                </div>

                {/* Filmstrip Card Context Menu */}
                {filmstripMenuCardId === card.id && (
                  <div
                    data-testid={`filmstrip-context-menu-${idx}`}
                    className="absolute left-4 top-10 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 text-xs"
                  >
                    <button
                      onClick={() => {
                        mutateDoc({ action: 'duplicate_card', cardId: card.id });
                        setFilmstripMenuCardId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      Duplicate card
                    </button>
                    <button
                      onClick={() => {
                        setAgentOpen(true);
                        setFilmstripMenuCardId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2 text-indigo-600 font-semibold"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Beautify with AI
                    </button>
                    {doc.cards.length > 1 && (
                      <button
                        onClick={() => {
                          mutateDoc({ action: 'delete_card', cardId: card.id });
                          setFilmstripMenuCardId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete card
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!readOnly && (
            <button
              onClick={() =>
                mutateDoc({
                  action: 'add_card',
                  title: `Card ${doc.cards.length + 1}: Strategic Summary`,
                })
              }
              className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-indigo-500 text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Card
            </button>
          )}
        </aside>

        {/* Left-Docked Gamma 5 AI Agent Split-Pane (360px) */}
        {agentOpen && (
          <aside
            data-testid="editor-agent-panel"
            className="w-80 sm:w-96 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-20 shadow-lg"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Gamma 5 AI Agent
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Editing Card {activeCardIdx + 1} • Live Sync
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAgentOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Express / Standard / Research Mode Selector */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Agent Mode
              </span>
              <div className="flex items-center gap-1">
                {(['EXPRESS', 'STANDARD', 'RESEARCH'] as const).map((m) => (
                  <button
                    key={m}
                    data-testid={`editor-agent-mode-${m.toLowerCase()}`}
                    onClick={() => setAgentMode(m)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      agentMode === m
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {agentMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-6'
                      : 'bg-slate-100 text-slate-800 mr-4'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {/* Quick AI Card Transformation Chips */}
              <div className="pt-2 space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Quick Card Actions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Convert to 3-column Smart Layout',
                    'Rewrite more concisely for executives',
                    'Add quantifiable ROI telemetry',
                    'Translate card to Spanish & Japanese',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setAgentInput(suggestion)}
                      className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-medium"
                    >
                      ✨ {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Composer */}
            <div className="p-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  data-testid="editor-agent-input"
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAgent()}
                  placeholder="Ask Agent to edit this card or add a chart..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
                />
                <button
                  data-testid="editor-agent-send-btn"
                  onClick={handleSendAgent}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" /> @ Mention card or attach file
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Web citations enabled
                </span>
              </div>
            </div>
          </aside>
        )}

        {/* Center Fluid Card Canvas Stream */}
        <main
          data-testid="editor-card-canvas-stream"
          style={{ backgroundColor: currentTheme.bgColor }}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 transition-colors"
        >
          <div className="max-w-4xl mx-auto space-y-8 pb-24">
            {doc.cards.map((card, idx) => {
              const rawSmart = card.smartLayoutConfigJson || card.smartLayoutJson;
              let smartLayout: any = {
                variant: 'boxes',
                columns: 3,
                cellStyle: 'bordered',
                marker: 'numbered',
                spacing: 'medium',
                items: [
                  {
                    step: '01',
                    title: 'Autonomous Agents',
                    metric: '+42% Velocity',
                    body: 'Multi-card synthesis with live grounding.',
                  },
                  {
                    step: '02',
                    title: 'Enterprise SAML',
                    metric: '100% Audited',
                    body: 'Invite-only RBAC and single-use invitation tokens.',
                  },
                  {
                    step: '03',
                    title: 'Fluid Card Layouts',
                    metric: 'Zero Pixel-Push',
                    body: 'Responsive CSS Grid & Flexbox containers.',
                  },
                ],
              };
              if (rawSmart) {
                try {
                  smartLayout = { ...smartLayout, ...JSON.parse(rawSmart) };
                } catch {
                  // fallback
                }
              }

              let parsedBlocks: any[] = [];
              if (card.blocksJson) {
                try {
                  parsedBlocks = JSON.parse(card.blocksJson);
                  const smartBlock = parsedBlocks.find(
                    (b: any) =>
                      b.type === 'smart_boxes' ||
                      b.type === 'timeline' ||
                      b.type === 'stats'
                  );
                  if (smartBlock && Array.isArray(smartBlock.items) && smartBlock.items.length > 0) {
                    smartLayout.items = smartBlock.items.map((it: any, i: number) => ({
                      step: it.step || `0${i + 1}`,
                      title: it.title || it.label || `Item ${i + 1}`,
                      metric: it.value || it.metric || it.step || '',
                      body: it.text || it.body || it.delta || '',
                    }));
                  }
                } catch {
                  parsedBlocks = [];
                }
              }

              const rawChart = card.chartConfigJson || card.chartDataJson;
              let chartData: any = {
                chartType: 'area',
                title: 'Quarterly Velocity vs Target',
                rows: [
                  { label: 'Q1 2026', value: 42, target: 35 },
                  { label: 'Q2 2026', value: 68, target: 55 },
                  { label: 'Q3 2026', value: 94, target: 80 },
                  { label: 'Q4 2026', value: 128, target: 105 },
                ],
              };
              if (rawChart) {
                try {
                  const parsedChart = JSON.parse(rawChart);
                  chartData = {
                    ...chartData,
                    ...parsedChart,
                    chartType: parsedChart.chartType || parsedChart.type || 'area',
                  };
                } catch {
                  // fallback
                }
              }

              const cardBg =
                card.backgroundColor || card.bgColor || currentTheme.cardBgColor;
              const cardImg = card.accentImageUrl || card.bgImage;
              const accentPosUpper = (card.accentPosition || 'none').toUpperCase();

              return (
                <section
                  key={card.id}
                  id={`card-canvas-${card.id}`}
                  data-testid={`editor-card-${idx}`}
                  onClick={() => setActiveCardIdx(idx)}
                  style={{
                    backgroundColor: cardBg,
                    color: currentTheme.textColor,
                    fontFamily: currentTheme.bodyFont,
                  }}
                  className={`relative rounded-3xl border transition-all shadow-xl overflow-visible ${
                    activeCardIdx === idx
                      ? 'border-indigo-400 ring-2 ring-indigo-500/40'
                      : 'border-white/10'
                  }`}
                >
                  {/* Floating Card Action Pill Bar (Top-Left of Card) */}
                  {!readOnly && (
                    <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-4 pb-2 border-b border-white/10 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold uppercase tracking-wider">
                          Card {idx + 1}
                        </span>

                        {/* Card Styling Popover Button */}
                        <div className="relative">
                          <button
                            data-testid={`card-styling-btn-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setStylingPopoverCardId(
                                stylingPopoverCardId === card.id ? null : card.id
                              );
                              setSmartLayoutPopoverCardId(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Sliders className="w-3 h-3 text-cyan-300" />
                            Card Styling
                          </button>

                          {stylingPopoverCardId === card.id && (
                            <div
                              data-testid={`card-styling-popover-${idx}`}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 mt-2 w-72 bg-slate-900 text-white border border-white/20 rounded-2xl shadow-2xl p-4 z-40 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">
                                  Card Styling &amp; Accent Image
                                </span>
                                <button
                                  onClick={() => setStylingPopoverCardId(null)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                                  Accent Image Position
                                </div>
                                <div className="grid grid-cols-5 gap-1">
                                  {(['NONE', 'LEFT', 'RIGHT', 'TOP', 'BACKGROUND'] as const).map(
                                    (pos) => (
                                      <button
                                        key={pos}
                                        onClick={() =>
                                          mutateDoc({
                                            action: 'update_card',
                                            cardId: card.id,
                                            accentPosition: pos.toLowerCase(),
                                            accentImageUrl:
                                              cardImg ||
                                              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                                          })
                                        }
                                        className={`py-1.5 rounded-lg text-[10px] font-bold ${
                                          accentPosUpper === pos
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/10 text-slate-300'
                                        }`}
                                      >
                                        {pos.slice(0, 4)}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                                  Card Background Override
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {[
                                    null,
                                    '#0f172a',
                                    '#1e1b4b',
                                    '#064e3b',
                                    '#3b0764',
                                    '#18181b',
                                  ].map((bgSw, swIdx) => (
                                    <button
                                      key={swIdx}
                                      onClick={() =>
                                        mutateDoc({
                                          action: 'update_card',
                                          cardId: card.id,
                                          backgroundColor: bgSw,
                                        })
                                      }
                                      style={{
                                        backgroundColor: bgSw || currentTheme.cardBgColor,
                                      }}
                                      className="w-6 h-6 rounded-lg border border-white/25 text-[9px] font-bold"
                                      title={bgSw || 'Theme Default'}
                                    >
                                      {bgSw === null ? 'A' : ''}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span>Full-bleed card</span>
                                <input
                                  type="checkbox"
                                  checked={card.fullBleed}
                                  onChange={(e) =>
                                    mutateDoc({
                                      action: 'update_card',
                                      cardId: card.id,
                                      fullBleed: e.target.checked,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Smart Layout Settings Popover Button */}
                        <div className="relative">
                          <button
                            data-testid={`card-smart-layout-btn-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSmartLayoutPopoverCardId(
                                smartLayoutPopoverCardId === card.id ? null : card.id
                              );
                              setStylingPopoverCardId(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <LayoutGrid className="w-3 h-3 text-indigo-300" />
                            Smart Layout
                          </button>

                          {smartLayoutPopoverCardId === card.id && (
                            <div
                              data-testid={`card-smart-layout-popover-${idx}`}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 mt-2 w-80 bg-slate-900 text-white border border-white/20 rounded-2xl shadow-2xl p-4 z-40 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">
                                  Smart Layout Configuration
                                </span>
                                <button
                                  onClick={() => setSmartLayoutPopoverCardId(null)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                                  Layout Structure
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  {(['boxes', 'timeline', 'process', 'pyramid'] as const).map(
                                    (v) => (
                                      <button
                                        key={v}
                                        onClick={() =>
                                          mutateDoc({
                                            action: 'update_card',
                                            cardId: card.id,
                                            layoutType:
                                              v === 'timeline'
                                                ? 'TIMELINE'
                                                : 'SMART_BOXES',
                                            smartLayoutConfigJson: JSON.stringify({
                                              ...smartLayout,
                                              variant: v,
                                            }),
                                          })
                                        }
                                        className={`py-1.5 rounded-lg text-[10px] font-bold capitalize ${
                                          smartLayout.variant === v
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/10 text-slate-300'
                                        }`}
                                      >
                                        {v}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                                  Columns (2–5)
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  {[2, 3, 4, 5].map((col) => (
                                    <button
                                      key={col}
                                      onClick={() =>
                                        mutateDoc({
                                          action: 'update_card',
                                          cardId: card.id,
                                          smartLayoutConfigJson: JSON.stringify({
                                            ...smartLayout,
                                            columns: col,
                                          }),
                                        })
                                      }
                                      className={`py-1 rounded-lg text-xs font-bold ${
                                        smartLayout.columns === col
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-white/10 text-slate-300'
                                      }`}
                                    >
                                      {col} Cols
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                                  Cell Style
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                  {(['bordered', 'tinted', 'minimal'] as const).map((cs) => (
                                    <button
                                      key={cs}
                                      onClick={() =>
                                        mutateDoc({
                                          action: 'update_card',
                                          cardId: card.id,
                                          smartLayoutConfigJson: JSON.stringify({
                                            ...smartLayout,
                                            cellStyle: cs,
                                          }),
                                        })
                                      }
                                      className={`py-1 rounded-lg text-[10px] font-bold capitalize ${
                                        smartLayout.cellStyle === cs
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-white/10 text-slate-300'
                                      }`}
                                    >
                                      {cs}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Slash Command Menu Trigger */}
                        <div className="relative">
                          <button
                            data-testid={`card-slash-menu-btn-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSlashMenuCardId(
                                slashMenuCardId === card.id ? null : card.id
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold"
                          >
                            / Slash Menu
                          </button>

                          {slashMenuCardId === card.id && (
                            <div
                              data-testid={`card-slash-menu-popover-${idx}`}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 mt-2 w-64 bg-slate-900 text-white border border-white/20 rounded-2xl shadow-2xl p-2 z-40 text-xs space-y-1"
                            >
                              <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-indigo-300">
                                Insert Block (/ Command)
                              </div>
                              {[
                                { label: 'Smart Layout (Columns / Boxes)', type: 'SMART_BOXES' },
                                { label: 'Interactive Area / Bar Chart', type: 'CHART_SPLIT' },
                                { label: 'Milestone Timeline', type: 'TIMELINE' },
                                { label: 'KPI Metrics Grid', type: 'STATS_GRID' },
                              ].map((cmd) => (
                                <button
                                  key={cmd.type}
                                  onClick={() => {
                                    mutateDoc({
                                      action: 'update_card',
                                      cardId: card.id,
                                      layoutType: cmd.type,
                                    });
                                    setSlashMenuCardId(null);
                                  }}
                                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-left font-medium"
                                >
                                  {cmd.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setAgentOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Edit with AI
                      </button>
                    </div>
                  )}

                  {/* Card Body with Accent Image Position Support */}
                  <div
                    className={`p-6 sm:p-10 grid gap-6 items-center ${
                      (accentPosUpper === 'RIGHT' || accentPosUpper === 'LEFT') && cardImg
                        ? 'grid-cols-1 lg:grid-cols-12'
                        : 'grid-cols-1'
                    }`}
                  >
                    {accentPosUpper === 'LEFT' && cardImg && (
                      <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-white/10">
                        <img
                          src={cardImg}
                          alt={card.title}
                          className="w-full h-56 object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={
                        (accentPosUpper === 'RIGHT' || accentPosUpper === 'LEFT') && cardImg
                          ? 'lg:col-span-7 space-y-5'
                          : 'space-y-5'
                      }
                    >
                      <input
                        data-testid={`card-title-input-${idx}`}
                        type="text"
                        readOnly={readOnly}
                        value={card.title}
                        onChange={(e) => {
                          const updated = doc.cards.map((c) =>
                            c.id === card.id ? { ...c, title: e.target.value } : c
                          );
                          setDoc({ ...doc, cards: updated });
                        }}
                        onBlur={(e) =>
                          mutateDoc({
                            action: 'update_card',
                            cardId: card.id,
                            title: e.target.value,
                          })
                        }
                        style={{ fontFamily: currentTheme.headingFont }}
                        className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold tracking-tight outline-none"
                      />

                      <input
                        type="text"
                        readOnly={readOnly}
                        value={card.subtitle || ''}
                        placeholder={readOnly ? '' : 'Add card subtitle...'}
                        onChange={(e) => {
                          const updated = doc.cards.map((c) =>
                            c.id === card.id ? { ...c, subtitle: e.target.value } : c
                          );
                          setDoc({ ...doc, cards: updated });
                        }}
                        onBlur={(e) =>
                          mutateDoc({
                            action: 'update_card',
                            cardId: card.id,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-sm sm:text-base opacity-80 leading-relaxed outline-none"
                      />

                      {/* Render Callout & Badges from blocksJson */}
                      {parsedBlocks.map((blk: any, bIdx: number) => (
                        <React.Fragment key={blk.id || bIdx}>
                          {blk.type === 'callout' && (
                            <div
                              style={{ borderColor: `${currentTheme.primaryColor}55` }}
                              className="p-4 rounded-2xl bg-white/5 border space-y-1"
                            >
                              <div
                                style={{ color: currentTheme.accentColor }}
                                className="text-xs font-bold uppercase tracking-wider"
                              >
                                ✨ {blk.title || 'Executive Takeaway'}
                              </div>
                              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                                {blk.text}
                              </p>
                            </div>
                          )}
                          {blk.type === 'badges' && Array.isArray(blk.items) && (
                            <div className="flex flex-wrap gap-2">
                              {blk.items.map((badge: string, bi: number) => (
                                <span
                                  key={bi}
                                  className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}
                        </React.Fragment>
                      ))}

                      {/* Render Smart Layout Boxes / Columns */}
                      {(card.layoutType === 'SMART_BOXES' ||
                        card.layoutType === 'CHART_SPLIT' ||
                        card.layoutType === 'STATS_GRID' ||
                        card.layoutType === 'METRICS') && (
                        <div
                          className={`grid gap-4 pt-2 ${
                            smartLayout.columns === 2
                              ? 'grid-cols-1 sm:grid-cols-2'
                              : smartLayout.columns === 4
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                                : smartLayout.columns === 5
                                  ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5'
                                  : 'grid-cols-1 sm:grid-cols-3'
                          }`}
                        >
                          {smartLayout.items.map((item: any, itemIdx: number) => (
                            <div
                              key={itemIdx}
                              className={`p-4 rounded-2xl space-y-1.5 ${
                                smartLayout.cellStyle === 'tinted'
                                  ? 'bg-indigo-500/15 border border-indigo-400/20'
                                  : smartLayout.cellStyle === 'minimal'
                                    ? 'bg-transparent border-l-2 border-indigo-400 pl-4 rounded-none'
                                    : 'bg-white/5 border border-white/15'
                              }`}
                            >
                              {item.metric && (
                                <div
                                  style={{ color: currentTheme.accentColor }}
                                  className="text-lg font-black"
                                >
                                  {item.metric}
                                </div>
                              )}
                              <div className="text-sm font-bold">{item.title}</div>
                              <p className="text-xs opacity-75 leading-relaxed">
                                {item.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render Interactive Chart + Edit Chart Data Button */}
                      {(card.layoutType === 'CHART' ||
                        card.layoutType === 'CHART_SPLIT') && (
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold uppercase text-indigo-300">
                                Interactive Telemetry ({chartData.chartType || 'area'} chart)
                              </div>
                              <div className="text-sm font-bold">{chartData.title}</div>
                            </div>
                            {!readOnly && (
                              <button
                                data-testid={`edit-chart-data-btn-${idx}`}
                                onClick={() => {
                                  setEditingChartCardId(card.id);
                                  setRightDrawer('chart-editor');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                                Edit Chart Data
                              </button>
                            )}
                          </div>

                          {/* Dynamic Bar / Area / Line / Donut Visualization */}
                          <div className="grid grid-cols-4 gap-4 items-end h-44 pt-6 px-4 bg-slate-950/40 rounded-xl">
                            {chartData.rows.map((row: any, rIdx: number) => {
                              const actualVal = Number(row.value ?? row.actual ?? 50);
                              const targetVal = Number(row.target ?? 40);
                              const maxScale = 140;
                              return (
                                <div
                                  key={rIdx}
                                  className="flex flex-col items-center gap-2 h-full justify-end"
                                >
                                  <div className="text-[10px] font-bold text-cyan-300">
                                    {actualVal}
                                  </div>
                                  <div className="w-full flex items-end justify-center gap-1.5 h-28">
                                    <div
                                      style={{
                                        height: `${Math.min(100, Math.round((actualVal / maxScale) * 100))}%`,
                                        backgroundColor: currentTheme.primaryColor,
                                      }}
                                      className="w-7 rounded-t-lg transition-all shadow-md"
                                      title={`Value: ${actualVal}`}
                                    />
                                    <div
                                      style={{
                                        height: `${Math.min(100, Math.round((targetVal / maxScale) * 100))}%`,
                                      }}
                                      className="w-4 rounded-t-lg bg-white/25 transition-all"
                                      title={`Target: ${targetVal}`}
                                    />
                                  </div>
                                  <div className="text-[11px] font-bold truncate max-w-full">
                                    {row.label}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Render Timeline Layout */}
                      {card.layoutType === 'TIMELINE' && (
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                          {smartLayout.items.map((step: any, sIdx: number) => (
                            <div
                              key={sIdx}
                              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1"
                            >
                              <span
                                style={{ color: currentTheme.accentColor }}
                                className="text-[10px] font-bold uppercase"
                              >
                                {step.step || `Q${sIdx + 1}`}
                              </span>
                              <div className="text-xs font-bold">{step.title}</div>
                              <p className="text-[11px] opacity-75">{step.body}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {accentPosUpper === 'RIGHT' && cardImg && (
                      <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-white/10">
                        <img
                          src={cardImg}
                          alt={card.title}
                          className="w-full h-56 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Footer Bar: Speaker Notes & Card Comments */}
                  <div className="px-6 py-2.5 border-t border-white/10 flex items-center justify-between text-xs opacity-75">
                    <button
                      data-testid={`card-notes-toggle-${idx}`}
                      onClick={() =>
                        setNotesOpenCardId(notesOpenCardId === card.id ? null : card.id)
                      }
                      className="hover:opacity-100 flex items-center gap-1.5 font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Speaker Notes
                    </button>
                    <div className="flex items-center gap-3">
                      {pageSetup.showPageNumbers && (
                        <span className="text-[10px] font-mono opacity-60">
                          {idx + 1} / {doc.cards.length}
                        </span>
                      )}
                      <button
                        onClick={() => setRightDrawer('comments')}
                        className="hover:opacity-100 flex items-center gap-1 font-medium"
                      >
                        💬 Add Reaction / Comment
                      </button>
                    </div>
                  </div>

                  {notesOpenCardId === card.id && (
                    <div className="px-6 pb-4">
                      <textarea
                        data-testid={`card-notes-textarea-${idx}`}
                        rows={2}
                        defaultValue={
                          card.speakerNotes ||
                          'Key talking point: emphasize sub-second card latency and enterprise RBAC.'
                        }
                        onBlur={(e) =>
                          mutateDoc({
                            action: 'update_card',
                            cardId: card.id,
                            speakerNotes: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl bg-black/30 border border-white/15 text-xs text-white outline-none"
                      />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </main>

        {/* Right Contextual Drawer (Theme, Share, History, Page Setup, Analytics, Custom Code, Media, Comments, Chart Editor) */}
        {rightDrawer && (
          <aside
            data-testid={`editor-right-drawer-${rightDrawer}`}
            className="w-80 sm:w-96 bg-white border-l border-slate-200 p-5 overflow-y-auto shrink-0 z-30 shadow-xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {rightDrawer.replace('-', ' ')}
              </h3>
              <button
                data-testid="close-right-drawer-btn"
                onClick={() => setRightDrawer(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* THEME DRAWER */}
            {rightDrawer === 'theme' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Switch live document theme tokens across all cards immediately.
                </p>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    data-testid={`theme-option-${t.id}`}
                    onClick={() => mutateDoc({ themeId: t.id })}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                      currentTheme.id === t.id
                        ? 'border-indigo-600 bg-indigo-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        style={{ backgroundColor: t.backgroundColor || t.bgColor }}
                        className="w-8 h-8 rounded-xl border border-slate-300 flex items-center justify-center"
                      >
                        <span
                          style={{ backgroundColor: t.primaryColor }}
                          className="w-3.5 h-3.5 rounded-full"
                        />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{t.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {t.headingFont} • {t.category || 'STANDARD'}
                        </div>
                      </div>
                    </div>
                    {currentTheme.id === t.id && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* SHARE & EXPORT DRAWER */}
            {rightDrawer === 'share' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900">Workspace &amp; Public Access</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Workspace Members</span>
                    <select
                      data-testid="share-workspace-access-select"
                      value={doc.workspaceAccess || 'edit'}
                      onChange={(e) => mutateDoc({ workspaceAccess: e.target.value })}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold"
                    >
                      <option value="manage">Full Access</option>
                      <option value="edit">Can Edit</option>
                      <option value="comment">Can Comment</option>
                      <option value="view">Can View</option>
                      <option value="none">No Access</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Public Link Access</span>
                    <select
                      data-testid="share-public-access-select"
                      value={doc.publicAccess || 'view'}
                      onChange={(e) => mutateDoc({ publicAccess: e.target.value })}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold"
                    >
                      <option value="view">Anyone with link can view</option>
                      <option value="comment">Anyone with link can comment</option>
                      <option value="none">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Public Share Link</div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={`https://gamma.app/public/${doc.id}`}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px]"
                    />
                    <button
                      data-testid="copy-public-link-btn"
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `${window.location.origin}/public/${doc.id}`
                        );
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold"
                    >
                      {copiedLink ? 'Copied!' : 'Copy'}
                    </button>
                    <Link
                      href={`/public/${doc.id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold"
                    >
                      Open
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900">Export Artifact</div>
                  {[
                    { label: 'Export / Print to PDF (Vector)', kind: 'pdf' as const },
                    { label: 'Export Standalone HTML Presentation (.html)', kind: 'html' as const },
                    { label: 'Export Deck Outline & Notes (.md)', kind: 'md' as const },
                    { label: 'Export Portable Gamma Schema (.gamma.json)', kind: 'json' as const },
                  ].map((exp) => (
                    <button
                      key={exp.kind}
                      data-testid={`export-btn-${exp.kind}`}
                      onClick={() => handleExportDeck(exp.kind)}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-left font-semibold text-slate-700 transition"
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VERSION HISTORY & SNAPSHOTS DRAWER */}
            {rightDrawer === 'history' && (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2">
                  <input
                    data-testid="snapshot-label-input"
                    type="text"
                    value={snapshotLabel}
                    onChange={(e) => setSnapshotLabel(e.target.value)}
                    placeholder="Checkpoint label (e.g. Board Ready)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <button
                    data-testid="create-snapshot-btn"
                    onClick={() => {
                      mutateDoc({
                        action: 'create_snapshot',
                        label: snapshotLabel || 'Manual Checkpoint',
                      });
                      setSnapshotLabel('');
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                  >
                    Save
                  </button>
                </div>

                <div className="space-y-2">
                  {doc.snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3 rounded-xl border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>
                          v{snap.versionNumber} — {snap.label}
                        </span>
                        <span className="text-[10px] text-emerald-600">Saved</span>
                      </div>
                      {snap.summary && (
                        <div className="text-[11px] text-slate-600">{snap.summary}</div>
                      )}
                      <div className="text-[10px] text-slate-400">
                        By {snap.authorName || snap.authorEmail || 'Jack Wolf'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHART SPREADSHEET DATA EDITOR DRAWER */}
            {rightDrawer === 'chart-editor' && editingChartCard && (() => {
              let editChartObj: any = {
                chartType: 'area',
                title: 'Quarterly Execution Velocity',
                rows: [
                  { label: 'Q1 2026', value: 42, target: 40 },
                  { label: 'Q2 2026', value: 68, target: 60 },
                  { label: 'Q3 2026', value: 94, target: 85 },
                  { label: 'Q4 2026', value: 128, target: 110 },
                ],
              };
              try {
                const raw =
                  editingChartCard.chartConfigJson || editingChartCard.chartDataJson;
                if (raw) editChartObj = { ...editChartObj, ...JSON.parse(raw) };
              } catch {
                // fallback
              }

              return (
                <div
                  data-testid="chart-spreadsheet-editor"
                  className="space-y-4 text-xs"
                >
                  <p className="text-slate-500">
                    Edit live series data for <strong>{editingChartCard.title}</strong>.
                  </p>

                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                      Chart Visualization Type
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {(['area', 'bar', 'line', 'donut'] as const).map((ct) => (
                        <button
                          key={ct}
                          data-testid={`chart-type-${ct}`}
                          onClick={() =>
                            mutateDoc({
                              action: 'update_card',
                              cardId: editingChartCard.id,
                              chartConfig: { ...editChartObj, chartType: ct },
                            })
                          }
                          className={`py-1.5 rounded-lg text-[10px] font-bold uppercase ${
                            (editChartObj.chartType || 'area') === ct
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>

                  <table className="w-full border border-slate-200 rounded-xl overflow-hidden text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                      <tr>
                        <th className="p-2">Label</th>
                        <th className="p-2">Actual</th>
                        <th className="p-2">Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {editChartObj.rows.map((r: any, i: number) => (
                        <tr key={i}>
                          <td className="p-1.5">
                            <input
                              type="text"
                              defaultValue={r.label}
                              onBlur={(e) => {
                                const nextRows = [...editChartObj.rows];
                                nextRows[i] = { ...nextRows[i], label: e.target.value };
                                mutateDoc({
                                  action: 'update_card',
                                  cardId: editingChartCard.id,
                                  chartConfig: { ...editChartObj, rows: nextRows },
                                });
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-200 font-bold text-xs"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              data-testid={`chart-row-value-${i}`}
                              type="number"
                              defaultValue={r.value ?? r.actual ?? 50}
                              onBlur={(e) => {
                                const nextRows = [...editChartObj.rows];
                                nextRows[i] = {
                                  ...nextRows[i],
                                  value: Number(e.target.value),
                                };
                                mutateDoc({
                                  action: 'update_card',
                                  cardId: editingChartCard.id,
                                  chartConfig: { ...editChartObj, rows: nextRows },
                                });
                              }}
                              className="w-16 px-2 py-1 rounded border border-slate-200 text-xs"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              defaultValue={r.target ?? 40}
                              onBlur={(e) => {
                                const nextRows = [...editChartObj.rows];
                                nextRows[i] = {
                                  ...nextRows[i],
                                  target: Number(e.target.value),
                                };
                                mutateDoc({
                                  action: 'update_card',
                                  cardId: editingChartCard.id,
                                  chartConfig: { ...editChartObj, rows: nextRows },
                                });
                              }}
                              className="w-16 px-2 py-1 rounded border border-slate-200 text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    data-testid="chart-add-row-btn"
                    onClick={() => {
                      const nextRows = [
                        ...editChartObj.rows,
                        {
                          label: `Q${editChartObj.rows.length + 1}`,
                          value: 110,
                          target: 95,
                        },
                      ];
                      mutateDoc({
                        action: 'update_card',
                        cardId: editingChartCard.id,
                        chartConfig: { ...editChartObj, rows: nextRows },
                      });
                    }}
                    className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-indigo-500 text-indigo-600 font-bold"
                  >
                    + Add Data Row
                  </button>
                </div>
              );
            })()}

            {/* PAGE SETUP DRAWER */}
            {rightDrawer === 'page-setup' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="font-bold text-slate-800">Card Aspect Ratio</div>
                  {['16:9 Widescreen', '4:3 Traditional', 'Fluid Tall Card'].map((r) => (
                    <button
                      key={r}
                      onClick={() =>
                        mutateDoc({
                          pageSetup: { ...pageSetup, aspectRatio: r },
                        })
                      }
                      className={`w-full p-3 rounded-xl border text-left font-semibold flex items-center justify-between ${
                        pageSetup.aspectRatio === r
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{r}</span>
                      {pageSetup.aspectRatio === r && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
                  <span>Show card page numbers</span>
                  <input
                    type="checkbox"
                    checked={Boolean(pageSetup.showPageNumbers)}
                    onChange={(e) =>
                      mutateDoc({
                        pageSetup: {
                          ...pageSetup,
                          showPageNumbers: e.target.checked,
                        },
                      })
                    }
                  />
                </label>
              </div>
            )}

            {/* DOC ANALYTICS DRAWER */}
            {rightDrawer === 'analytics' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-indigo-50">
                    <div className="text-[10px] font-bold uppercase text-indigo-600">
                      Unique Views
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {doc.viewCount}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50">
                    <div className="text-[10px] font-bold uppercase text-emerald-600">
                      Completion Rate
                    </div>
                    <div className="text-2xl font-black text-slate-900">91.4%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-700">
                    Card-by-Card Engagement Dwell Time
                  </div>
                  {doc.cards.map((c, i) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50"
                    >
                      <span className="truncate max-w-[180px] font-medium">
                        {i + 1}. {c.title}
                      </span>
                      <span className="font-bold text-indigo-600">
                        {Math.max(12, 42 - i * 5)}s avg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOM CODE DRAWER */}
            {rightDrawer === 'custom-code' && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-slate-700">
                  Custom &lt;head&gt; Analytics / CSS Snippet
                </div>
                <textarea
                  rows={5}
                  value={customHeadCode}
                  onChange={(e) => setCustomHeadCode(e.target.value)}
                  placeholder="<!-- Custom scripts or styles -->"
                  className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs"
                />
                <button
                  data-testid="save-custom-code-btn"
                  onClick={() =>
                    mutateDoc({
                      customCode: { headHtml: customHeadCode },
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Custom Code
                </button>
              </div>
            )}

            {/* INSERT MEDIA & AI IMAGES DRAWER */}
            {rightDrawer === 'insert-media' && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-slate-700">
                  Insert Media, AI Image, or Embed Block
                </div>
                {[
                  { label: 'Generate AI Image (Flux Fast 1.1)', icon: ImageIcon, layout: 'HERO' },
                  { label: 'Smart Layout Grid (2–5 Columns)', icon: LayoutGrid, layout: 'SMART_BOXES' },
                  { label: 'Interactive Area / Bar / Donut Chart', icon: BarChart3, layout: 'CHART_SPLIT' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        mutateDoc({
                          action: 'add_card',
                          title: item.label,
                          layoutType: item.layout,
                        });
                        setRightDrawer(null);
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2.5 font-semibold"
                    >
                      <Icon className="w-4 h-4 text-indigo-600" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* COMMENTS & REACTIONS DRAWER */}
            {rightDrawer === 'comments' && (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2">
                  <input
                    data-testid="new-comment-input"
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment on this card..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <button
                    data-testid="post-comment-btn"
                    onClick={() => {
                      if (!newCommentText.trim()) return;
                      mutateDoc({
                        action: 'add_comment',
                        cardId: doc.cards[activeCardIdx]?.id,
                        content: newCommentText,
                      });
                      setNewCommentText('');
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                  >
                    Post
                  </button>
                </div>

                <div className="space-y-2">
                  {doc.comments.map((cm) => {
                    let reactions: Record<string, number> = {};
                    try {
                      reactions = JSON.parse(cm.reactionsJson || '{}');
                    } catch {
                      reactions = {};
                    }
                    return (
                      <div
                        key={cm.id}
                        className={`p-3 rounded-xl border space-y-2 ${
                          cm.resolved
                            ? 'bg-slate-50/50 border-slate-100 opacity-60'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{cm.authorName}</span>
                          <button
                            onClick={() =>
                              mutateDoc({
                                action: 'resolve_comment',
                                commentId: cm.id,
                                resolved: !cm.resolved,
                              })
                            }
                            className="text-[10px] font-semibold text-indigo-600 hover:underline"
                          >
                            {cm.resolved ? 'Reopen' : '✓ Resolve'}
                          </button>
                        </div>
                        <p className="text-slate-700">{cm.content || cm.body}</p>
                        <div className="flex items-center gap-1.5 pt-1">
                          {['🔥', '👍', '🚀', '💡'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() =>
                                mutateDoc({
                                  action: 'react_comment',
                                  commentId: cm.id,
                                  emoji,
                                })
                              }
                              className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] hover:border-indigo-400"
                            >
                              {emoji} {reactions[emoji] || ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
