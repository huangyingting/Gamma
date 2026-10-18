import { NextResponse } from 'next/server';
import {
  AccountAdmissionError,
  registerWithInvitation,
} from '@/lib/account-admission';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, code, invitationCode, token } = body;

    const result = await registerWithInvitation({
      email: email || '',
      password: password || '',
      name: name || '',
      code: code || invitationCode || token || '',
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          status: result.user.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AccountAdmissionError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.code,
          message: error.message,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'registration_failed',
        message: error instanceof Error ? error.message : 'Registration failed.',
      },
      { status: 500 }
    );
  }
}
