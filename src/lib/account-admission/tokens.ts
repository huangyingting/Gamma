import { createHash, randomBytes } from 'node:crypto';

export function createOpaqueToken(byteLength = 24): string {
  return randomBytes(byteLength).toString('base64url');
}

export function createShortInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(8);
  let out = 'GAMMA-';
  for (let i = 0; i < 8; i++) {
    out += chars[bytes[i] % chars.length];
    if (i === 3) out += '-';
  }
  return out;
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex');
}
