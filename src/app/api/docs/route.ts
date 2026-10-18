import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordAuditLog } from '@/lib/account-admission';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'all';
  const folderId = searchParams.get('folderId');
  const search = (searchParams.get('q') || '').trim().toLowerCase();

  const docs = await prisma.doc.findMany({
    where: {
      ...(filter === 'trash' ? { trashedAt: { not: null } } : { trashedAt: null }),
      ...(filter === 'favorites' ? { isFavorite: true } : {}),
      ...(filter === 'shared' ? { isSharedWithMe: true } : {}),
      ...(filter === 'api' ? { isApiGenerated: true } : {}),
      ...(folderId ? { folderId } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      folder: true,
      owner: { select: { id: true, name: true, email: true } },
      cards: { orderBy: { orderIndex: 'asc' } },
    },
  });

  const filtered = search
    ? docs.filter(
        (d) =>
          d.title.toLowerCase().includes(search) ||
          (d.folder?.name || '').toLowerCase().includes(search)
      )
    : docs;

  return NextResponse.json({ ok: true, docs: filtered });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: 'asc' } });
    const owner = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });

    if (!ws) {
      return NextResponse.json({ ok: false, message: 'Workspace not initialized.' }, { status: 400 });
    }

    // Bulk Actions on Multiple Docs
    if (body.bulkAction && Array.isArray(body.docIds)) {
      const ids: string[] = body.docIds;
      if (body.bulkAction === 'trash') {
        await prisma.doc.updateMany({
          where: { id: { in: ids } },
          data: { trashedAt: new Date() },
        });
      } else if (body.bulkAction === 'restore') {
        await prisma.doc.updateMany({
          where: { id: { in: ids } },
          data: { trashedAt: null },
        });
      } else if (body.bulkAction === 'favorite') {
        await prisma.doc.updateMany({
          where: { id: { in: ids } },
          data: { isFavorite: true },
        });
      } else if (body.bulkAction === 'move' && body.folderId !== undefined) {
        await prisma.doc.updateMany({
          where: { id: { in: ids } },
          data: { folderId: body.folderId || null },
        });
      }
      return NextResponse.json({ ok: true, count: ids.length });
    }

    const title = (body.title || body.prompt || 'Untitled Gamma Presentation').slice(0, 120);
    const slug = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)}-${Date.now().toString(36)}`;

    const format = body.format || 'PRESENTATION';
    const themeId = body.themeId || ws.defaultThemeId || 'theme_prism';
    const outline: string[] = Array.isArray(body.outline) && body.outline.length > 0
      ? body.outline
      : [
          `${title} — Executive Overview`,
          'Strategic Pillars & Smart Layout Architecture',
          'Execution Timeline & Quarterly Velocity',
          'Key Performance Metrics & Next Steps',
        ];

    const doc = await prisma.doc.create({
      data: {
        workspaceId: ws.id,
        folderId: body.folderId || null,
        ownerId: owner?.id || null,
        title,
        slug,
        format,
        themeId,
        status: 'PUBLISHED',
        isApiGenerated: Boolean(body.isApiGenerated),
      },
    });

    const layouts = ['HERO', 'CHART_SPLIT', 'TIMELINE', 'STATS_GRID', 'SMART_BOXES'];
    const cardsToCreate = outline.map((cardTitle, idx) => {
      const layoutType = layouts[idx % layouts.length];
      return {
        docId: doc.id,
        orderIndex: idx,
        title: cardTitle,
        subtitle:
          idx === 0
            ? `Synthesized via Gamma 5 AI (${body.density || 'Medium'} density • ${
                body.imageModel || 'Flux Fast 1.1'
              })`
            : `Card ${idx + 1} • ${layoutType.replace('_', ' ')} Smart Layout`,
        layoutType,
        accentPosition: idx === 0 ? 'right' : 'none',
        accentImageUrl:
          idx === 0
            ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
            : null,
        speakerNotes: `Key talking points for ${cardTitle}: highlight measurable business outcomes and architectural clarity.`,
        blocksJson: JSON.stringify(
          idx === 0
            ? [
                {
                  id: `b_${idx}_1`,
                  type: 'callout',
                  icon: 'sparkles',
                  title: 'Executive Summary',
                  text:
                    body.sourceText ||
                    `AI-generated ${format.toLowerCase()} for "${title}". Edit any block inline, type "/" for slash commands, or open the Gamma Agent panel.`,
                },
                {
                  id: `b_${idx}_2`,
                  type: 'badges',
                  items: [format, `${outline.length} Cards`, 'Gamma 5 Agent', 'Live Theme'],
                },
              ]
            : idx % 3 === 1
            ? [
                {
                  id: `b_${idx}_1`,
                  type: 'smart_boxes',
                  items: [
                    {
                      step: '01',
                      title: 'Phase 1: Core Architecture',
                      text: 'Establish foundational capabilities, data pipelines, and security controls.',
                    },
                    {
                      step: '02',
                      title: 'Phase 2: Velocity & Scale',
                      text: 'Automate high-leverage workflows with multi-modal AI agents.',
                    },
                    {
                      step: '03',
                      title: 'Phase 3: Global Impact',
                      text: 'Deliver real-time analytics and custom domain publishing.',
                    },
                  ],
                },
              ]
            : idx % 3 === 2
            ? [
                {
                  id: `b_${idx}_1`,
                  type: 'timeline',
                  items: [
                    { step: 'M1', title: 'Discovery & Alignment', text: 'Finalize scope and KPIs.' },
                    { step: 'M2', title: 'Pilot Launch', text: 'Roll out across initial teams.' },
                    { step: 'M3', title: 'Enterprise Scale', text: 'Full production adoption.' },
                  ],
                },
              ]
            : [
                {
                  id: `b_${idx}_1`,
                  type: 'stats',
                  items: [
                    { value: '3.8x', label: 'Execution Speed', delta: '+280% YoY' },
                    { value: '94%', label: 'Stakeholder Alignment', delta: '+22% vs baseline' },
                    { value: '99.9%', label: 'Platform Reliability', delta: 'Enterprise SLA' },
                  ],
                },
              ]
        ),
      };
    });

    await prisma.card.createMany({ data: cardsToCreate });

    await prisma.docSnapshot.create({
      data: {
        docId: doc.id,
        versionNumber: 1,
        label: 'Snapshot v1 — Initial Generation',
        authorName: owner?.name || 'Gamma Agent',
        summary: `Created ${outline.length} cards (${format})`,
      },
    });

    await recordAuditLog({
      action: 'DOC_CREATED',
      actorId: owner?.id,
      actorEmail: owner?.email || 'wlfjck@gmail.com',
      targetType: 'Doc',
      targetId: doc.id,
      metadata: { title: doc.title, format: doc.format, cards: outline.length },
    });

    const fullDoc = await prisma.doc.findUnique({
      where: { id: doc.id },
      include: { cards: { orderBy: { orderIndex: 'asc' } } },
    });

    return NextResponse.json({ ok: true, doc: fullDoc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Failed to create document.',
      },
      { status: 500 }
    );
  }
}
