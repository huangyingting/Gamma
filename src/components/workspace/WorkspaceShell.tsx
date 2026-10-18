'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Image as ImageIcon,
  LayoutTemplate,
  Palette,
  Settings,
  Search,
  Plus,
  Sparkles,
  Folder as FolderIcon,
  Globe,
  Trash2,
  Star,
  LayoutGrid,
  List,
  CheckSquare,
  Share2,
  Key,
  Shield,
  Users,
  CreditCard,
  Link2,
  Cpu,
  FileWarning,
  FolderInput,
  Upload,
  Wand2,
  MessageSquare,
  ExternalLink,
  Check,
  X,
  Lock,
  Copy,
  RefreshCw,
  ArrowUpRight,
  Sliders,
  Type,
  Shapes,
  Archive,
} from 'lucide-react';

export type WorkspaceSection =
  | 'gammas'
  | 'agent-home'
  | 'chats'
  | 'folders'
  | 'folder-detail'
  | 'shared-with-you'
  | 'api-generated'
  | 'sites'
  | 'ai-images'
  | 'media-graphics'
  | 'templates'
  | 'templates-archived'
  | 'themes'
  | 'fonts'
  | 'icon-libraries'
  | 'instructions'
  | 'trash'
  | 'settings-overview'
  | 'settings-members'
  | 'settings-billing'
  | 'settings-sharing'
  | 'settings-public-links'
  | 'settings-api-keys'
  | 'settings-my-connectors'
  | 'settings-design'
  | 'settings-sso'
  | 'settings-audit-logs'
  | 'settings-ownerless-files'
  | 'settings-unowned-folders';

const TEMPLATE_CATEGORIES = [
  'All',
  'Strategy',
  'Company',
  'Fundraising',
  'Sales',
  'Marketing',
  'Reporting',
  'Creative',
  'Product',
  'Engineering',
  'Education',
  'Consulting',
  'People',
];

export function WorkspaceShell({
  initialSection = 'gammas',
  folderSlug,
}: {
  initialSection?: WorkspaceSection;
  folderSlug?: string;
}) {
  const router = useRouter();
  const [section, setSection] = useState<WorkspaceSection>(initialSection);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Filters & view toggles
  const [docTab, setDocTab] = useState<'all' | 'recent' | 'created' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [templateCategory, setTemplateCategory] = useState('All');
  const [themeTab, setThemeTab] = useState<'ALL' | 'CUSTOM' | 'STANDARD' | 'ARCHIVED'>('ALL');
  const [membersTab, setMembersTab] = useState<'members' | 'groups' | 'guests' | 'invitations'>('members');
  const [mediaTab, setMediaTab] = useState<'ALL' | 'AI_GENERATED' | 'UPLOADED' | 'VECTOR_GRAPHIC'>('ALL');

  // Modals & sheets
  const [cmdKOpen, setCmdKOpen] = useState(false);
  const [gamma5AnnouncementOpen, setGamma5AnnouncementOpen] = useState(false);
  const [creditsSheetOpen, setCreditsSheetOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [folderShareModalFolder, setFolderShareModalFolder] = useState<any>(null);
  const [uploadFontModalOpen, setUploadFontModalOpen] = useState(false);
  const [themeBuilderModalOpen, setThemeBuilderModalOpen] = useState(false);

  // Form states
  const [newFolderName, setNewFolderName] = useState('Q4 Strategic OKRs & Board Reviews');
  const [newFontName, setNewFontName] = useState('Genesis Display Pro');
  const [newThemeName, setNewThemeName] = useState('Aurora Cyber Enterprise');
  const [newThemePrimary, setNewThemePrimary] = useState('#4f46e5');
  const [newThemeAccent, setNewThemeAccent] = useState('#06b6d4');
  const [aiImagePrompt, setAiImagePrompt] = useState(
    'Isometric 3D glassmorphic cloud neural architecture with glowing cyan pipelines'
  );
  const [aiImageModel, setAiImageModel] = useState('Flux Fast 1.1');
  const [agentEntryPrompt, setAgentEntryPrompt] = useState('');
  const [agentEntryMode, setAgentEntryMode] = useState<'EXPRESS' | 'STANDARD' | 'RESEARCH'>('STANDARD');
  const [customInstructionsText, setCustomInstructionsText] = useState('');

  // Invite-only governance states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('EDITOR');
  const [inviteHours, setInviteHours] = useState(168);
  const [lastIssuedInvite, setLastIssuedInvite] = useState<{
    code: string;
    email: string;
    inviteUrl: string;
  } | null>(null);
  const [newApiKeyName, setNewApiKeyName] = useState('CI/CD Executive Deck Pipeline');
  const [generatedRawApiKey, setGeneratedRawApiKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function fetchWorkspace() {
    try {
      const res = await fetch('/api/workspace');
      const json = await res.json();
      if (json.ok) {
        setData(json);
        setCustomInstructionsText(
          json.workspace?.customInstructions ||
            'Lead with executive takeaways and quantifiable ROI metrics.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkspace();
  }, []);

  // Support hash navigation (/#folders, /#shared-with-you, /#api-generated, /#fonts, /#icon-libraries, /#instructions, /#chats, etc.)
  useEffect(() => {
    function syncHash() {
      const h = window.location.hash.replace('#', '');
      if (h === 'folders') setSection('folders');
      else if (h === 'shared-with-you') setSection('shared-with-you');
      else if (h === 'api-generated') setSection('api-generated');
      else if (h === 'fonts') setSection('fonts');
      else if (h === 'icon-libraries') setSection('icon-libraries');
      else if (h === 'instructions') setSection('instructions');
      else if (h === 'templates-archived') setSection('templates-archived');
      else if (h === 'media-graphics') setSection('media-graphics');
      else if (h === 'chats') setSection('chats');
      else if (h === 'agent-home') setSection('agent-home');
      else if (h === 'files') setSection('gammas');
    }
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Cmd+K global shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdKOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const allDocs: any[] = data?.docs || [];
  const folders: any[] = data?.workspace?.folders || [];
  const themes: any[] = data?.workspace?.themes || [];
  const customFonts: any[] = data?.workspace?.customFonts || [];
  const iconLibraries: any[] = data?.workspace?.iconLibraries || [];
  const templates: any[] = data?.workspace?.templates || [];
  const aiImages: any[] = data?.workspace?.aiImages || [];
  const sites: any[] = data?.workspace?.sites || [];
  const apiKeys: any[] = data?.workspace?.apiKeys || [];
  const mcpConnectors: any[] = data?.workspace?.mcpConnectors || [];
  const agentChats: any[] = data?.workspace?.agentChats || [];
  const users: any[] = data?.users || [];
  const groups: any[] = data?.workspace?.groups || [];
  const invitations: any[] = data?.invitations || [];
  const auditLogs: any[] = data?.auditLogs || [];

  const activeFolder = useMemo(() => {
    if (!folderSlug) return null;
    return folders.find((f) => f.slug === folderSlug || f.id === folderSlug) || null;
  }, [folders, folderSlug]);

  const filteredDocs = useMemo(() => {
    return allDocs.filter((d) => {
      if (section === 'trash') return Boolean(d.trashedAt);
      if (d.trashedAt) return false;
      if (section === 'shared-with-you' && !d.isSharedWithMe) return false;
      if (section === 'api-generated' && !d.isApiGenerated) return false;
      if (section === 'folder-detail' && activeFolder && d.folderId !== activeFolder.id) {
        return false;
      }
      if (docTab === 'favorites' && !d.isFavorite) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !d.title.toLowerCase().includes(q) &&
          !(d.folder?.name || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allDocs, section, activeFolder, docTab, searchQuery]);

  async function handleCreateNewDeck(promptOrTitle?: string) {
    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: promptOrTitle || 'Untitled Gamma Presentation',
        format: 'PRESENTATION',
      }),
    });
    const json = await res.json();
    if (json.ok && json.doc) {
      router.push(`/docs/${json.doc.id}`);
    }
  }

  async function handleToggleFavorite(docId: string, current: boolean) {
    await fetch(`/api/docs/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: !current }),
    });
    fetchWorkspace();
  }

  async function handleBulkAction(action: 'trash' | 'restore' | 'favorite') {
    if (selectedDocIds.length === 0) return;
    await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bulkAction: action,
        docIds: selectedDocIds,
      }),
    });
    setSelectedDocIds([]);
    showToast(`Applied ${action} to ${selectedDocIds.length} gamma(s).`);
    fetchWorkspace();
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_folder',
        name: newFolderName,
        isPinned: true,
      }),
    });
    setCreateFolderModalOpen(false);
    showToast(`Created folder "${newFolderName}".`);
    fetchWorkspace();
  }

  async function handleUploadFont(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upload_font',
        familyName: newFontName,
      }),
    });
    setUploadFontModalOpen(false);
    showToast(`Uploaded custom font family "${newFontName}".`);
    fetchWorkspace();
  }

  async function handleCreateTheme(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_theme',
        name: newThemeName,
        primaryColor: newThemePrimary,
        accentColor: newThemeAccent,
      }),
    });
    setThemeBuilderModalOpen(false);
    showToast(`Saved custom theme "${newThemeName}".`);
    fetchWorkspace();
  }

  async function handleGenerateAiImage() {
    await fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_ai_image',
        prompt: aiImagePrompt,
        model: aiImageModel,
      }),
    });
    showToast('Generated new AI visual asset (-10 credits).');
    fetchWorkspace();
  }

  async function handleCreateInvitation(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteEmail,
        role: inviteRole,
        expiresInHours: inviteHours,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setLastIssuedInvite({
        code: json.code,
        email: inviteEmail,
        inviteUrl: json.inviteUrl,
      });
      setInviteEmail('');
      showToast(`Issued single-use invitation ${json.code}!`);
      fetchWorkspace();
    } else {
      showToast(json.message || 'Failed to create invitation.');
    }
  }

  async function handleRevokeInvitation(id: string) {
    await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke', id }),
    });
    showToast('Invitation revoked and logged to AuditLog.');
    fetchWorkspace();
  }

  async function handleUpdateUserAccess(
    userId: string,
    updates: { role?: string; status?: string }
  ) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    showToast('Updated member access & recorded audit trail.');
    fetchWorkspace();
  }

  async function handleCreateApiKey() {
    const res = await fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_api_key',
        name: newApiKeyName,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setGeneratedRawApiKey(json.rawKey);
      showToast('Created new Gamma API key.');
      fetchWorkspace();
    }
  }

  const isSettingsSection = section.startsWith('settings-');
  const isCustomizeSection = ['themes', 'fonts', 'icon-libraries', 'instructions'].includes(section);
  const isMediaSection = ['ai-images', 'media-graphics'].includes(section);
  const isTemplatesSection = ['templates', 'templates-archived'].includes(section);

  return (
    <div data-testid="workspace-shell" className="min-h-screen flex bg-[#f8fafc] text-slate-900">
      {/* 1. Primary 56px Left Icon Rail (matching Gamma 5 UI) */}
      <aside
        data-testid="primary-icon-rail"
        className="w-14 bg-slate-950 text-slate-400 flex flex-col items-center py-4 justify-between shrink-0 z-30"
      >
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            onClick={() => setSection('gammas')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white font-black text-base flex items-center justify-center shadow-lg mb-2"
            title="Gamma 5 Home"
          >
            G
          </Link>

          <button
            data-testid="rail-home-btn"
            onClick={() => setSection('gammas')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              !isMediaSection && !isTemplatesSection && !isCustomizeSection && !isSettingsSection
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Home & Gammas"
          >
            <Home className="w-5 h-5" />
          </button>

          <button
            data-testid="rail-agent-btn"
            onClick={() => setSection('agent-home')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              section === 'agent-home' || section === 'chats'
                ? 'bg-violet-600 text-white shadow-md'
                : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Gamma 5 Agent Home & Chats"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            data-testid="rail-media-btn"
            onClick={() => setSection('ai-images')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              isMediaSection
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Media & AI Images"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            data-testid="rail-templates-btn"
            onClick={() => setSection('templates')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              isTemplatesSection
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Templates Hub"
          >
            <LayoutTemplate className="w-5 h-5" />
          </button>

          <button
            data-testid="rail-customize-btn"
            onClick={() => setSection('themes')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              isCustomizeSection
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Customize Themes, Fonts & Icons"
          >
            <Palette className="w-5 h-5" />
          </button>

          <button
            data-testid="rail-settings-btn"
            onClick={() => setSection('settings-members')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              isSettingsSection
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Workspace Settings & Enterprise Governance"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            data-testid="open-credits-sheet-btn"
            onClick={() => setCreditsSheetOpen(true)}
            className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 flex items-center justify-center text-[10px] font-bold"
            title="AI Credits Balance"
          >
            12.4k
          </button>
          <Link
            href="/signin"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center"
            title="Jack Wolf (Admin)"
          >
            JW
          </Link>
        </div>
      </aside>

      {/* 2. Secondary 230px Contextual Workspace Panel */}
      <aside
        data-testid="secondary-workspace-sidebar"
        className="w-60 bg-white border-r border-slate-200/80 flex flex-col justify-between p-3.5 shrink-0 select-none"
      >
        <div className="space-y-4 overflow-y-auto">
          {/* Workspace Header */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 truncate">
                {data?.workspace?.name || "Jack Wolf's Workspace"}
              </div>
              <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                Enterprise Ultra • Admin
              </div>
            </div>
            <button
              onClick={() => setGamma5AnnouncementOpen(true)}
              className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
              title="Gamma 5 Release Notes"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Search trigger (Cmd+K) */}
          <button
            data-testid="search-files-trigger"
            onClick={() => setCmdKOpen(true)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-500 text-xs flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              Jump to...
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-600 shadow-sm">
              ⌘K
            </kbd>
          </button>

          {/* Contextual Navigation based on active rail */}
          {isSettingsSection ? (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Workspace Settings (11)
              </div>
              {[
                { id: 'settings-overview', label: 'Overview & Profile', icon: Sliders },
                { id: 'settings-members', label: 'Members, Groups & Invites', icon: Users },
                { id: 'settings-billing', label: 'Billing & Credits', icon: CreditCard },
                { id: 'settings-sharing', label: 'Sharing & Security', icon: Shield },
                { id: 'settings-public-links', label: 'Public Access Links', icon: Link2 },
                { id: 'settings-api-keys', label: 'Developer API Keys', icon: Key },
                { id: 'settings-my-connectors', label: 'MCP & App Connectors', icon: Cpu },
                { id: 'settings-design', label: 'Brand & Design Rules', icon: Palette },
                { id: 'settings-sso', label: 'Enterprise SAML SSO', icon: Lock },
                { id: 'settings-audit-logs', label: 'Security Audit Logs', icon: CheckSquare },
                { id: 'settings-ownerless-files', label: 'Ownerless Gammas', icon: FileWarning },
                { id: 'settings-unowned-folders', label: 'Unowned Folders', icon: FolderInput },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-testid={`nav-${item.id}`}
                    onClick={() => setSection(item.id as WorkspaceSection)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                      section === item.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : isCustomizeSection ? (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Brand &amp; Customize
              </div>
              {[
                { id: 'themes', label: 'Themes', icon: Palette },
                { id: 'fonts', label: 'Custom Fonts', icon: Type },
                { id: 'icon-libraries', label: 'Icon Libraries', icon: Shapes },
                { id: 'instructions', label: 'AI Custom Instructions', icon: Wand2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-testid={`nav-customize-${item.id}`}
                    onClick={() => setSection(item.id as WorkspaceSection)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                      section === item.id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : isTemplatesSection ? (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Templates Library
              </div>
              <button
                onClick={() => setSection('templates')}
                className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                  section === 'templates'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutTemplate className="w-4 h-4" />
                <span>Explore Templates</span>
              </button>
              <button
                onClick={() => setSection('templates-archived')}
                className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                  section === 'templates-archived'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Archive className="w-4 h-4" />
                <span>Archived Templates</span>
              </button>
            </div>
          ) : isMediaSection ? (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Media &amp; Visuals
              </div>
              <button
                onClick={() => setSection('ai-images')}
                className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                  section === 'ai-images'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>AI Images Studio</span>
              </button>
              <button
                onClick={() => setSection('media-graphics')}
                className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                  section === 'media-graphics'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shapes className="w-4 h-4" />
                <span>Saved Media &amp; Graphics</span>
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <button
                  data-testid="nav-gammas"
                  onClick={() => setSection('gammas')}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                    section === 'gammas'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Gammas</span>
                </button>
                <button
                  data-testid="nav-agent-home"
                  onClick={() => setSection('agent-home')}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                    section === 'agent-home'
                      ? 'bg-violet-50 text-violet-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span>Gamma 5 Agent</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-bold">
                    NEW
                  </span>
                </button>
                <button
                  data-testid="nav-agent-chats"
                  onClick={() => setSection('chats')}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                    section === 'chats'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Agent Chats</span>
                </button>
                <button
                  data-testid="nav-shared-with-you"
                  onClick={() => setSection('shared-with-you')}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                    section === 'shared-with-you'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Shared with you</span>
                </button>
                <button
                  data-testid="nav-api-generated"
                  onClick={() => setSection('api-generated')}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                    section === 'api-generated'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>API Generated</span>
                </button>
                <button
                  data-testid="nav-sites"
                  onClick={() => setSection('sites')}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                    section === 'sites'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Sites</span>
                </button>
              </div>

              {/* Folders Section */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <button
                    onClick={() => setSection('folders')}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
                  >
                    Folders ({folders.filter((f) => f.ownerId).length})
                  </button>
                  <button
                    data-testid="sidebar-create-folder-btn"
                    onClick={() => setCreateFolderModalOpen(true)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500"
                    title="Create new folder"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {folders
                    .filter((f) => f.ownerId !== null)
                    .map((folder) => (
                      <div
                        key={folder.id}
                        className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                      >
                        <Link
                          href={`/folders/${folder.slug}`}
                          className="flex items-center gap-2 truncate flex-1"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: folder.color || '#4f46e5' }}
                          />
                          <span className="truncate">{folder.name}</span>
                        </Link>
                        <button
                          onClick={() => setFolderShareModalFolder(folder)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-indigo-600"
                          title="Share folder"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          <button
            data-testid="nav-trash"
            onClick={() => setSection('trash')}
            className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
              section === 'trash'
                ? 'bg-rose-50 text-rose-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Trash</span>
          </button>
          <button
            onClick={() => setCreditsSheetOpen(true)}
            className="w-full px-2.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 text-indigo-800 text-xs font-semibold flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Credits</span>
            </span>
            <span>{(data?.workspace?.credits ?? 12450).toLocaleString()}</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Action Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              data-testid="create-new-ai-btn"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              Create new AI
            </Link>
            <button
              data-testid="new-blank-gamma-btn"
              onClick={() => handleCreateNewDeck('Untitled Strategic Presentation')}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              New gamma
            </button>
            <Link
              href="/create/import"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hidden sm:inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </Link>
            <Link
              href="/create/studio"
              className="px-3.5 py-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold hidden md:inline-flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              AI Studio
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                data-testid="workspace-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter gammas..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-52 focus:border-indigo-500 outline-none"
              />
            </div>
            <Link
              href="/?view=marketing"
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 hidden lg:inline"
            >
              Marketing Tour
            </Link>
          </div>
        </header>

        {/* Body Content Dispatcher */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* SECTION: GAMMA 5 AGENT ENTRY HOME (62_gamma5_agent_entry_home.png) */}
          {section === 'agent-home' && (
            <div
              data-testid="gamma5-agent-entry-home"
              className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-indigo-500/20"
            >
              <div className="max-w-3xl mx-auto text-center space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gamma 5 Conversational Agent Workspace
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  What would you like to design with Gamma Agent today?
                </h1>
                <p className="text-sm text-slate-300">
                  Collaborate in multi-turn threads, attach Google Drive or Notion MCP context, and synthesize live decks.
                </p>

                <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-left space-y-3">
                  <textarea
                    data-testid="agent-entry-prompt-input"
                    rows={3}
                    value={agentEntryPrompt}
                    onChange={(e) => setAgentEntryPrompt(e.target.value)}
                    placeholder="Ask Gamma Agent to build a 6-card Q4 Board Deck, webpage, or competitive analysis..."
                    className="w-full bg-transparent text-white placeholder-slate-400 text-sm outline-none resize-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {(['EXPRESS', 'STANDARD', 'RESEARCH'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setAgentEntryMode(m)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            agentEntryMode === m
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white/10 text-slate-300 hover:bg-white/15'
                          }`}
                        >
                          {m === 'EXPRESS'
                            ? '⚡ Express (5c)'
                            : m === 'STANDARD'
                            ? '✨ Standard (15c)'
                            : '🔬 Research + Citations (40c)'}
                        </button>
                      ))}
                    </div>
                    <button
                      data-testid="agent-entry-launch-btn"
                      onClick={() =>
                        handleCreateNewDeck(
                          agentEntryPrompt || 'Q4 Agentic Enterprise Architecture Deck'
                        )
                      }
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold shadow-lg"
                    >
                      Synthesize Deck →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AGENT CHATS HISTORY (63_gamma5_agent_chats_history.png) */}
          {section === 'chats' && (
            <div data-testid="agent-chats-history-view" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Gamma 5 Agent Chats History
                  </h1>
                  <p className="text-xs text-slate-500">
                    Resume any multi-turn AI creation thread or open its generated deck.
                  </p>
                </div>
                <button
                  onClick={() => setSection('agent-home')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  + New Agent Thread
                </button>
              </div>
              <div className="grid gap-4">
                {agentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          {chat.mode} MODE • {chat.creditsUsed} credits
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {chat.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Linked Gamma ID: {chat.docId || 'amqq3hoavnc5sek'}
                      </p>
                    </div>
                    <Link
                      href={`/docs/${chat.docId || 'amqq3hoavnc5sek'}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      Open in Editor
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: GAMMAS / SHARED / API GENERATED / FOLDER DETAIL / TRASH */}
          {['gammas', 'shared-with-you', 'api-generated', 'folder-detail', 'trash'].includes(
            section
          ) && (
            <div className="space-y-5">
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {section === 'shared-with-you'
                      ? 'Shared with you'
                      : section === 'api-generated'
                      ? 'API Generated Gammas'
                      : section === 'folder-detail'
                      ? activeFolder?.name || 'Folder View'
                      : section === 'trash'
                      ? 'Trash (30-Day Retention)'
                      : 'Gammas'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {section === 'api-generated'
                      ? 'Decks generated programmatically via REST / MCP Template API'
                      : section === 'folder-detail'
                      ? activeFolder?.description
                      : `${filteredDocs.length} presentations, webpages & documents`}
                  </p>
                </div>

                {/* Filter pills & Grid/List switcher */}
                <div className="flex items-center gap-2">
                  {section === 'gammas' && (
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                      {(
                        [
                          { id: 'all', label: 'All' },
                          { id: 'recent', label: 'Recently viewed' },
                          { id: 'created', label: 'Created by you' },
                          { id: 'favorites', label: 'Favorites' },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setDocTab(t.id)}
                          className={`px-3 py-1 rounded-lg transition ${
                            docTab === t.id
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                    <button
                      data-testid="view-mode-grid-btn"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg ${
                        viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                      }`}
                      title="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      data-testid="view-mode-list-btn"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg ${
                        viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                      }`}
                      title="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Selection Bar (40_workspace_bulk_selection_bar.png) */}
              {selectedDocIds.length > 0 && (
                <div
                  data-testid="bulk-selection-action-bar"
                  className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between"
                >
                  <span className="text-xs font-bold">
                    {selectedDocIds.length} gamma(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkAction('favorite')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold"
                    >
                      ★ Favorite
                    </button>
                    {section === 'trash' ? (
                      <button
                        onClick={() => handleBulkAction('restore')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBulkAction('trash')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold"
                      >
                        Move to Trash
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedDocIds([])}
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Grid vs List Rendering */}
              {viewMode === 'grid' ? (
                <div
                  data-testid="gammas-grid-container"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      data-testid={`doc-card-${doc.id}`}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail Header */}
                        <div className="h-36 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 p-4 flex flex-col justify-between relative text-white">
                          <div className="flex items-center justify-between">
                            <input
                              type="checkbox"
                              checked={selectedDocIds.includes(doc.id)}
                              onChange={(e) => {
                                setSelectedDocIds((prev) =>
                                  e.target.checked
                                    ? [...prev, doc.id]
                                    : prev.filter((id) => id !== doc.id)
                                );
                              }}
                              className="w-4 h-4 rounded accent-indigo-500"
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-[10px] font-bold">
                                {doc.format} • {doc.cards?.length || 4} cards
                              </span>
                              <button
                                onClick={() => handleToggleFavorite(doc.id, doc.isFavorite)}
                                className={`p-1 rounded-full ${
                                  doc.isFavorite ? 'text-amber-400' : 'text-white/60 hover:text-white'
                                }`}
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>
                            </div>
                          </div>
                          <Link href={`/docs/${doc.id}`} className="block">
                            <div className="text-sm font-bold line-clamp-2 group-hover:text-cyan-200 transition">
                              {doc.title}
                            </div>
                          </Link>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{doc.folder?.name || 'All Gammas'}</span>
                            <span>{doc.viewCount} views</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium truncate">
                          By {doc.owner?.name || 'Workspace'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/public/${doc.id}`}
                            className="text-slate-500 hover:text-indigo-600 font-semibold"
                          >
                            View
                          </Link>
                          <Link
                            href={`/docs/${doc.id}`}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  data-testid="gammas-list-table"
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                >
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Folder</th>
                        <th className="py-3 px-4">Format</th>
                        <th className="py-3 px-4">Creator</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <Link href={`/docs/${doc.id}`} className="hover:text-indigo-600">
                              {doc.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {doc.folder?.name || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                              {doc.format}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {doc.owner?.name || 'Jack Wolf'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/docs/${doc.id}`}
                              className="text-indigo-600 font-semibold hover:underline"
                            >
                              Open Editor →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION: ALL FOLDERS (38_workspace_all_folders_view.png) */}
          {section === 'folders' && (
            <div data-testid="all-folders-view" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">All Workspace Folders</h1>
                  <p className="text-xs text-slate-500">
                    Organize team gammas and configure group-level folder permissions.
                  </p>
                </div>
                <button
                  onClick={() => setCreateFolderModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Create Folder
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {folders.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: f.color || '#4f46e5' }}
                        />
                        {f.isPinned && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            Pinned
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/folders/${f.slug}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600"
                      >
                        {f.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">{f.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <Link
                        href={`/folders/${f.slug}`}
                        className="font-semibold text-indigo-600"
                      >
                        Open folder →
                      </Link>
                      <button
                        onClick={() => setFolderShareModalFolder(f)}
                        className="text-slate-500 hover:text-slate-900 font-medium"
                      >
                        Share ACL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: SITES (06_workspace_sites.png) */}
          {section === 'sites' && (
            <div data-testid="sites-management-view" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Gamma Sites</h1>
                  <p className="text-xs text-slate-500">
                    Publish any gamma as a multi-section responsive website with custom domains &amp; SSL.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/workspace', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'publish_site',
                        docId: 'amqq3hoavnc5sek',
                        name: 'Executive Portal Site',
                      }),
                    });
                    showToast('Published gamma as a live Site!');
                    fetchWorkspace();
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Convert Existing Gamma to Site
                </button>
              </div>
              <div className="grid gap-4">
                {sites.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{s.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          ● {s.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>
                          Custom Domain:{' '}
                          <strong className="text-indigo-600">
                            {s.customDomain || `${s.subdomain}.gamma.site`}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>Source: {s.doc?.title || 'Your Roadmap to Success'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/s/${s.subdomain}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Visit Live Site
                      </Link>
                      <Link
                        href={`/docs/${s.docId}`}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                      >
                        Edit Site Content
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: AI IMAGES & MEDIA GRAPHICS (07 & 50) */}
          {isMediaSection && (
            <div data-testid="media-ai-images-view" className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 rounded-3xl p-6 text-white flex flex-col lg:flex-row items-center justify-between gap-5">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Sparkles className="w-4 h-4" />
                    Gamma 5 AI Image &amp; Vector Graphic Studio
                  </div>
                  <h1 className="text-2xl font-bold">
                    Generate bespoke slide visuals &amp; isometric vector diagrams
                  </h1>
                  <input
                    data-testid="ai-image-prompt-input"
                    type="text"
                    value={aiImagePrompt}
                    onChange={(e) => setAiImagePrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-300 outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={aiImageModel}
                    onChange={(e) => setAiImageModel(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                  >
                    <option value="Flux Fast 1.1" className="text-slate-900">
                      Flux Fast 1.1 (10c)
                    </option>
                    <option value="Imagen 3 Pro" className="text-slate-900">
                      Imagen 3 Pro (15c)
                    </option>
                    <option value="Gamma Vector SVG Studio" className="text-slate-900">
                      Vector SVG Studio (5c)
                    </option>
                  </select>
                  <button
                    data-testid="generate-ai-image-btn"
                    onClick={handleGenerateAiImage}
                    className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-lg"
                  >
                    ✨ Generate Image
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(['ALL', 'AI_GENERATED', 'UPLOADED', 'VECTOR_GRAPHIC'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setMediaTab(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      mediaTab === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiImages
                  .filter((img) => mediaTab === 'ALL' || img.source === mediaTab)
                  .map((img) => (
                    <div
                      key={img.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div
                        className="h-40 bg-cover bg-center"
                        style={{ backgroundImage: `url(${img.imageUrl})` }}
                      />
                      <div className="p-3.5 space-y-1.5">
                        <div className="text-xs font-semibold text-slate-800 line-clamp-2">
                          {img.prompt}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{img.model}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold">
                            {img.style}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION: TEMPLATES HUB (08 & 49) */}
          {isTemplatesSection && (
            <div data-testid="templates-hub-view" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {section === 'templates-archived'
                      ? 'Archived Workspace Templates'
                      : 'Templates Gallery (12 Categories)'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    Start from a proven structural blueprint and customize with Gamma Agent.
                  </p>
                </div>
              </div>

              {section === 'templates' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
                        templateCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {templates
                  .filter((tpl) =>
                    section === 'templates-archived' ? tpl.isArchived : !tpl.isArchived
                  )
                  .filter(
                    (tpl) =>
                      templateCategory === 'All' || tpl.category === templateCategory
                  )
                  .map((tpl) => (
                    <div
                      key={tpl.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div
                          className="h-32 p-4 text-white flex flex-col justify-between"
                          style={{ background: tpl.thumbnailGradient }}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                            <span className="px-2 py-0.5 rounded bg-black/25">
                              {tpl.category}
                            </span>
                            <span>{tpl.cardCount} cards</span>
                          </div>
                          <div className="text-sm font-bold">{tpl.title}</div>
                        </div>
                        <div className="p-4 text-xs text-slate-600">{tpl.description}</div>
                      </div>
                      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Used {tpl.usageCount} times
                        </span>
                        <button
                          onClick={() => handleCreateNewDeck(tpl.title)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION: CUSTOMIZE — THEMES, FONTS, ICON LIBRARIES, INSTRUCTIONS (11, 44-48) */}
          {section === 'themes' && (
            <div data-testid="customize-themes-view" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Workspace Themes</h1>
                  <p className="text-xs text-slate-500">
                    One-click design tokens controlling colors, typography, card surfaces, and gradients.
                  </p>
                </div>
                <button
                  data-testid="open-theme-builder-btn"
                  onClick={() => setThemeBuilderModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  + New Custom Theme
                </button>
              </div>

              <div className="flex items-center gap-2">
                {(['ALL', 'CUSTOM', 'STANDARD', 'ARCHIVED'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setThemeTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      themeTab === tab
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {themes
                  .filter((t) => themeTab === 'ALL' || t.category === themeTab)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm"
                    >
                      <div
                        className="h-32 p-4 flex flex-col justify-between"
                        style={{
                          background: t.gradientCss,
                          color: t.textColor,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/20">
                            {t.category}
                          </span>
                          {t.isDefault && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500 text-white">
                              Workspace Default
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-base font-bold">{t.name}</div>
                          <div className="text-[11px] opacity-80">
                            {t.headingFont} • {t.bodyFont}
                          </div>
                        </div>
                      </div>
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {[t.primaryColor, t.secondaryColor, t.accentColor, t.backgroundColor].map(
                            (c, idx) => (
                              <span
                                key={idx}
                                className="w-5 h-5 rounded-full border border-slate-200"
                                style={{ backgroundColor: c }}
                              />
                            )
                          )}
                        </div>
                        <span className="text-xs font-semibold text-indigo-600">
                          Ready
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {section === 'fonts' && (
            <div data-testid="customize-fonts-view" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Custom Corporate Fonts</h1>
                  <p className="text-xs text-slate-500">
                    Upload WOFF2, TTF, or OTF brand font families for use across all workspace themes.
                  </p>
                </div>
                <button
                  data-testid="open-upload-font-modal-btn"
                  onClick={() => setUploadFontModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Upload Custom Font
                </button>
              </div>
              <div className="grid gap-4">
                {customFonts.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-base font-bold text-slate-900">{f.familyName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Format: {f.format} • {f.fileSizeKb} KB • Uploaded by {f.uploadedBy}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      ✓ License Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'icon-libraries' && (
            <div data-testid="customize-icon-libraries-view" className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Custom Icon Libraries</h1>
                  <p className="text-xs text-slate-500">
                    Curated SVG icon packs used by Gamma Smart Layouts and Agent diagrams.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {iconLibraries.map((lib) => (
                  <div
                    key={lib.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{lib.name}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        {lib.iconCount} SVG icons
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Style: {lib.style}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'instructions' && (
            <div data-testid="customize-instructions-view" className="space-y-5 max-w-3xl">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Workspace &amp; User AI Custom Instructions
                </h1>
                <p className="text-xs text-slate-500">
                  Define persistent editorial tone, formatting rules, and domain terminology for Gamma Agent.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <label className="block text-xs font-bold uppercase text-slate-500">
                  Workspace-Wide Agent Instructions
                </label>
                <textarea
                  rows={5}
                  value={customInstructionsText}
                  onChange={(e) => setCustomInstructionsText(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
                />
                <button
                  onClick={async () => {
                    await fetch('/api/workspace', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ customInstructions: customInstructionsText }),
                    });
                    showToast('Saved Workspace AI Custom Instructions!');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Save Instructions
                </button>
              </div>
            </div>
          )}

          {/* SECTION: SETTINGS — ALL 11 ENTERPRISE SUB-PAGES (51-61 & 81) */}
          {section === 'settings-members' && (
            <div data-testid="settings-members-view" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Members, Groups, Guests &amp; Invite-Only Admission
                  </h1>
                  <p className="text-xs text-slate-500">
                    Manage RBAC roles (ADMIN, EDITOR, VIEWER), single-use expiring invitation codes, and account revocation.
                  </p>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  {(
                    [
                      { id: 'members', label: `Members (${users.length})` },
                      { id: 'groups', label: `Groups (${groups.length})` },
                      { id: 'guests', label: 'Guests' },
                      { id: 'invitations', label: `Invitations (${invitations.length})` },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      data-testid={`members-tab-${t.id}`}
                      onClick={() => setMembersTab(t.id)}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        membersTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single-Use Invitation Generator Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Issue Single-Use Expiring Invitation Code
                    </h2>
                    <p className="text-xs text-slate-500">
                      Bound to the invitee&apos;s normalized email address and enforced atomically at registration.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                    Invite-Only Mode Active
                  </span>
                </div>

                <form
                  onSubmit={handleCreateInvitation}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3"
                >
                  <input
                    data-testid="invite-email-input"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@genesisiq.ai"
                    className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <select
                    data-testid="invite-role-select"
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as 'ADMIN' | 'EDITOR' | 'VIEWER')
                    }
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="EDITOR">Role: EDITOR</option>
                    <option value="VIEWER">Role: VIEWER</option>
                    <option value="ADMIN">Role: ADMIN</option>
                  </select>
                  <button
                    data-testid="issue-invite-btn"
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Generate Invite Code
                  </button>
                </form>

                {lastIssuedInvite && (
                  <div
                    data-testid="issued-invite-banner"
                    className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900"
                  >
                    <div>
                      <span className="font-bold">Issued Code: </span>
                      <code className="px-2 py-0.5 rounded bg-white font-mono font-bold">
                        {lastIssuedInvite.code}
                      </code>{' '}
                      for <strong>{lastIssuedInvite.email}</strong>
                    </div>
                    <Link
                      href={lastIssuedInvite.inviteUrl}
                      className="text-indigo-700 font-bold underline"
                    >
                      Open Redemption Link →
                    </Link>
                  </div>
                )}
              </div>

              {membersTab === 'members' || membersTab === 'guests' ? (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Group</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Governance Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users
                        .filter((u) => (membersTab === 'guests' ? u.isGuest : true))
                        .map((u) => (
                          <tr key={u.id} data-testid={`member-row-${u.email}`}>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-slate-500">{u.email}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{u.groupName}</td>
                            <td className="py-3 px-4">
                              <select
                                data-testid={`role-select-${u.email}`}
                                value={u.role}
                                onChange={(e) =>
                                  handleUpdateUserAccess(u.id, { role: e.target.value })
                                }
                                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold"
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="EDITOR">EDITOR</option>
                                <option value="VIEWER">VIEWER</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                data-testid={`toggle-status-${u.email}`}
                                onClick={() =>
                                  handleUpdateUserAccess(u.id, {
                                    status: u.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE',
                                  })
                                }
                                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? 'Revoke Access' : 'Restore Access'}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : membersTab === 'groups' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {groups.map((g) => (
                    <div
                      key={g.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{g.name}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          {g.memberCount} members
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{g.description}</p>
                      <div className="text-[11px] font-semibold text-slate-700">
                        Default Permission: <span className="uppercase">{g.permission}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Invited Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invitations.map((inv) => (
                        <tr key={inv.id} data-testid={`invite-row-${inv.code}`}>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                            {inv.code}
                          </td>
                          <td className="py-3 px-4">{inv.email}</td>
                          <td className="py-3 px-4 font-semibold">{inv.role}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700'
                                  : inv.status === 'ACCEPTED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {inv.status === 'PENDING' && (
                              <button
                                data-testid={`revoke-invite-${inv.code}`}
                                onClick={() => handleRevokeInvitation(inv.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Other 10 Enterprise Settings Sections */}
          {section === 'settings-overview' && (
            <div data-testid="settings-overview-view" className="max-w-2xl space-y-4">
              <h1 className="text-xl font-bold text-slate-900">Workspace Overview &amp; Profile</h1>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    defaultValue={data?.workspace?.name || "Jack Wolf's Workspace"}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Workspace Slug
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="jack-wolf-workspace"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          {section === 'settings-billing' && (
            <div data-testid="settings-billing-view" className="space-y-4">
              <h1 className="text-xl font-bold text-slate-900">
                Enterprise Billing &amp; AI Credit Pool
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="text-xs text-slate-500">Active Plan</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">
                    Enterprise Ultra
                  </div>
                  <div className="text-xs text-slate-500 mt-1">14 Active Seats • Annual</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="text-xs text-slate-500">Workspace AI Credits</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {(data?.workspace?.credits ?? 12450).toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">Auto-renews monthly</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="text-xs text-slate-500">Next Invoice</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">$630.00</div>
                  <div className="text-xs text-slate-500 mt-1">Visa ending in 4242</div>
                </div>
              </div>
            </div>
          )}

          {section === 'settings-sharing' && (
            <div data-testid="settings-sharing-view" className="max-w-3xl space-y-4">
              <h1 className="text-xl font-bold text-slate-900">
                Workspace Sharing &amp; Agent Network Egress Security
              </h1>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-sm">Default Workspace Member Access</div>
                    <div className="text-slate-500">
                      Permission granted to workspace members on newly created gammas
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold">
                    Can Edit
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-sm">Gamma Agent Web Search &amp; Egress Policy</div>
                    <div className="text-slate-500">
                      Allow Research mode to query verified web sources and internal MCP servers
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                    Enabled (Allow-List)
                  </span>
                </div>
              </div>
            </div>
          )}

          {section === 'settings-public-links' && (
            <div data-testid="settings-public-links-view" className="space-y-4">
              <h1 className="text-xl font-bold text-slate-900">Public Access Links Registry</h1>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Document</th>
                      <th className="py-3 px-4">Public Permission</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allDocs
                      .filter((d) => d.publicAccess !== 'none')
                      .map((d) => (
                        <tr key={d.id}>
                          <td className="py-3 px-4 font-bold">{d.title}</td>
                          <td className="py-3 px-4 uppercase font-semibold text-indigo-600">
                            {d.publicAccess}
                          </td>
                          <td className="py-3 px-4">{d.owner?.name || 'Jack Wolf'}</td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/public/${d.id}`}
                              className="text-indigo-600 font-semibold hover:underline"
                            >
                              Inspect Link →
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === 'settings-api-keys' && (
            <div data-testid="settings-api-keys-view" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Developer API Keys</h1>
                  <p className="text-xs text-slate-500">
                    Authenticate automated deck generation and Template API requests.
                  </p>
                </div>
                <button
                  onClick={handleCreateApiKey}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Create API Key
                </button>
              </div>
              {generatedRawApiKey && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  New API Key Generated: <code className="font-mono font-bold">{generatedRawApiKey}</code>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Key Name</th>
                      <th className="py-3 px-4">Prefix</th>
                      <th className="py-3 px-4">Scopes</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apiKeys.map((k) => (
                      <tr key={k.id}>
                        <td className="py-3 px-4 font-bold">{k.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{k.keyPrefix}</td>
                        <td className="py-3 px-4 text-slate-500">{k.scopes}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === 'settings-my-connectors' && (
            <div data-testid="settings-connectors-view" className="space-y-4">
              <h1 className="text-xl font-bold text-slate-900">
                MCP &amp; First-Party App Connectors
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mcpConnectors.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900">{c.name}</div>
                      <p className="text-xs text-slate-500">{c.description}</p>
                      {c.endpointUrl && (
                        <code className="text-[10px] text-indigo-600 font-mono">
                          {c.endpointUrl}
                        </code>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        await fetch('/api/workspace', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'toggle_connector',
                            connectorId: c.id,
                          }),
                        });
                        fetchWorkspace();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        c.status === 'connected'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.status === 'connected' ? '✓ Connected' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'settings-design' && (
            <div data-testid="settings-design-view" className="max-w-2xl space-y-4">
              <h1 className="text-xl font-bold text-slate-900">Brand &amp; Design Governance</h1>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Default Workspace Theme</span>
                  <span className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 font-bold">
                    Prism
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Default Icon Library</span>
                  <span className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 font-bold">
                    GenesisIQ Brand Duotone
                  </span>
                </div>
              </div>
            </div>
          )}

          {section === 'settings-sso' && (
            <div data-testid="settings-sso-view" className="max-w-2xl space-y-4">
              <h1 className="text-xl font-bold text-slate-900">
                Enterprise SAML 2.0 Single Sign-On (SSO)
              </h1>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Identity Provider</span>
                  <span className="font-semibold text-indigo-600">
                    {data?.workspace?.ssoProvider || 'Okta SAML 2.0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Verified Domain</span>
                  <span className="font-mono">{data?.workspace?.ssoDomain || 'genesisiq.ai'}</span>
                </div>
              </div>
            </div>
          )}

          {section === 'settings-audit-logs' && (
            <div data-testid="settings-audit-logs-view" className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Immutable Security Audit Logs
                </h1>
                <p className="text-xs text-slate-500">
                  Real-time cryptographic audit trail of account bootstrap, invitation lifecycle, logins, role changes, and revocations.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Event Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} data-testid={`audit-log-row-${log.action}`}>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">{log.actorEmail || 'system'}</td>
                        <td className="py-2.5 px-4">{log.targetEmail || log.targetId || '—'}</td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                          {log.metadataJson}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === 'settings-ownerless-files' && (
            <div data-testid="settings-ownerless-files-view" className="space-y-4">
              <h1 className="text-xl font-bold text-slate-900">Ownerless Gammas Recovery</h1>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                {allDocs
                  .filter((d) => !d.ownerId)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between py-2 border-b border-slate-100 text-xs"
                    >
                      <span className="font-bold">{d.title}</span>
                      <button
                        onClick={async () => {
                          await fetch('/api/workspace', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'claim_ownerless_doc',
                              docId: d.id,
                            }),
                          });
                          showToast('Claimed ownership of orphaned gamma.');
                          fetchWorkspace();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold"
                      >
                        Claim Ownership
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {section === 'settings-unowned-folders' && (
            <div data-testid="settings-unowned-folders-view" className="space-y-4">
              <h1 className="text-xl font-bold text-slate-900">Unowned Folders Recovery</h1>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                {folders
                  .filter((f) => !f.ownerId)
                  .map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between py-2 border-b border-slate-100 text-xs"
                    >
                      <div>
                        <div className="font-bold">{f.name}</div>
                        <div className="text-slate-500">{f.description}</div>
                      </div>
                      <button
                        onClick={async () => {
                          await fetch('/api/workspace', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'update_folder',
                              folderId: f.id,
                              ownerId: '5312nslecjum8si',
                            }),
                          });
                          showToast('Assigned folder to Jack Wolf.');
                          fetchWorkspace();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold"
                      >
                        Claim Folder
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* GLOBAL MODALS */}
      {/* 1. Cmd+K Global Search Modal (37_workspace_global_search_cmd_k.png) */}
      {cmdKOpen && (
        <div
          data-testid="cmd-k-modal"
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 flex items-center gap-2.5">
              <Search className="w-4 h-4 text-indigo-600" />
              <input
                data-testid="search-files-input"
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gammas, folders, templates, or settings..."
                className="flex-1 text-sm outline-none"
              />
              <button
                onClick={() => setCmdKOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                ESC
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 text-xs">
              {allDocs.slice(0, 6).map((d) => (
                <Link
                  key={d.id}
                  href={`/docs/${d.id}`}
                  onClick={() => setCmdKOpen(false)}
                  className="p-2.5 hover:bg-indigo-50 rounded-xl flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800">{d.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {d.format}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Folder Modal (39_workspace_create_folder_modal.png) */}
      {createFolderModalOpen && (
        <div
          data-testid="create-folder-modal"
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateFolder}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Create new folder</h3>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateFolderModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Create folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Upload Custom Font Modal (45_customize_upload_font_modal.png) */}
      {uploadFontModalOpen && (
        <div
          data-testid="upload-font-modal"
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleUploadFont}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Upload custom font family</h3>
            <p className="text-xs text-slate-500">
              Supported formats: .woff2, .woff, .ttf, .otf (up to 15MB)
            </p>
            <input
              type="text"
              required
              value={newFontName}
              onChange={(e) => setNewFontName(e.target.value)}
              placeholder="Font Family Name"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUploadFontModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Upload font
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Custom Theme Builder Modal (48_customize_new_theme_builder.png) */}
      {themeBuilderModalOpen && (
        <div
          data-testid="theme-builder-modal"
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateTheme}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Custom Theme Builder</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Theme Name
              </label>
              <input
                type="text"
                required
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Primary Brand Color
                </label>
                <input
                  type="color"
                  value={newThemePrimary}
                  onChange={(e) => setNewThemePrimary(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Accent Highlight Color
                </label>
                <input
                  type="color"
                  value={newThemeAccent}
                  onChange={(e) => setNewThemeAccent(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setThemeBuilderModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Save Theme
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Folder Share Modal (82_workspace_folder_share_modal.png) */}
      {folderShareModalFolder && (
        <div
          data-testid="folder-share-modal"
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Share &quot;{folderShareModalFolder.name}&quot;
              </h3>
              <button onClick={() => setFolderShareModalFolder(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              All gammas inside this folder inherit its group and member ACLs.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="font-semibold">Executive Leadership (Group)</span>
                <span className="text-indigo-600 font-bold">Full Manage</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="font-semibold">Workspace Members</span>
                <span className="text-slate-700 font-bold">Can Edit</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setFolderShareModalFolder(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AI Credits Sheet (43_workspace_credits_sheet.png) */}
      {creditsSheetOpen && (
        <div
          data-testid="ai-credits-sheet"
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Workspace AI Credits Balance
              </h3>
              <button onClick={() => setCreditsSheetOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
              <div className="text-xs opacity-80">Available Enterprise Pool</div>
              <div className="text-3xl font-black mt-1">
                {(data?.workspace?.credits ?? 12450).toLocaleString()} credits
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>⚡ Gamma Agent Express</span>
                <span className="font-bold">5 credits</span>
              </div>
              <div className="flex justify-between">
                <span>✨ Gamma Agent Standard</span>
                <span className="font-bold">15 credits</span>
              </div>
              <div className="flex justify-between">
                <span>🔬 Gamma Agent Research + Citations</span>
                <span className="font-bold">40 credits</span>
              </div>
              <div className="flex justify-between">
                <span>🎨 Flux Fast 1.1 Image Studio</span>
                <span className="font-bold">10 credits</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Gamma 5 Launch Announcement Modal (04a_gamma5_announcement_modal.png) */}
      {gamma5AnnouncementOpen && (
        <div
          data-testid="gamma5-announcement-modal"
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 text-white rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-4 border border-indigo-500/30">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
              ✨ Meet Gamma 5
            </div>
            <h3 className="text-2xl font-black">
              The Agentic Workspace for Decks, Sites &amp; Studio Visuals
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Switch seamlessly between Manual Edit and the Gamma 5 Conversational Agent, configure 3-column Smart Layouts, edit live chart spreadsheets, and govern workspace access with single-use invitations.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setGamma5AnnouncementOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Explore Gamma 5
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          data-testid="workspace-toast"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
