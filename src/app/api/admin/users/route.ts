import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAuditLog } from '@/lib/account-admission';

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      memberships: true,
    },
  });
  const groups = await prisma.workspaceGroup.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    ok: true,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      revokedAt: u.revokedAt,
      credits: u.credits,
      createdAt: u.createdAt,
      isGuest: u.memberships[0]?.isGuest ?? false,
      groupName: u.memberships[0]?.groupName ?? 'General',
    })),
    groups,
  });
}

export async function PATCH(req: Request) {
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
          message: 'Only administrators can modify user roles or revoke accounts.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role, status, groupName } = body;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'missing_user_id', message: 'userId is required.' },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json(
        { ok: false, error: 'not_found', message: 'User not found.' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role && ['ADMIN', 'EDITOR', 'VIEWER'].includes(role)) {
      updateData.role = role;
    }
    if (status && ['ACTIVE', 'REVOKED'].includes(status)) {
      updateData.status = status;
      updateData.revokedAt = status === 'REVOKED' ? new Date() : null;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (role || groupName !== undefined) {
      await prisma.workspaceMember.updateMany({
        where: { userId },
        data: {
          ...(role ? { role } : {}),
          ...(groupName !== undefined ? { groupName } : {}),
        },
      });
    }

    if (status === 'REVOKED') {
      await prisma.session.deleteMany({ where: { userId } });
    }

    await recordAuditLog({
      action: status ? 'USER_STATUS_UPDATED' : 'USER_ROLE_UPDATED',
      actorId: sessionUser?.id ?? null,
      actorEmail: sessionUser?.email ?? 'wlfjck@gmail.com',
      targetType: 'User',
      targetId: updated.id,
      targetEmail: updated.email,
      metadata: {
        previousRole: target.role,
        newRole: updated.role,
        previousStatus: target.status,
        newStatus: updated.status,
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        revokedAt: updated.revokedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'update_failed',
        message: error instanceof Error ? error.message : 'Failed to update user.',
      },
      { status: 500 }
    );
  }
}
