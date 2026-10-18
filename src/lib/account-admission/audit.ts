import { prisma } from '@/lib/prisma';

export async function recordAuditLog(input: {
  action: string;
  actorId?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetEmail?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        targetEmail: input.targetEmail ?? null,
        metadataJson: JSON.stringify(input.metadata ?? {}),
        ipAddress: input.ipAddress ?? '127.0.0.1',
      },
    });
  } catch {
    return null;
  }
}
