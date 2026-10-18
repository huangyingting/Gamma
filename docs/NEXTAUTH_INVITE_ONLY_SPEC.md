# NextAuth Invite-Only Account Admission, RBAC, Revocation & Audit Specification

This document defines the security and account admission specification implemented in `/home/azadmin/Gamma`, aligned with `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md`.

## 1. Core Security Invariants

1. **Invite-Only Registration**:
   - Open public registration is disabled.
   - A new account can only be registered via `POST /api/auth/register` (surfaced at `/signup?code=...`) when accompanied by a valid, single-use, unexpired `Invitation` code.
   - Email comparison is strictly normalized (`email.trim().toLowerCase()`). The submitted email MUST match `invitation.invitedEmail`.
2. **Single-Use & Expiration Enforcement**:
   - Every invitation has an explicit `expiresAt` timestamp and `status` (`PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED`).
   - Redemption runs inside a database transaction (`prisma.$transaction`) with an atomic conditional update (`WHERE id = invitation.id AND status = 'PENDING' AND acceptedAt IS NULL AND expiresAt > now`). If zero rows are updated, the transaction aborts and rejects concurrent/duplicate redemption.
3. **CLI-Only Initial Admin Bootstrap**:
   - There is **NO** HTTP API endpoint to bootstrap an administrator account.
   - The initial administrator is provisioned exclusively via the deployment CLI script:
     ```bash
     npm run bootstrap:admin
     ```
   - `scripts/bootstrap-admin.ts` reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `ADMIN_NAME` from the environment, validates password strength (minimum 8 characters), hashes the password with `bcryptjs`, idempotently upserts the `ADMIN` user with `status = 'ACTIVE'`, and writes an `ADMIN_BOOTSTRAPPED` entry to `AuditLog`.
4. **Role-Based Access Control (`ADMIN`, `EDITOR`, `VIEWER`)**:
   - `ADMIN`: Full access to all workspace resources plus exclusive access to `/api/invitations`, `/api/admin/users`, and `/api/admin/audit-logs`.
   - `EDITOR`: Full creation and editing rights for Gammas (`Doc`), `Card`s, `Folder`s, `Theme`s, `Template`s, `AiImage`s, and `Site`s; cannot manage invitations or user roles/statuses.
   - `VIEWER`: Read-only access to workspace Gammas, folders, templates, themes, and Presenter Mode; blocked (`403 Forbidden`) from creating, editing, or deleting workspace resources or managing invitations/users.
5. **Immediate Account Revocation (`ACTIVE` vs `REVOKED`)**:
   - In `src/lib/auth.ts`, the NextAuth `jwt` callback queries Prisma (`prisma.user.findUnique({ where: { id: token.sub } })`) on every session check.
   - If the user no longer exists or `user.status !== 'ACTIVE'`, the token is immediately marked `revoked = true` and `getServerSession` / `requireActiveUser` rejects the request with `401`/`403`.
6. **Self-Protection Guards**:
   - An administrator cannot revoke their own account (`status = 'REVOKED'`) or demote their own role below `ADMIN` via `/api/admin/users/[id]`.
7. **Immutable Audit Logging (`AuditLog`)**:
   - Every security-relevant event writes a structured record to `AuditLog`:
     - `ADMIN_BOOTSTRAPPED`
     - `INVITATION_CREATED`
     - `INVITATION_REVOKED`
     - `INVITATION_REDEEMED`
     - `REGISTRATION_REJECTED`
     - `LOGIN_SUCCEEDED`
     - `LOGIN_REJECTED`
     - `USER_ROLE_UPDATED`
     - `USER_STATUS_UPDATED`
