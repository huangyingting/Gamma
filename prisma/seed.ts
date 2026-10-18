import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/account-admission/passwords';
import { hashOpaqueToken } from '../src/lib/account-admission/tokens';

async function main() {
  console.log('Seeding Gamma 5 Enterprise Workspace database...');

  const adminPass = await hashPassword(
    process.env.BOOTSTRAP_ADMIN_PASSWORD || 'GammaAdminPassword2026!'
  );
  const memberPass = await hashPassword('GammaMemberPassword2026!');

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  // 1. Users
  const jack = await prisma.user.upsert({
    where: { email: 'wlfjck@gmail.com' },
    update: {
      name: 'Jack Wolf',
      role: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: adminPass,
      credits: 12450,
    },
    create: {
      id: '5312nslecjum8si',
      email: 'wlfjck@gmail.com',
      name: 'Jack Wolf',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: now,
      passwordHash: adminPass,
      credits: 12450,
      customInstructions:
        'Always open presentations with an executive summary card, use concise bullet points, and highlight YoY metrics in bold.',
    },
  });

  await prisma.passwordCredential.upsert({
    where: { userId: jack.id },
    update: { passwordHash: adminPass },
    create: { userId: jack.id, passwordHash: adminPass },
  });

  const elena = await prisma.user.upsert({
    where: { email: 'elena@genesisiq.ai' },
    update: { name: 'Elena Rostova', role: 'EDITOR', status: 'ACTIVE' },
    create: {
      id: 'u_elena_rostova',
      email: 'elena@genesisiq.ai',
      name: 'Elena Rostova',
      role: 'EDITOR',
      status: 'ACTIVE',
      emailVerified: now,
      passwordHash: memberPass,
    },
  });

  const marcus = await prisma.user.upsert({
    where: { email: 'marcus@genesisiq.ai' },
    update: { name: 'Marcus Vance', role: 'EDITOR', status: 'ACTIVE' },
    create: {
      id: 'u_marcus_vance',
      email: 'marcus@genesisiq.ai',
      name: 'Marcus Vance',
      role: 'EDITOR',
      status: 'ACTIVE',
      emailVerified: now,
      passwordHash: memberPass,
    },
  });

  const devon = await prisma.user.upsert({
    where: { email: 'devon@partner.co' },
    update: { name: 'Devon Park', role: 'VIEWER', status: 'ACTIVE' },
    create: {
      id: 'u_devon_park',
      email: 'devon@partner.co',
      name: 'Devon Park',
      role: 'VIEWER',
      status: 'ACTIVE',
      emailVerified: now,
      passwordHash: memberPass,
    },
  });

  // 2. Workspace
  const ws = await prisma.workspace.upsert({
    where: { slug: 'jack-wolf-workspace' },
    update: {
      name: "Jack Wolf's Workspace",
      credits: 12450,
      planTier: 'ENTERPRISE',
    },
    create: {
      id: 'ws_5312nslecjum8si',
      name: "Jack Wolf's Workspace",
      slug: 'jack-wolf-workspace',
      defaultThemeId: 'theme_prism',
      defaultIconLibraryId: 'iconlib_genesis',
      workspacePermission: 'edit',
      accessLinkPermission: 'view',
      requireSso: false,
      ssoDomain: 'genesisiq.ai',
      ssoProvider: 'Okta SAML 2.0',
      credits: 12450,
      planTier: 'ENTERPRISE',
    },
  });

  // Memberships
  for (const m of [
    { userId: jack.id, role: 'ADMIN', isGuest: false, groupName: 'Executive Leadership' },
    { userId: elena.id, role: 'EDITOR', isGuest: false, groupName: 'Product & Design' },
    { userId: marcus.id, role: 'EDITOR', isGuest: false, groupName: 'Go-To-Market' },
    { userId: devon.id, role: 'VIEWER', isGuest: true, groupName: 'External Partners' },
  ]) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: ws.id, userId: m.userId } },
      update: { role: m.role, isGuest: m.isGuest, groupName: m.groupName },
      create: {
        workspaceId: ws.id,
        userId: m.userId,
        role: m.role,
        isGuest: m.isGuest,
        groupName: m.groupName,
      },
    });
  }

  // Workspace Groups
  await prisma.workspaceGroup.deleteMany({ where: { workspaceId: ws.id } });
  await prisma.workspaceGroup.createMany({
    data: [
      {
        id: 'grp_exec',
        workspaceId: ws.id,
        name: 'Executive Leadership',
        slug: 'executive-leadership',
        description: 'Full manage & publish permissions on strategic decks and board reports',
        memberCount: 3,
        permission: 'manage',
      },
      {
        id: 'grp_product',
        workspaceId: ws.id,
        name: 'Product & Design',
        slug: 'product-design',
        description: 'Can edit product roadmaps, design systems, custom themes, and icon libraries',
        memberCount: 5,
        permission: 'edit',
      },
      {
        id: 'grp_gtm',
        workspaceId: ws.id,
        name: 'Go-To-Market & Sales',
        slug: 'go-to-market',
        description: 'Can create customer decks from templates and publish sites',
        memberCount: 6,
        permission: 'edit',
      },
    ],
  });

  // 3. Themes
  const themesData = [
    {
      id: 'theme_prism',
      name: 'Prism',
      slug: 'prism',
      category: 'STANDARD',
      isDefault: true,
      primaryColor: '#4f46e5',
      secondaryColor: '#7c3aed',
      accentColor: '#06b6d4',
      backgroundColor: '#0f172a',
      surfaceColor: '#1e293b',
      textColor: '#f8fafc',
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      gradientCss: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    },
    {
      id: 'theme_stratos',
      name: 'Stratos',
      slug: 'stratos',
      category: 'STANDARD',
      isDefault: false,
      primaryColor: '#2563eb',
      secondaryColor: '#0ea5e9',
      accentColor: '#38bdf8',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      textColor: '#0f172a',
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      gradientCss: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0f2fe 100%)',
    },
    {
      id: 'theme_aurora',
      name: 'Aurora',
      slug: 'aurora',
      category: 'STANDARD',
      isDefault: false,
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#34d399',
      backgroundColor: '#064e3b',
      surfaceColor: '#065f46',
      textColor: '#ecfdf5',
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
      gradientCss: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)',
    },
    {
      id: 'theme_obsidian',
      name: 'Obsidian',
      slug: 'obsidian',
      category: 'STANDARD',
      isDefault: false,
      primaryColor: '#a855f7',
      secondaryColor: '#ec4899',
      accentColor: '#f43f5e',
      backgroundColor: '#09090b',
      surfaceColor: '#18181b',
      textColor: '#fafafa',
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
      gradientCss: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
    },
    {
      id: 'theme_founder',
      name: 'Founder',
      slug: 'founder',
      category: 'CUSTOM',
      isDefault: false,
      primaryColor: '#ea580c',
      secondaryColor: '#d97706',
      accentColor: '#f59e0b',
      backgroundColor: '#fffbeb',
      surfaceColor: '#ffffff',
      textColor: '#1c1917',
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      gradientCss: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
    },
    {
      id: 'theme_genesisiq',
      name: 'GenesisIQ Brand Pro',
      slug: 'genesisiq-brand-pro',
      category: 'CUSTOM',
      isDefault: false,
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#22d3ee',
      backgroundColor: '#0b0f19',
      surfaceColor: '#111827',
      textColor: '#f9fafb',
      headingFont: 'Genesis Sans',
      bodyFont: 'Inter',
      gradientCss: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 60%, #0e7490 100%)',
    },
    {
      id: 'theme_archived_slate',
      name: 'Legacy Slate 2024',
      slug: 'legacy-slate-2024',
      category: 'ARCHIVED',
      isDefault: false,
      primaryColor: '#475569',
      secondaryColor: '#64748b',
      accentColor: '#94a3b8',
      backgroundColor: '#f1f5f9',
      surfaceColor: '#ffffff',
      textColor: '#0f172a',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      gradientCss: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    },
  ];

  for (const t of themesData) {
    await prisma.theme.upsert({
      where: { slug: t.slug },
      update: { ...t, workspaceId: ws.id },
      create: { ...t, workspaceId: ws.id },
    });
  }

  // 4. Custom Fonts & Icon Libraries
  await prisma.customFont.deleteMany({ where: { workspaceId: ws.id } });
  await prisma.customFont.createMany({
    data: [
      {
        id: 'font_genesis_sans',
        workspaceId: ws.id,
        familyName: 'Genesis Sans',
        weightsJson: JSON.stringify(['400 Regular', '500 Medium', '600 SemiBold', '700 Bold']),
        format: 'WOFF2',
        fileSizeKb: 164,
        uploadedBy: 'Jack Wolf',
        licenseVerified: true,
      },
      {
        id: 'font_calibre_ent',
        workspaceId: ws.id,
        familyName: 'Calibre Enterprise',
        weightsJson: JSON.stringify(['400 Regular', '700 Bold']),
        format: 'WOFF2',
        fileSizeKb: 112,
        uploadedBy: 'Elena Rostova',
        licenseVerified: true,
      },
    ],
  });

  const iconLibs = [
    {
      id: 'iconlib_genesis',
      workspaceId: ws.id,
      name: 'GenesisIQ Brand Duotone',
      slug: 'genesisiq-brand-duotone',
      style: 'Duotone Indigo & Cyan',
      iconCount: 64,
      isDefault: true,
      iconsJson: JSON.stringify(['sparkles', 'rocket', 'cpu', 'layers', 'shield', 'globe', 'zap', 'chart']),
    },
    {
      id: 'iconlib_phosphor',
      workspaceId: ws.id,
      name: 'Phosphor Enterprise Bold',
      slug: 'phosphor-enterprise-bold',
      style: 'Solid Geometric',
      iconCount: 120,
      isDefault: false,
      iconsJson: JSON.stringify(['target', 'compass', 'award', 'briefcase', 'database', 'lock', 'terminal', 'users']),
    },
  ];
  for (const lib of iconLibs) {
    await prisma.iconLibrary.upsert({
      where: { slug: lib.slug },
      update: lib,
      create: lib,
    });
  }

  // 5. Folders (including Pinned, Recent, and Unowned folder)
  const foldersData = [
    {
      id: 'folder_q4_strategy',
      workspaceId: ws.id,
      name: 'Q4 Strategic Planning',
      slug: 'q4-strategic-planning',
      description: 'Board decks, OKR reviews, and 2026 enterprise product roadmaps',
      color: '#4f46e5',
      isPinned: true,
      ownerId: jack.id,
      accessLevel: 'workspace',
    },
    {
      id: 'folder_eng_arch',
      workspaceId: ws.id,
      name: 'Engineering & Strategy',
      slug: 'engineering-and-strategy',
      description: 'AI Agent architecture, Yjs CRDT benchmarks, and system specs',
      color: '#06b6d4',
      isPinned: true,
      ownerId: jack.id,
      accessLevel: 'workspace',
    },
    {
      id: 'folder_brand_design',
      workspaceId: ws.id,
      name: 'Brand & Design System',
      slug: 'brand-and-design-system',
      description: 'Custom themes, Smart Layout guidelines, and marketing assets',
      color: '#ec4899',
      isPinned: false,
      ownerId: elena.id,
      accessLevel: 'workspace',
    },
    {
      id: 'folder_unowned_legacy',
      workspaceId: ws.id,
      name: 'Orphaned 2025 Research Archive',
      slug: 'orphaned-2025-research-archive',
      description: 'Folder previously owned by a deactivated contractor account',
      color: '#f59e0b',
      isPinned: false,
      ownerId: null,
      accessLevel: 'restricted',
    },
  ];

  for (const f of foldersData) {
    await prisma.folder.upsert({
      where: { slug: f.slug },
      update: f,
      create: f,
    });
  }

  // 6. Flagship Doc: amqq3hoavnc5sek ("Your Roadmap to Success") + Additional Workspace Docs
  const roadmapDoc = await prisma.doc.upsert({
    where: { id: 'amqq3hoavnc5sek' },
    update: {
      title: 'Your Roadmap to Success',
      folderId: 'folder_eng_arch',
      ownerId: jack.id,
      themeId: 'theme_prism',
      isFavorite: true,
      trashedAt: null,
    },
    create: {
      id: 'amqq3hoavnc5sek',
      workspaceId: ws.id,
      folderId: 'folder_eng_arch',
      ownerId: jack.id,
      title: 'Your Roadmap to Success',
      slug: 'your-roadmap-to-success',
      format: 'PRESENTATION',
      themeId: 'theme_prism',
      status: 'PUBLISHED',
      isFavorite: true,
      viewCount: 342,
      speakerNotes: 'Executive walkthrough of our 3-phase strategic roadmap and Q1–Q4 velocity benchmarks.',
    },
  });

  await prisma.card.deleteMany({ where: { docId: roadmapDoc.id } });
  await prisma.card.createMany({
    data: [
      {
        id: 'card_roadmap_1',
        docId: roadmapDoc.id,
        orderIndex: 0,
        title: 'Your Roadmap to Success',
        subtitle: 'Strategic Execution Framework, AI Velocity & 2026 Enterprise Milestones',
        layoutType: 'HERO',
        accentPosition: 'right',
        accentImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        contentAlignment: 'center',
        speakerNotes: 'Welcome the executive board. Emphasize our transition to agentic workflows and 3.8x delivery velocity.',
        blocksJson: JSON.stringify([
          {
            id: 'b_1_1',
            type: 'callout',
            icon: 'sparkles',
            title: 'Executive Summary',
            text: 'Unifying multi-modal AI creation, fluid Smart Layouts, and real-time Yjs collaboration across 14,000+ enterprise seats.',
          },
          {
            id: 'b_1_2',
            type: 'badges',
            items: ['Q3–Q4 2026 Target', '99.98% SLA', 'SOC2 Type II + SAML SSO', 'Gamma 5 Agent Engine'],
          },
        ]),
      },
      {
        id: 'card_roadmap_2',
        docId: roadmapDoc.id,
        orderIndex: 1,
        title: 'Three Pillars of Architectural Scale',
        subtitle: 'Combining Smart Layout Boxes with Real-Time Quarterly Velocity Telemetry',
        layoutType: 'CHART_SPLIT',
        accentPosition: 'none',
        contentAlignment: 'center',
        speakerNotes: 'Walk through the 3-column Smart Layout (Foundation, Acceleration, Scale) alongside the Q1-Q4 Area Chart.',
        smartLayoutConfigJson: JSON.stringify({
          variant: 'boxes',
          columns: 3,
          cellStyle: 'tinted',
          marker: 'numbered',
          spacing: 'medium',
        }),
        chartConfigJson: JSON.stringify({
          chartType: 'area',
          colorScheme: 'gradient',
          title: 'Quarterly Execution Velocity',
          rows: [
            { label: 'Q1 2026', value: 42, target: 40 },
            { label: 'Q2 2026', value: 68, target: 60 },
            { label: 'Q3 2026', value: 94, target: 85 },
            { label: 'Q4 2026', value: 128, target: 110 },
          ],
        }),
        blocksJson: JSON.stringify([
          {
            id: 'b_2_1',
            type: 'smart_boxes',
            items: [
              {
                step: '01',
                title: 'Phase 1: Foundation',
                text: 'Zero-trust invite-only admission, SAML 2.0 SSO, and dual SQLite/PostgreSQL persistence.',
              },
              {
                step: '02',
                title: 'Phase 2: Acceleration',
                text: 'Gamma 5 Conversational Agent with Express, Standard, and Research citation synthesis.',
              },
              {
                step: '03',
                title: 'Phase 3: Global Scale',
                text: 'One-click Gamma Sites custom domain publishing, REST/MCP APIs, and live telemetry.',
              },
            ],
          },
        ]),
      },
      {
        id: 'card_roadmap_3',
        docId: roadmapDoc.id,
        orderIndex: 2,
        title: '2026 Product Delivery Timeline',
        subtitle: 'Milestone Sequence Across Core Platform, AI Studio, and Enterprise Governance',
        layoutType: 'TIMELINE',
        accentPosition: 'top',
        contentAlignment: 'center',
        speakerNotes: 'Highlight our on-schedule delivery of Custom Fonts, Icon Libraries, and MCP Connectors in Q3.',
        smartLayoutConfigJson: JSON.stringify({
          variant: 'timeline',
          columns: 4,
          cellStyle: 'bordered',
          marker: 'numbered',
          spacing: 'medium',
        }),
        blocksJson: JSON.stringify([
          {
            id: 'b_3_1',
            type: 'timeline',
            items: [
              {
                step: 'Q1',
                title: 'Fluid Card Engine',
                text: 'Responsive CSS Grid cards, Slash (/) command palette, and live Theme switcher.',
              },
              {
                step: 'Q2',
                title: 'Gamma 5 Agent & Studio',
                text: 'Split-pane AI editing copilot, 2-step Outline generator, and Flux 1.1 image studio.',
              },
              {
                step: 'Q3',
                title: 'Enterprise Governance',
                text: 'Audit logs, Public Links registry, Ownerless file recovery, and Groups & Guests.',
              },
              {
                step: 'Q4',
                title: 'Ecosystem & MCP API',
                text: 'Programmatic Template API generation and bi-directional Google Drive / Notion sync.',
              },
            ],
          },
        ]),
      },
      {
        id: 'card_roadmap_4',
        docId: roadmapDoc.id,
        orderIndex: 3,
        title: 'Key Performance Indicators & ROI Impact',
        subtitle: 'Quantifiable Enterprise Productivity Gains Verified Across 48 Teams',
        layoutType: 'STATS_GRID',
        accentPosition: 'none',
        contentAlignment: 'center',
        speakerNotes: 'Close with our 3.8x deck creation velocity and 94% executive stakeholder alignment score.',
        blocksJson: JSON.stringify([
          {
            id: 'b_4_1',
            type: 'stats',
            items: [
              { value: '3.8x', label: 'Faster Deck Authoring', delta: '+280% vs traditional slides' },
              { value: '94%', label: 'Completion Rate', delta: '+19% viewer engagement' },
              { value: '12.4k', label: 'Active AI Credits Pool', delta: 'Enterprise Ultra tier' },
              { value: '< 40ms', label: 'Yjs Sync Latency', delta: 'Global edge WebSockets' },
            ],
          },
          {
            id: 'b_4_2',
            type: 'callout',
            icon: 'shield',
            title: 'Next Steps & Board Approval',
            text: 'Approve Q4 expansion of automated API deck generation across all customer-facing GTM teams.',
          },
        ]),
      },
    ],
  });

  // Snapshots & Comments on Roadmap Doc
  await prisma.docSnapshot.deleteMany({ where: { docId: roadmapDoc.id } });
  await prisma.docSnapshot.createMany({
    data: [
      {
        id: 'snap_v14',
        docId: roadmapDoc.id,
        versionNumber: 14,
        label: 'Current Version (v14)',
        authorName: 'Jack Wolf',
        summary: 'Updated Card 2 Smart Layout & Q3 KPI velocity metrics',
      },
      {
        id: 'snap_v13',
        docId: roadmapDoc.id,
        versionNumber: 13,
        label: 'Snapshot v13 — Published Site',
        authorName: 'Elena Rostova',
        summary: 'Applied Prism theme & added executive summary callout',
      },
      {
        id: 'snap_v12',
        docId: roadmapDoc.id,
        versionNumber: 12,
        label: 'Snapshot v12 — AI Agent Draft',
        authorName: 'Gamma Agent',
        summary: 'Generated initial 4 cards from Q4 strategic outline',
      },
    ],
  });

  await prisma.docComment.deleteMany({ where: { docId: roadmapDoc.id } });
  await prisma.docComment.createMany({
    data: [
      {
        id: 'cmt_1',
        docId: roadmapDoc.id,
        cardId: 'card_roadmap_2',
        authorName: 'Elena Rostova',
        authorEmail: 'elena@genesisiq.ai',
        content: "Let's highlight the 3.8x enterprise velocity improvement right above the Q3 chart! @Jack Wolf",
        reactionsJson: JSON.stringify({ '🔥': 2, '👍': 1 }),
        resolved: false,
      },
      {
        id: 'cmt_2',
        docId: roadmapDoc.id,
        cardId: 'card_roadmap_4',
        authorName: 'Marcus Vance',
        authorEmail: 'marcus@genesisiq.ai',
        content: 'Customer GTM metrics verified with RevOps — ready for Friday board presentation.',
        reactionsJson: JSON.stringify({ '🚀': 3 }),
        resolved: false,
      },
    ],
  });

  // Additional Docs for All Views (Folders, Shared with You, API Generated, Ownerless, Trash)
  const extraDocs = [
    {
      id: 'doc_q4_ai_strategy',
      workspaceId: ws.id,
      folderId: 'folder_q4_strategy',
      ownerId: jack.id,
      title: 'GenesisIQ 2026 Enterprise AI Platform Strategy',
      slug: 'genesisiq-2026-ai-strategy',
      format: 'PRESENTATION',
      themeId: 'theme_genesisiq',
      status: 'PUBLISHED',
      isFavorite: true,
      isApiGenerated: false,
      isSharedWithMe: false,
      viewCount: 218,
    },
    {
      id: 'doc_webpage_launch',
      workspaceId: ws.id,
      folderId: 'folder_brand_design',
      ownerId: elena.id,
      title: 'Gamma 5 Agentic Design System Microsite',
      slug: 'gamma-5-design-system-microsite',
      format: 'WEBPAGE',
      themeId: 'theme_stratos',
      status: 'PUBLISHED',
      isFavorite: false,
      isApiGenerated: false,
      isSharedWithMe: false,
      viewCount: 512,
    },
    {
      id: 'doc_api_weekly_kpi',
      workspaceId: ws.id,
      folderId: 'folder_q4_strategy',
      ownerId: jack.id,
      title: 'Automated Weekly Revenue & GTM Executive Brief (API)',
      slug: 'automated-weekly-revenue-brief',
      format: 'DOCUMENT',
      themeId: 'theme_aurora',
      status: 'PUBLISHED',
      isFavorite: false,
      isApiGenerated: true,
      isSharedWithMe: false,
      viewCount: 89,
    },
    {
      id: 'doc_shared_board',
      workspaceId: ws.id,
      folderId: null,
      ownerId: elena.id,
      title: 'Series C Board Deck — Partner Preview',
      slug: 'series-c-board-deck-partner-preview',
      format: 'PRESENTATION',
      themeId: 'theme_obsidian',
      status: 'PUBLISHED',
      isFavorite: true,
      isApiGenerated: false,
      isSharedWithMe: true,
      viewCount: 164,
    },
    {
      id: 'doc_ownerless_spec',
      workspaceId: ws.id,
      folderId: 'folder_unowned_legacy',
      ownerId: null,
      title: 'Q2 Legacy Cloud Migration Architecture Spec',
      slug: 'q2-legacy-cloud-migration-spec',
      format: 'DOCUMENT',
      themeId: 'theme_prism',
      status: 'DRAFT',
      isFavorite: false,
      isApiGenerated: false,
      isSharedWithMe: false,
      viewCount: 31,
    },
    {
      id: 'doc_trashed_draft',
      workspaceId: ws.id,
      folderId: null,
      ownerId: jack.id,
      title: 'Deprecated Q1 Pitch Exploration Draft',
      slug: 'deprecated-q1-pitch-draft',
      format: 'PRESENTATION',
      themeId: 'theme_founder',
      status: 'ARCHIVED',
      isFavorite: false,
      isApiGenerated: false,
      isSharedWithMe: false,
      trashedAt: now,
      viewCount: 7,
    },
  ];

  for (const d of extraDocs) {
    await prisma.doc.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    });

    const cardCount = await prisma.card.count({ where: { docId: d.id } });
    if (cardCount === 0) {
      await prisma.card.createMany({
        data: [
          {
            id: `${d.id}_c1`,
            docId: d.id,
            orderIndex: 0,
            title: d.title,
            subtitle: 'Executive Overview & Strategic Objectives',
            layoutType: 'HERO',
            blocksJson: JSON.stringify([
              {
                id: 'b1',
                type: 'callout',
                icon: 'sparkles',
                title: 'Key Takeaway',
                text: `Structured fluid card deck for ${d.title}. Built with Gamma 5 Smart Layouts.`,
              },
            ]),
          },
          {
            id: `${d.id}_c2`,
            docId: d.id,
            orderIndex: 1,
            title: 'Core Architecture & Execution Pillars',
            subtitle: 'Multi-Column Smart Layout Breakdown',
            layoutType: 'SMART_BOXES',
            blocksJson: JSON.stringify([
              {
                id: 'b2',
                type: 'smart_boxes',
                items: [
                  { step: '01', title: 'Strategy', text: 'Align cross-functional OKRs with measurable quarterly milestones.' },
                  { step: '02', title: 'Execution', text: 'Automate synthesis with Gamma 5 Agent and live data charts.' },
                  { step: '03', title: 'Governance', text: 'Enforce invite-only admission, SAML SSO, and audit trails.' },
                ],
              },
            ]),
          },
        ],
      });
    }
  }

  // 7. Templates across all 12 categories + Archived Template
  const templatesData = [
    {
      id: 'tpl_exec_roadmap',
      workspaceId: ws.id,
      title: 'Executive Product Roadmap & OKRs',
      slug: 'executive-product-roadmap',
      category: 'Strategy',
      description: 'Quarterly strategic roadmap with 3-column Smart Layouts, timeline, and KPI velocity charts.',
      format: 'PRESENTATION',
      themeId: 'theme_prism',
      cardCount: 8,
      isWorkspaceTemplate: true,
      isArchived: false,
      thumbnailGradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #06b6d4 100%)',
      usageCount: 420,
    },
    {
      id: 'tpl_series_b_pitch',
      workspaceId: ws.id,
      title: 'Venture Capital Series B Pitch Deck',
      slug: 'venture-capital-series-b-pitch',
      category: 'Fundraising',
      description: 'Investor-ready storytelling framework covering problem, moat, traction, unit economics, and ask.',
      format: 'PRESENTATION',
      themeId: 'theme_obsidian',
      cardCount: 10,
      isWorkspaceTemplate: true,
      isArchived: false,
      thumbnailGradient: 'linear-gradient(135deg, #581c87 0%, #9333ea 50%, #ec4899 100%)',
      usageCount: 385,
    },
    {
      id: 'tpl_enterprise_sales',
      workspaceId: ws.id,
      title: 'Enterprise Solution Architecture Proposal',
      slug: 'enterprise-solution-architecture-proposal',
      category: 'Sales',
      description: 'Consultative enterprise discovery, ROI calculator, security compliance, and deployment timeline.',
      format: 'PRESENTATION',
      themeId: 'theme_stratos',
      cardCount: 7,
      isWorkspaceTemplate: false,
      isArchived: false,
      thumbnailGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #38bdf8 100%)',
      usageCount: 290,
    },
    {
      id: 'tpl_gtm_launch',
      workspaceId: ws.id,
      title: 'Global Product Launch & Campaign Microsite',
      slug: 'global-product-launch-microsite',
      category: 'Marketing',
      description: 'Responsive webpage template with hero video, feature grid, customer quotes, and CTA.',
      format: 'WEBPAGE',
      themeId: 'theme_aurora',
      cardCount: 6,
      isWorkspaceTemplate: false,
      isArchived: false,
      thumbnailGradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
      usageCount: 310,
    },
    {
      id: 'tpl_company_allhands',
      workspaceId: ws.id,
      title: 'Company All-Hands & Quarterly Townhall',
      slug: 'company-all-hands-townhall',
      category: 'Company',
      description: 'Celebrate wins, review departmental metrics, and align the organization around top priorities.',
      format: 'PRESENTATION',
      themeId: 'theme_genesisiq',
      cardCount: 9,
      isWorkspaceTemplate: true,
      isArchived: false,
      thumbnailGradient: 'linear-gradient(135deg, #0f172a 0%, #4338ca 50%, #0891b2 100%)',
      usageCount: 512,
    },
    {
      id: 'tpl_qbr_reporting',
      workspaceId: ws.id,
      title: 'Quarterly Business Review (QBR) Telemetry',
      slug: 'quarterly-business-review-telemetry',
      category: 'Reporting',
      description: 'Data-dense executive reporting deck with multi-series charts, cohort tables, and variance callouts.',
      format: 'PRESENTATION',
      themeId: 'theme_prism',
      cardCount: 8,
      isWorkspaceTemplate: false,
      isArchived: false,
      thumbnailGradient: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #10b981 100%)',
      usageCount: 275,
    },
    {
      id: 'tpl_archived_2024',
      workspaceId: ws.id,
      title: '2024 Legacy Brand Guidelines Deck (Archived)',
      slug: '2024-legacy-brand-guidelines',
      category: 'Creative',
      description: 'Deprecated 2024 brand template retained for historical reference.',
      format: 'PRESENTATION',
      themeId: 'theme_archived_slate',
      cardCount: 5,
      isWorkspaceTemplate: true,
      isArchived: true,
      thumbnailGradient: 'linear-gradient(135deg, #334155 0%, #64748b 100%)',
      usageCount: 44,
    },
  ];

  for (const tpl of templatesData) {
    await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: tpl,
      create: tpl,
    });
  }

  // 8. AI Images & Saved Media Library
  await prisma.aiImage.deleteMany({ where: { workspaceId: ws.id } });
  await prisma.aiImage.createMany({
    data: [
      {
        id: 'img_neural_mesh',
        workspaceId: ws.id,
        prompt: 'Isometric 3D glassmorphic cloud neural architecture with glowing cyan data pipelines',
        model: 'Flux Fast 1.1',
        style: '3D Glassmorphism',
        aspectRatio: '16:9',
        source: 'AI_GENERATED',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        creatorName: 'Jack Wolf',
        creditsCost: 10,
      },
      {
        id: 'img_quantum_core',
        workspaceId: ws.id,
        prompt: 'Futuristic editorial studio portrait of autonomous AI agents collaborating over holographic cards',
        model: 'Imagen 3 Pro',
        style: 'Editorial Futurism',
        aspectRatio: '16:9',
        source: 'AI_GENERATED',
        imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
        creatorName: 'Elena Rostova',
        creditsCost: 15,
      },
      {
        id: 'img_velocity_grid',
        workspaceId: ws.id,
        prompt: 'Minimalist architectural concrete atrium with warm golden sunlight and emerald foliage',
        model: 'Flux Fast 1.1',
        style: 'Architectural Photo',
        aspectRatio: '4:3',
        source: 'UPLOADED',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
        creatorName: 'Jack Wolf',
        creditsCost: 0,
      },
      {
        id: 'img_vector_diagram',
        workspaceId: ws.id,
        prompt: 'Isometric Vector Cloud Topology & Zero-Trust Gateway Diagram',
        model: 'Gamma Vector SVG Studio',
        style: 'Vector Illustration',
        aspectRatio: '16:9',
        source: 'VECTOR_GRAPHIC',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        creatorName: 'Elena Rostova',
        creditsCost: 5,
      },
    ],
  });

  // 9. Published Sites
  const sitesData = [
    {
      id: 'site_roadmap',
      workspaceId: ws.id,
      docId: roadmapDoc.id,
      name: 'GenesisIQ 2026 Strategic Roadmap Portal',
      subdomain: 'genesisiq-roadmap',
      customDomain: 'roadmap.genesisiq.ai',
      status: 'ACTIVE',
      seoTitle: 'Your Roadmap to Success — GenesisIQ 2026',
      seoDescription: 'Interactive strategic roadmap powered by Gamma Sites.',
    },
    {
      id: 'site_design_system',
      workspaceId: ws.id,
      docId: 'doc_webpage_launch',
      name: 'Gamma 5 Design System Microsite',
      subdomain: 'gamma5-design-system',
      customDomain: 'design.genesisiq.ai',
      status: 'ACTIVE',
      seoTitle: 'Gamma 5 Agentic Design System',
      seoDescription: 'Smart Layouts, Themes, and Brand Tokens.',
    },
  ];
  for (const s of sitesData) {
    await prisma.site.upsert({
      where: { subdomain: s.subdomain },
      update: s,
      create: s,
    });
  }

  // 10. API Keys & MCP Connectors
  await prisma.apiKey.deleteMany({ where: { workspaceId: ws.id } });
  await prisma.apiKey.createMany({
    data: [
      {
        id: 'key_prod_cicd',
        workspaceId: ws.id,
        name: 'Production CI/CD Executive Brief Generator',
        keyPrefix: 'sk-gamma-live-9f8a...3d1c',
        keyHash: hashOpaqueToken('sk-gamma-live-9f8a7b6c5d4e3d1c'),
        scopes: 'docs:read,docs:write,generate:run,templates:use',
        lastUsedAt: now,
      },
      {
        id: 'key_hubspot_webhook',
        workspaceId: ws.id,
        name: 'HubSpot Enterprise Deal Deck Webhook',
        keyPrefix: 'sk-gamma-live-4c2e...8a9b',
        keyHash: hashOpaqueToken('sk-gamma-live-4c2e1f9a0b3c8a9b'),
        scopes: 'generate:run,templates:use',
        lastUsedAt: now,
      },
    ],
  });

  await prisma.mcpConnector.deleteMany({ where: { workspaceId: ws.id } });
  await prisma.mcpConnector.createMany({
    data: [
      {
        id: 'conn_gdrive',
        workspaceId: ws.id,
        name: 'Google Drive & Docs',
        provider: 'google_drive',
        category: 'first_party',
        status: 'connected',
        description: 'Import Google Docs, Slides, and Sheets directly into Gamma Agent context.',
        icon: 'hard-drive',
      },
      {
        id: 'conn_notion',
        workspaceId: ws.id,
        name: 'Notion Workspace',
        provider: 'notion',
        category: 'first_party',
        status: 'connected',
        description: 'Sync Notion wiki pages and product PRDs into multi-card presentations.',
        icon: 'file-text',
      },
      {
        id: 'conn_slack',
        workspaceId: ws.id,
        name: 'Slack Channels',
        provider: 'slack',
        category: 'first_party',
        status: 'connected',
        description: 'Unfurl Gamma deck previews and receive real-time comment notifications.',
        icon: 'message-square',
      },
      {
        id: 'conn_linear',
        workspaceId: ws.id,
        name: 'Linear Engineering Roadmaps',
        provider: 'linear',
        category: 'first_party',
        status: 'available',
        description: 'Pull live engineering cycles and project milestones into Timeline Smart Layouts.',
        icon: 'git-branch',
      },
      {
        id: 'conn_mcp_genesisiq',
        workspaceId: ws.id,
        name: 'GenesisIQ Enterprise Knowledge Graph MCP',
        provider: 'custom_mcp',
        category: 'custom_mcp',
        status: 'connected',
        endpointUrl: 'https://mcp.internal.genesisiq.ai/sse',
        description: 'Custom Model Context Protocol server providing verified internal metrics to Research mode.',
        icon: 'cpu',
      },
    ],
  });

  // 11. Gamma 5 Agent Chats History
  await prisma.agentChat.deleteMany({ where: { workspaceId: ws.id } });
  await prisma.agentChat.createMany({
    data: [
      {
        id: 'chat_q4_board',
        workspaceId: ws.id,
        docId: roadmapDoc.id,
        userId: jack.id,
        title: 'Synthesize Q4 Strategic Roadmap with 3-Column Architecture & Velocity Chart',
        mode: 'RESEARCH',
        creditsUsed: 40,
        messagesJson: JSON.stringify([
          {
            role: 'user',
            text: 'Build a 4-card executive roadmap presentation comparing Foundation, Acceleration, and Global Scale with Q1-Q4 velocity metrics.',
          },
          {
            role: 'assistant',
            text: 'Synthesized 4 cards using the Prism theme, added a 3-column Smart Layout on Card 2 paired with an interactive Area Chart, and generated speaker notes.',
          },
        ]),
      },
      {
        id: 'chat_series_c',
        workspaceId: ws.id,
        docId: 'doc_shared_board',
        userId: elena.id,
        title: 'Refine Series C Board Deck Unit Economics & Cohort Retention Table',
        mode: 'STANDARD',
        creditsUsed: 15,
        messagesJson: JSON.stringify([
          {
            role: 'user',
            text: 'Tighten the unit economics narrative for enterprise investors and convert bullet list to KPI stat boxes.',
          },
          {
            role: 'assistant',
            text: 'Converted Card 3 into a 4-metric KPI Stat Grid highlighting 138% NRR and 3.8x authoring velocity.',
          },
        ]),
      },
    ],
  });

  // 12. Invitations & Audit Logs
  await prisma.accountInvitation.deleteMany({
    where: {
      normalizedEmail: {
        in: ['alex.chen@genesisiq.ai', 'revoked.candidate@genesisiq.ai'],
      },
      NOT: { code: 'GAMMA-EXEC-2026' },
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['alex.chen@genesisiq.ai', 'revoked.candidate@genesisiq.ai'],
      },
    },
  });

  await prisma.accountInvitation.upsert({
    where: { code: 'GAMMA-EXEC-2026' },
    update: {
      email: 'alex.chen@genesisiq.ai',
      normalizedEmail: 'alex.chen@genesisiq.ai',
      activeForEmail: 'alex.chen@genesisiq.ai',
      role: 'EDITOR',
      status: 'PENDING',
      acceptedAt: null,
      acceptedById: null,
      revokedAt: null,
      expiresAt: nextWeek,
    },
    create: {
      id: 'inv_exec_2026',
      code: 'GAMMA-EXEC-2026',
      email: 'alex.chen@genesisiq.ai',
      normalizedEmail: 'alex.chen@genesisiq.ai',
      activeForEmail: 'alex.chen@genesisiq.ai',
      role: 'EDITOR',
      status: 'PENDING',
      tokenHash: hashOpaqueToken('GAMMA-EXEC-2026'),
      invitedById: jack.id,
      expiresAt: nextWeek,
    },
  });

  const auditCount = await prisma.auditLog.count();
  if (auditCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          action: 'ADMIN_BOOTSTRAPPED',
          actorId: jack.id,
          actorEmail: jack.email,
          targetType: 'User',
          targetId: jack.id,
          targetEmail: jack.email,
          metadataJson: JSON.stringify({ method: 'cli_bootstrap', role: 'ADMIN' }),
          ipAddress: '127.0.0.1',
        },
        {
          action: 'INVITATION_CREATED',
          actorId: jack.id,
          actorEmail: jack.email,
          targetType: 'AccountInvitation',
          targetId: 'inv_exec_2026',
          targetEmail: 'alex.chen@genesisiq.ai',
          metadataJson: JSON.stringify({ code: 'GAMMA-EXEC-2026', role: 'EDITOR' }),
          ipAddress: '10.24.0.12',
        },
        {
          action: 'DOC_PUBLISHED',
          actorId: jack.id,
          actorEmail: jack.email,
          targetType: 'Doc',
          targetId: roadmapDoc.id,
          targetEmail: jack.email,
          metadataJson: JSON.stringify({ title: 'Your Roadmap to Success', customDomain: 'roadmap.genesisiq.ai' }),
          ipAddress: '10.24.0.12',
        },
        {
          action: 'API_KEY_CREATED',
          actorId: jack.id,
          actorEmail: jack.email,
          targetType: 'ApiKey',
          targetId: 'key_prod_cicd',
          targetEmail: jack.email,
          metadataJson: JSON.stringify({ keyPrefix: 'sk-gamma-live-9f8a...3d1c' }),
          ipAddress: '10.24.0.12',
        },
      ],
    });
  }

  console.log('Seed completed! Default Admin: wlfjck@gmail.com / GammaAdminPassword2026!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
