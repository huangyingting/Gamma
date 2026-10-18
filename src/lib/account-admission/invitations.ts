import { Prisma, type AccountInvitation } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AccountAdmissionError } from './errors';
import { isValidAccountEmail, normalizeAccountEmail } from './policy';
import { createShortInviteCode, hashOpaqueToken } from './tokens';
import { recordAuditLog } from './audit';

const DEFAULT_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type CreateAccountInvitationInput = {
  email: string;
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
  invitedById?: string;
  invitedByEmail?: string;
  expiresInHours?: number;
  expiresAt?: Date;
  customCode?: string;
};

export type AccountInvitationGrant = {
  invitation: AccountInvitation;
  token: string;
  code: string;
};

export type PublicInvitationView = {
  id: string;
  code: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired' | 'invalid';
  role: string;
  maskedEmail: string | null;
  email?: string;
  expiresAt: Date | null;
};

export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'*'.repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

function isUniqueConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export async function expirePendingInvitations(now = new Date()): Promise<number> {
  const result = await prisma.accountInvitation.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lte: now },
    },
    data: {
      status: 'EXPIRED',
      activeForEmail: null,
    },
  });
  return result.count;
}

export async function createAccountInvitation(
  input: CreateAccountInvitationInput
): Promise<AccountInvitationGrant> {
  const normalizedEmail = normalizeAccountEmail(input.email);
  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(
      400,
      'invalid_email',
      'Enter a valid email address.'
    );
  }

  const code = (input.customCode?.trim() || createShortInviteCode()).toUpperCase();
  const tokenHash = hashOpaqueToken(code);
  const now = new Date();
  const ttlMs = input.expiresInHours
    ? input.expiresInHours * 3600 * 1000
    : DEFAULT_INVITATION_TTL_MS;
  const expiresAt = input.expiresAt ?? new Date(now.getTime() + ttlMs);

  if (expiresAt.getTime() <= now.getTime()) {
    throw new AccountAdmissionError(
      400,
      'invalid_expiry',
      'Invitation expiry must be in the future.'
    );
  }

  try {
    await prisma.accountInvitation.updateMany({
      where: {
        activeForEmail: normalizedEmail,
        status: 'PENDING',
        expiresAt: { lte: now },
      },
      data: {
        status: 'EXPIRED',
        activeForEmail: null,
      },
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingUser) {
      throw new AccountAdmissionError(
        409,
        'already_member',
        'A Gamma account already exists for this email.'
      );
    }

    const active = await prisma.accountInvitation.findUnique({
      where: { activeForEmail: normalizedEmail },
      select: { id: true },
    });
    if (active) {
      throw new AccountAdmissionError(
        409,
        'invitation_exists',
        'An active pending invitation already exists for this email.'
      );
    }

    let inviterId = input.invitedById;
    if (!inviterId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      inviterId = adminUser?.id;
    }

    const role = input.role || 'EDITOR';
    const invitation = await prisma.accountInvitation.create({
      data: {
        code,
        email: input.email.trim(),
        normalizedEmail,
        activeForEmail: normalizedEmail,
        role,
        tokenHash,
        invitedById: inviterId || null,
        expiresAt,
      },
    });

    await recordAuditLog({
      action: 'INVITATION_CREATED',
      actorId: inviterId || null,
      actorEmail: input.invitedByEmail || 'wlfjck@gmail.com',
      targetType: 'AccountInvitation',
      targetId: invitation.id,
      targetEmail: normalizedEmail,
      metadata: {
        code,
        role,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return {
      invitation,
      token: code,
      code,
    };
  } catch (error) {
    if (isUniqueConflict(error)) {
      throw new AccountAdmissionError(
        409,
        'invitation_exists',
        'An active invitation already exists for this email or code.'
      );
    }
    throw error;
  }
}

export async function inspectAccountInvitation(
  rawCodeOrToken: string,
  now = new Date()
): Promise<PublicInvitationView> {
  const cleaned = rawCodeOrToken.trim().toUpperCase();
  const tokenHash = hashOpaqueToken(cleaned);

  const invitation = await prisma.accountInvitation.findFirst({
    where: {
      OR: [{ code: cleaned }, { tokenHash }],
    },
  });

  if (!invitation) {
    return {
      id: '',
      code: cleaned,
      status: 'invalid',
      role: 'EDITOR',
      maskedEmail: null,
      expiresAt: null,
    };
  }

  if (invitation.status === 'PENDING' && invitation.expiresAt <= now) {
    await prisma.accountInvitation.updateMany({
      where: { id: invitation.id, status: 'PENDING' },
      data: {
        status: 'EXPIRED',
        activeForEmail: null,
      },
    });
    return {
      id: invitation.id,
      code: invitation.code,
      status: 'expired',
      role: invitation.role,
      maskedEmail: maskEmail(invitation.email),
      email: invitation.email,
      expiresAt: invitation.expiresAt,
    };
  }

  return {
    id: invitation.id,
    code: invitation.code,
    status: invitation.status.toLowerCase() as PublicInvitationView['status'],
    role: invitation.role,
    maskedEmail: maskEmail(invitation.email),
    email: invitation.email,
    expiresAt: invitation.expiresAt,
  };
}

export async function revokeAccountInvitation(
  id: string,
  actor?: { id?: string; email?: string }
): Promise<AccountInvitation> {
  const now = new Date();
  const invitation = await prisma.accountInvitation.findUnique({
    where: { id },
  });
  if (!invitation) {
    throw new AccountAdmissionError(404, 'not_found', 'Invitation not found.');
  }
  if (invitation.status === 'REVOKED') {
    return invitation;
  }
  if (invitation.status !== 'PENDING') {
    throw new AccountAdmissionError(
      409,
      'invalid_transition',
      'Only a pending invitation can be revoked.'
    );
  }

  const updated = await prisma.accountInvitation.update({
    where: { id },
    data: {
      status: 'REVOKED',
      revokedAt: now,
      activeForEmail: null,
    },
  });

  await recordAuditLog({
    action: 'INVITATION_REVOKED',
    actorId: actor?.id ?? null,
    actorEmail: actor?.email ?? 'wlfjck@gmail.com',
    targetType: 'AccountInvitation',
    targetId: updated.id,
    targetEmail: updated.normalizedEmail,
    metadata: { code: updated.code },
  });

  return updated;
}

export async function listAccountInvitations() {
  await expirePendingInvitations();
  return prisma.accountInvitation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invitedBy: {
        select: { id: true, name: true, email: true },
      },
      acceptedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
