import { NextResponse } from 'next/server';
import { inspectAccountInvitation } from '@/lib/account-admission';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') || searchParams.get('token') || '';
  if (!code.trim()) {
    return NextResponse.json(
      { ok: false, status: 'invalid', message: 'Missing invitation code.' },
      { status: 400 }
    );
  }

  const info = await inspectAccountInvitation(code);
  return NextResponse.json({
    ok: info.status === 'pending',
    invitation: info,
  });
}
