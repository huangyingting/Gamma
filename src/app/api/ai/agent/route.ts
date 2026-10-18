import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { docId, cardId, prompt, mode = 'STANDARD', action = 'rewrite' } = body;

    const creditCost = mode === 'RESEARCH' ? 40 : mode === 'EXPRESS' ? 5 : 15;

    const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: 'asc' } });
    if (ws) {
      await prisma.workspace.update({
        where: { id: ws.id },
        data: { credits: Math.max(0, ws.credits - creditCost) },
      });
    }

    if (action === 'outline') {
      const topic = prompt || 'Enterprise AI Transformation Strategy';
      return NextResponse.json({
        ok: true,
        creditsUsed: creditCost,
        outline: [
          `${topic} — Executive Vision & Market Catalyst`,
          'Core Architectural Pillars & 3-Column Smart Layout',
          'Quarterly Velocity Benchmarks & Data Telemetry',
          'Implementation Timeline & Cross-Functional Milestones',
          'Quantifiable ROI Metrics, Governance & Next Steps',
        ],
      });
    }

    if (docId && cardId) {
      const card = await prisma.card.findUnique({ where: { id: cardId } });
      if (card) {
        const lower = (prompt || '').toLowerCase();
        let nextLayout = card.layoutType;
        if (lower.includes('timeline')) nextLayout = 'TIMELINE';
        else if (lower.includes('metric') || lower.includes('kpi') || lower.includes('stat'))
          nextLayout = 'STATS_GRID';
        else if (lower.includes('chart')) nextLayout = 'CHART_SPLIT';

        const updatedCard = await prisma.card.update({
          where: { id: card.id },
          data: {
            layoutType: nextLayout,
            subtitle: `Refined by Gamma 5 Agent (${mode} Mode) • ${prompt || 'Executive polish'}`,
            speakerNotes: `${card.speakerNotes}\n• [Agent ${mode}]: Added executive takeaway for "${
              prompt || 'card enhancement'
            }".`.trim(),
          },
        });

        if (ws) {
          await prisma.agentChat.create({
            data: {
              workspaceId: ws.id,
              docId,
              title: (prompt || 'Card refinement').slice(0, 80),
              mode,
              creditsUsed: creditCost,
              messagesJson: JSON.stringify([
                { role: 'user', text: prompt },
                {
                  role: 'assistant',
                  text: `Updated "${updatedCard.title}" using ${mode} mode (${creditCost} credits). Applied ${nextLayout} layout and executive speaker notes.`,
                },
              ]),
            },
          });
        }

        return NextResponse.json({
          ok: true,
          creditsUsed: creditCost,
          reply: `Applied "${prompt}" to "${updatedCard.title}" in ${mode} mode (-${creditCost} credits).`,
          card: updatedCard,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      creditsUsed: creditCost,
      reply: `Gamma 5 Agent (${mode} mode) synthesized response for: "${prompt}".`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Agent request failed.',
      },
      { status: 500 }
    );
  }
}
