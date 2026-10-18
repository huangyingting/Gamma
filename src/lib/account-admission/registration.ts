import { prisma } from '@/lib/prisma';
import { AccountAdmissionError } from './errors';
import { hashPassword } from './passwords';
import { isValidAccountEmail, normalizeAccountEmail } from './policy';
import { hashOpaqueToken } from './tokens';
import { recordAuditLog } from './audit';

export type InvitationRegistrationInput = {
  email: string;
  password: string;
  name?: string | null;
  code: string;
};

export async function registerWithInvitation(
  input: InvitationRegistrationInput
) {
  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(
      400,
      'invalid_email',
      'Enter a valid email address.'
    );
  }

  const normalizedEmail = normalizeAccountEmail(input.email);
  const cleanedCode = (input.code || '').trim().toUpperCase();
  if (!cleanedCode) {
    await recordAuditLog({
      action: 'REGISTRATION_REJECTED',
      targetEmail: normalizedEmail,
      metadata: { reason: 'missing_invitation_code' },
    });
    throw new AccountAdmissionError(
      403,
      'invitation_required',
      'Gamma is invite-only. A valid invitation code is required to create an account.'
    );
  }

  const tokenHash = hashOpaqueToken(cleanedCode);
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  const invitation = await prisma.accountInvitation.findFirst({
    where: {
      OR: [{ code: cleanedCode }, { tokenHash }],
    },
  });

  if (!invitation) {
    await recordAuditLog({
      action: 'REGISTRATION_REJECTED',
      targetEmail: normalizedEmail,
      metadata: { reason: 'invalid_code', code: cleanedCode },
    });
    throw new AccountAdmissionError(
      410,
      'invalid_invitation',
      'This invitation code is invalid or does not exist.'
    );
  }

  if (invitation.status === 'REVOKED') {
    await recordAuditLog({
      action: 'REGISTRATION_REJECTED',
      targetEmail: normalizedEmail,
      targetId: invitation.id,
      metadata: { reason: 'revoked_invitation', code: cleanedCode },
    });
    throw new AccountAdmissionError(
      410,
      'revoked_invitation',
      'This invitation has been revoked by a workspace administrator.'
    );
  }

  if (invitation.status === 'ACCEPTED') {
    await recordAuditLog({
      action: 'REGISTRATION_REJECTED',
      targetEmail: normalizedEmail,
      targetId: invitation.id,
      metadata: { reason: 'already_redeemed', code: cleanedCode },
    });
    throw new AccountAdmissionError(
      410,
      'already_redeemed',
      'This single-use invitation code has already been redeemed.'
    );
  }

  if (invitation.expiresAt <= now || invitation.status === 'EXPIRED') {
    await prisma.accountInvitation.updateMany({
      where: { id: invitation.id, status: 'PENDING' },
      data: {
        status: 'EXPIRED',
        activeForEmail: null,
      },
    });
    await recordAuditLog({
      action: 'REGISTRATION_REJECTED',
      targetEmail: normalizedEmail,
      targetId: invitation.id,
      metadata: { reason: 'expired_invitation', code: cleanedCode },
    });
    throw new AccountAdmissionError(
      410,
      'expired_invitation',
      'This invitation code has expired.'
    );
  }

  if (invitation.normalizedEmail !== normalizedEmail) {
    await recordAuditLog({
      action: 'REGISTRATION_REJECTED',
      targetEmail: normalizedEmail,
      targetId: invitation.id,
      metadata: {
        reason: 'email_mismatch',
        invitedEmail: invitation.normalizedEmail,
        attemptedEmail: normalizedEmail,
      },
    });
    throw new AccountAdmissionError(
      403,
      'email_mismatch',
      `This invitation was issued exclusively for ${invitation.email}.`
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    throw new AccountAdmissionError(
      409,
      'already_member',
      'An account already exists for this email address.'
    );
  }

  const displayName =
    input.name?.trim() || normalizedEmail.split('@')[0] || 'Gamma Member';

  const result = await prisma.$transaction(async (tx) => {
    const claimed = await tx.accountInvitation.updateMany({
      where: {
        id: invitation.id,
        status: 'PENDING',
        acceptedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: now,
        activeForEmail: null,
      },
    });

    if (claimed.count !== 1) {
      throw new AccountAdmissionError(
        410,
        'already_redeemed',
        'This single-use invitation code has already been redeemed.'
      );
    }

    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        emailVerified: now,
        name: displayName,
        role: invitation.role || 'EDITOR',
        status: 'ACTIVE',
        passwordHash,
        passwordCredential: {
          create: {
            passwordHash,
            passwordChangedAt: now,
          },
        },
      },
    });

    await tx.accountInvitation.update({
      where: { id: invitation.id },
      data: {
        acceptedById: user.id,
      },
    });

    const workspace = await tx.workspace.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (workspace) {
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: invitation.role || 'EDITOR',
        },
      });
    }

    await tx.auditLog.create({
      data: {
        action: 'INVITATION_REDEEMED',
        actorId: user.id,
        actorEmail: user.email,
        targetType: 'AccountInvitation',
        targetId: invitation.id,
        targetEmail: user.email,
        metadataJson: JSON.stringify({
          code: invitation.code,
          assignedRole: user.role,
        }),
      },
    });

    return { user, workspace };
  });

  return result;
}
