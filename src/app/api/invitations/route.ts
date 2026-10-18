import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  AccountAdmissionError,
  createAccountInvitation,
  listAccountInvitations,
  revokeAccountInvitation,
} from '@/lib/account-admission';

export async function GET() {
  const invitations = await listAccountInvitations();
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    ok: true,
    invitations,
    auditLogs,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as
      | { id?: string; email?: string; role?: string }
      | undefined;

    if (sessionUser?.role && sessionUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          ok: false,
          error: 'forbidden',
          message: 'Only workspace administrators can issue or revoke invitations.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.action === 'revoke' && body.id) {
      const revoked = await revokeAccountInvitation(body.id, {
        id: sessionUser?.id,
        email: sessionUser?.email,
      });
      return NextResponse.json({ ok: true, invitation: revoked });
    }

    const grant = await createAccountInvitation({
      email: body.email || '',
      role: body.role || 'EDITOR',
      expiresInHours: Number(body.expiresInHours) || 168,
      customCode: body.customCode,
      invitedById: sessionUser?.id,
      invitedByEmail: sessionUser?.email,
    });

    return NextResponse.json(
      {
        ok: true,
        invitation: grant.invitation,
        code: grant.code,
        inviteUrl: `/signup?code=${encodeURIComponent(grant.code)}&email=${encodeURIComponent(
          grant.invitation.email
        )}`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AccountAdmissionError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: 'invitation_error',
        message: error instanceof Error ? error.message : 'Invitation request failed.',
      },
      { status: 500 }
    );
  }
}
