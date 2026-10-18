import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const doc = await prisma.doc.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      folder: true,
      owner: { select: { id: true, name: true, email: true } },
      cards: { orderBy: { orderIndex: 'asc' } },
      snapshots: { orderBy: { versionNumber: 'desc' } },
      comments: { orderBy: { createdAt: 'desc' } },
      sites: true,
    },
  });

  if (!doc) {
    return NextResponse.json(
      { ok: false, message: 'Document not found.' },
      { status: 404 }
    );
  }

  const themes = await prisma.theme.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    ok: true,
    doc,
    themes,
  });
}

async function fetchFullDoc(docId: string) {
  return prisma.doc.findUnique({
    where: { id: docId },
    include: {
      folder: true,
      owner: { select: { id: true, name: true, email: true } },
      cards: { orderBy: { orderIndex: 'asc' } },
      snapshots: { orderBy: { versionNumber: 'desc' } },
      comments: { orderBy: { createdAt: 'desc' } },
      sites: true,
    },
  });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const doc = await prisma.doc.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!doc) {
      return NextResponse.json({ ok: false, message: 'Document not found.' }, { status: 404 });
    }

    // 1. Add Card
    if (body.action === 'add_card') {
      const count = await prisma.card.count({ where: { docId: doc.id } });
      const card = await prisma.card.create({
        data: {
          docId: doc.id,
          orderIndex: body.orderIndex ?? count,
          title: body.title || `New Card ${count + 1}`,
          subtitle: body.subtitle || 'Strategic Deliverable & Smart Layout',
          layoutType: body.layoutType || 'SMART_BOXES',
          accentPosition: (body.accentPosition || 'none').toLowerCase(),
          blocksJson: JSON.stringify(
            body.blocks || [
              {
                id: `b_${Date.now()}`,
                type: 'smart_boxes',
                items: [
                  { step: '01', title: 'Initiative One', text: 'Key objective and measurable outcome.' },
                  { step: '02', title: 'Initiative Two', text: 'Cross-functional execution milestone.' },
                  { step: '03', title: 'Initiative Three', text: 'Long-term strategic differentiation.' },
                ],
              },
            ]
          ),
        },
      });
      const updatedDoc = await fetchFullDoc(doc.id);
      return NextResponse.json({ ok: true, card, doc: updatedDoc });
    }

    // 2. Update Card (content, styling, Smart Layout config, Chart spreadsheet config, speaker notes)
    if (body.action === 'update_card' && body.cardId) {
      const smartConfigRaw =
        body.smartLayoutConfig !== undefined
          ? typeof body.smartLayoutConfig === 'string'
            ? body.smartLayoutConfig
            : JSON.stringify(body.smartLayoutConfig)
          : body.smartLayoutConfigJson ?? body.smartLayoutJson;

      const chartConfigRaw =
        body.chartConfig !== undefined
          ? typeof body.chartConfig === 'string'
            ? body.chartConfig
            : JSON.stringify(body.chartConfig)
          : body.chartConfigJson ?? body.chartDataJson;

      const blocksRaw =
        body.blocks !== undefined
          ? typeof body.blocks === 'string'
            ? body.blocks
            : JSON.stringify(body.blocks)
          : body.blocksJson;

      const card = await prisma.card.update({
        where: { id: body.cardId },
        data: {
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
          ...(body.layoutType !== undefined ? { layoutType: body.layoutType } : {}),
          ...(body.accentPosition !== undefined
            ? { accentPosition: String(body.accentPosition).toLowerCase() }
            : {}),
          ...(body.accentImageUrl !== undefined
            ? { accentImageUrl: body.accentImageUrl }
            : body.bgImage !== undefined
              ? { accentImageUrl: body.bgImage }
              : {}),
          ...(body.backgroundColor !== undefined
            ? { backgroundColor: body.backgroundColor }
            : body.bgColor !== undefined
              ? { backgroundColor: body.bgColor }
              : {}),
          ...(body.fullBleed !== undefined ? { fullBleed: Boolean(body.fullBleed) } : {}),
          ...(body.contentAlignment !== undefined
            ? { contentAlignment: body.contentAlignment }
            : {}),
          ...(body.speakerNotes !== undefined ? { speakerNotes: body.speakerNotes } : {}),
          ...(blocksRaw !== undefined ? { blocksJson: blocksRaw } : {}),
          ...(smartConfigRaw !== undefined ? { smartLayoutConfigJson: smartConfigRaw } : {}),
          ...(chartConfigRaw !== undefined ? { chartConfigJson: chartConfigRaw } : {}),
        },
      });
      const updatedDoc = await fetchFullDoc(doc.id);
      return NextResponse.json({ ok: true, card, doc: updatedDoc });
    }

    // 3. Delete Card
    if (body.action === 'delete_card' && body.cardId) {
      await prisma.card.delete({ where: { id: body.cardId } });
      const remaining = await prisma.card.findMany({
        where: { docId: doc.id },
        orderBy: { orderIndex: 'asc' },
      });
      for (let i = 0; i < remaining.length; i++) {
        await prisma.card.update({
          where: { id: remaining[i].id },
          data: { orderIndex: i },
        });
      }
      const updatedDoc = await fetchFullDoc(doc.id);
      return NextResponse.json({ ok: true, doc: updatedDoc });
    }

    // 4. Duplicate Card
    if (body.action === 'duplicate_card' && body.cardId) {
      const src = await prisma.card.findUnique({ where: { id: body.cardId } });
      if (src) {
        const count = await prisma.card.count({ where: { docId: doc.id } });
        const copy = await prisma.card.create({
          data: {
            docId: doc.id,
            orderIndex: count,
            title: `${src.title} (Copy)`,
            subtitle: src.subtitle,
            layoutType: src.layoutType,
            accentPosition: src.accentPosition,
            accentImageUrl: src.accentImageUrl,
            backgroundColor: src.backgroundColor,
            fullBleed: src.fullBleed,
            contentAlignment: src.contentAlignment,
            speakerNotes: src.speakerNotes,
            blocksJson: src.blocksJson,
            smartLayoutConfigJson: src.smartLayoutConfigJson,
            chartConfigJson: src.chartConfigJson,
          },
        });
        const updatedDoc = await fetchFullDoc(doc.id);
        return NextResponse.json({ ok: true, card: copy, doc: updatedDoc });
      }
    }

    // 4b. Reorder Card (move up/down)
    if (body.action === 'reorder_card' && body.cardId && body.direction) {
      const cards = await prisma.card.findMany({
        where: { docId: doc.id },
        orderBy: { orderIndex: 'asc' },
      });
      const idx = cards.findIndex((c) => c.id === body.cardId);
      const targetIdx = body.direction === 'up' ? idx - 1 : idx + 1;
      if (idx >= 0 && targetIdx >= 0 && targetIdx < cards.length) {
        await prisma.card.update({
          where: { id: cards[idx].id },
          data: { orderIndex: targetIdx },
        });
        await prisma.card.update({
          where: { id: cards[targetIdx].id },
          data: { orderIndex: idx },
        });
      }
      const updatedDoc = await fetchFullDoc(doc.id);
      return NextResponse.json({ ok: true, doc: updatedDoc });
    }

    // 5. Create Version Snapshot
    if (body.action === 'create_snapshot') {
      const count = await prisma.docSnapshot.count({ where: { docId: doc.id } });
      const snap = await prisma.docSnapshot.create({
        data: {
          docId: doc.id,
          versionNumber: count + 12,
          label: body.label || `Snapshot v${count + 12} — Manual Checkpoint`,
          authorName: body.authorName || 'Jack Wolf',
          summary: body.summary || 'Saved interactive card & Smart Layout updates',
        },
      });
      const updatedDoc = await fetchFullDoc(doc.id);
      return NextResponse.json({ ok: true, snapshot: snap, doc: updatedDoc });
    }

    // 6. Add Comment
    if (body.action === 'add_comment') {
      const comment = await prisma.docComment.create({
        data: {
          docId: doc.id,
          cardId: body.cardId || null,
          authorName: body.authorName || 'Jack Wolf',
          authorEmail: body.authorEmail || 'wlfjck@gmail.com',
          content: body.content || body.body || 'Looks great!',
          reactionsJson: JSON.stringify({ '🔥': 1 }),
          resolved: false,
        },
      });
      const updatedDoc = await fetchFullDoc(doc.id);
      return NextResponse.json({ ok: true, comment, doc: updatedDoc });
    }

    // 7. Resolve or React to Comment
    if (body.action === 'resolve_comment' && body.commentId) {
      const comment = await prisma.docComment.update({
        where: { id: body.commentId },
        data: { resolved: Boolean(body.resolved ?? true) },
      });
      const updatedDoc = await fetchFullDoc(doc.id);
      return NextResponse.json({ ok: true, comment, doc: updatedDoc });
    }

    if (body.action === 'react_comment' && body.commentId && body.emoji) {
      const existing = await prisma.docComment.findUnique({
        where: { id: body.commentId },
      });
      if (existing) {
        const reactions = JSON.parse(existing.reactionsJson || '{}');
        reactions[body.emoji] = (reactions[body.emoji] || 0) + 1;
        await prisma.docComment.update({
          where: { id: body.commentId },
          data: { reactionsJson: JSON.stringify(reactions) },
        });
      }
      const updatedDoc = await fetchFullDoc(doc.id);
      return NextResponse.json({ ok: true, doc: updatedDoc });
    }

    // 8. General Document Metadata Update (title, themeId, favorite, trash, permissions, pageSetup, customCode)
    const updated = await prisma.doc.update({
      where: { id: doc.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.themeId !== undefined ? { themeId: body.themeId } : {}),
        ...(body.folderId !== undefined ? { folderId: body.folderId } : {}),
        ...(body.isFavorite !== undefined ? { isFavorite: Boolean(body.isFavorite) } : {}),
        ...(body.isTemplate !== undefined ? { isTemplate: Boolean(body.isTemplate) } : {}),
        ...(body.workspaceAccess !== undefined ? { workspaceAccess: body.workspaceAccess } : {}),
        ...(body.publicAccess !== undefined ? { publicAccess: body.publicAccess } : {}),
        ...(body.trashedAt !== undefined
          ? { trashedAt: body.trashedAt ? new Date(body.trashedAt) : null }
          : {}),
        ...(body.pageSetup !== undefined
          ? { pageSetupJson: JSON.stringify(body.pageSetup) }
          : {}),
        ...(body.customCode !== undefined
          ? { customCodeJson: JSON.stringify(body.customCode) }
          : {}),
      },
      include: {
        cards: { orderBy: { orderIndex: 'asc' } },
        snapshots: { orderBy: { versionNumber: 'desc' } },
        comments: { orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({ ok: true, doc: updated });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Failed to update document.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.doc.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
