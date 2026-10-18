export type AccountAdmissionMode = 'invitation-only' | 'public';

export function accountAdmissionMode(): AccountAdmissionMode {
  const raw = (process.env.ACCOUNT_ADMISSION_MODE || 'invitation-only')
    .trim()
    .toLowerCase();
  return raw === 'public' ? 'public' : 'invitation-only';
}

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidAccountEmail(email: string): boolean {
  const normalized = normalizeAccountEmail(email);
  if (!normalized || normalized.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}
