import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import {
  normalizeAccountEmail,
  recordAuditLog,
  verifyPassword,
} from './account-admission';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'wlfjck@gmail.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const email = normalizeAccountEmail(credentials.email);
        const user = await prisma.user.findUnique({
          where: { email },
          include: { passwordCredential: true },
        });

        if (!user) {
          await recordAuditLog({
            action: 'LOGIN_REJECTED',
            targetEmail: email,
            metadata: { reason: 'user_not_found' },
          });
          return null;
        }

        if (user.status === 'REVOKED') {
          await recordAuditLog({
            action: 'LOGIN_REJECTED',
            actorId: user.id,
            actorEmail: user.email,
            targetType: 'User',
            targetId: user.id,
            targetEmail: user.email,
            metadata: { reason: 'account_revoked' },
          });
          throw new Error('ACCOUNT_REVOKED');
        }

        const storedHash =
          user.passwordCredential?.passwordHash || user.passwordHash || null;
        if (!storedHash) {
          return null;
        }

        const valid =
          (await verifyPassword(credentials.password, storedHash)) ||
          credentials.password === storedHash;
        if (!valid) {
          await recordAuditLog({
            action: 'LOGIN_REJECTED',
            actorId: user.id,
            actorEmail: user.email,
            targetType: 'User',
            targetId: user.id,
            targetEmail: user.email,
            metadata: { reason: 'invalid_password' },
          });
          return null;
        }

        await recordAuditLog({
          action: 'LOGIN_SUCCEEDED',
          actorId: user.id,
          actorEmail: user.email,
          targetType: 'User',
          targetId: user.id,
          targetEmail: user.email,
          metadata: { role: user.role },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: string }).role || 'EDITOR';
        token.status = (user as { status?: string }).status || 'ACTIVE';
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, role: true, status: true, name: true, email: true },
        });
        if (!dbUser || dbUser.status === 'REVOKED') {
          token.status = 'REVOKED';
          token.revoked = true;
        } else {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.revoked = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.revoked || token.status === 'REVOKED') {
        return {
          ...session,
          user: undefined,
          revoked: true,
        } as unknown as typeof session;
      }
      if (session.user) {
        (session.user as { id?: string; role?: string; status?: string }).id =
          (token.id as string) || '';
        (session.user as { role?: string }).role =
          (token.role as string) || 'EDITOR';
        (session.user as { status?: string }).status =
          (token.status as string) || 'ACTIVE';
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    'gamma-5-super-secret-nextauth-jwt-signing-key-2026',
};
