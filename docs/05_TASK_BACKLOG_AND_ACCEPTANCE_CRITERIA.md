# Task Backlog & Acceptance Criteria — Gamma Platform

## 1. Engineering Task Backlog

| ID | Epic | Task Title | Priority | Status |
|---|---|---|---|---|
| **T-101** | E1: Discovery & Docs | Explore `https://gamma.app/` via Playwright with `.cred` and capture 30+ desktop & mobile screenshots | P0 | Done |
| **T-102** | E1: Discovery & Docs | Author ADR, PRD, Architecture/Data Model, Technical Spec, Backlog, Parity Matrix, and Invite-Only Spec | P0 | In Progress |
| **T-201** | E2: Data & Auth | Configure Prisma 7 dual schemas (`schema.prisma` SQLite + `schema.postgres.prisma` PostgreSQL) and `src/lib/prisma.ts` adapter selector | P0 | Pending |
| **T-202** | E2: Data & Auth | Implement `src/lib/account-admission/*` (email normalization, single-use transactional invite redemption, live status/role check, audit logger) | P0 | Pending |
| **T-203** | E2: Data & Auth | Implement CLI-only admin bootstrap (`scripts/bootstrap-admin.ts` / `npm run bootstrap:admin`) with zero public bootstrap HTTP endpoint | P0 | Pending |
| **T-204** | E2: Data & Auth | Create comprehensive `prisma/seed.ts` with real Gamma themes, flagship multi-card decks, folders, 12-category templates, AI images, and sites | P0 | Pending |
| **T-301** | E3: Public & Auth UI | Build Marketing Homepage (`/`), Pricing (`/pricing`), Sign In (`/signin` with expired/revoked toast), Forgot Password (`/forgot-password`), and Invite-Only Signup (`/signup?code=...`) | P0 | Pending |
| **T-401** | E4: Workspace Shell | Build Gamma 5 2-Tier Left Sidebar (`56px` icon rail + `220px` contextual workspace panel) + `Cmd+K` Quick Search modal + Gamma 5 launch announcement modal | P0 | Pending |
| **T-402** | E4: Workspace Hubs | Build `Gammas` Dashboard (Grid & List views, filter tabs, favorites, folder assignment, duplicate, trash) and Folder detail pages (`/folders/[slug]`) | P0 | Pending |
| **T-403** | E4: Workspace Hubs | Build `Sites` hub (`/sites` + live site renderer `/s/[siteSlug]`), `Media / AI Images` studio (`/ai-images`), `Templates` catalog (`/templates`), `Themes` studio (`/themes`), and `Trash` (`/trash`) | P0 | Pending |
| **T-501** | E5: AI Creation Suite | Build `/create` 4-card hub and `/create/generate`, `/create/paste`, `/create/import`, `/create/from-template` with interactive Outline Editor and AI Deck Synthesizer | P0 | Pending |
| **T-601** | E6: Card Editor | Build Gamma 5 Card Editor (`/docs/[id]`) with `UnifiedToolbar`, `FixedFormattingBar`, `Filmstrip` (Thumbnail + Outline modes), and inline block editing | P0 | Pending |
| **T-602** | E6: Card Editor | Implement Slash Command (`/`) & `+ Add block` menu supporting Smart Layouts, interactive SVG Area/Bar/Donut Charts, KPI Stat Grids, Timelines, Callouts, Tables, Checklists, and Media | P0 | Pending |
| **T-603** | E6: Card Editor | Implement `Card Styling` popover (5 accent layouts, accent image picker, background color, full bleed, vertical alignment), `Theme Drawer`, `Share & Export Modal`, `Gamma 5 AI Agent` split pane, and `Fullscreen Presenter Mode` | P0 | Pending |
| **T-701** | E7: Governance UI | Build `/settings/members` Admin Access & Governance Console (create/revoke single-use invitations, update user roles `ADMIN`/`EDITOR`/`VIEWER`, toggle `ACTIVE`/`REVOKED`, inspect `AuditLog`) | P0 | Pending |
| **T-801** | E8: Verification | Execute `npm run build`, `npm run bootstrap:admin`, and comprehensive Playwright E2E test suite covering all workflows and responsive viewports | P0 | Pending |

---

## 2. Acceptance Criteria (Gherkin Specification)

### AC-1: CLI-Only Admin Bootstrap & Zero Public Bootstrap Endpoint
- **Given** a fresh database environment with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` configured
- **When** the operator runs `npm run bootstrap:admin`
- **Then** an `ACTIVE` user with role `ADMIN` is created (or updated idempotently) and an `ADMIN_BOOTSTRAPPED` event is recorded in `AuditLog`
- **And** any HTTP request to `/api/bootstrap` or `/api/admin/bootstrap` returns `404 Not Found`.

### AC-2: Invite-Only Registration & Single-Use / Expiring Invitation Enforcement
- **Given** an unauthenticated visitor on `/signup` or calling `POST /api/auth/register`
- **When** they submit registration without an invitation code, with an expired/revoked code, or with an email that does not match `invitation.invitedEmail` (case-insensitive)
- **Then** registration is rejected with `403`/`400`, no `User` record is created, and `REGISTRATION_REJECTED` is logged in `AuditLog`
- **When** they submit registration with a valid `PENDING` code matching their email
- **Then** the `User` account is created with the invitation's assigned `role`, the `Invitation` is atomically marked `ACCEPTED`, `INVITATION_REDEEMED` is logged in `AuditLog`, and any subsequent attempt to reuse the same code is rejected.

### AC-3: Immediate Session Revocation & Role Enforcement
- **Given** an authenticated user with an active session
- **When** an `ADMIN` updates the user's status to `REVOKED` in `/settings/members` (`PATCH /api/admin/users/[id]`)
- **Then** on the user's very next page navigation or API request, the NextAuth session callback detects `status === 'REVOKED'`, invalidates the session, and blocks access
- **And** when a user has role `VIEWER`, they can view decks and enter Presenter Mode but receive `403 Forbidden` on deck/theme/folder/site mutation endpoints and `403 Forbidden` on `/api/invitations` and `/api/admin/*`.

### AC-4: Workspace Navigation & Hub Parity
- **Given** an authenticated `ACTIVE` user on the Workspace Dashboard (`/`)
- **When** they switch between **Grid View** and **List View**, filter by `Favorites` or `Created by you`, or open `Cmd+K` search
- **Then** the deck list updates immediately with accurate metadata
- **And** navigating via the 2-Tier Left Sidebar to `Folders`, `Sites`, `Media / AI Images`, `Templates`, `Themes`, `Trash`, and `Settings & Members` renders each surface without errors.

### AC-5: Four-Path AI Creation Studio (`/create/*`)
- **Given** an `ADMIN` or `EDITOR` user on `/create`
- **When** they select `Generate` (`/create/generate`), enter a topic prompt, customize the generated card-by-card outline, choose a theme, and click `Generate`
- **Then** a new multi-card `Doc` is persisted in Prisma with rich Smart Layouts, charts, and theme styling, and the browser navigates directly to `/docs/[newDocId]`.

### AC-6: Gamma 5 Card Editor, Slash Menu, Styling, Theme Drawer, AI Agent & Presenter Mode
- **Given** an `ADMIN` or `EDITOR` user inside `/docs/[id]`
- **When** they edit card titles/blocks, insert blocks via the Slash Menu (`/`) or `+ Add block` palette, change the Card Styling accent position (`None`, `Top`, `Left`, `Right`, `Background`), switch the deck theme in the `Theme` drawer, or run a prompt in the **Gamma AI Agent** split pane
- **Then** the card canvas and filmstrip update immediately and persist to the database
- **And** clicking `Present` launches Fullscreen Presenter Mode with keyboard slide navigation (`ArrowRight` / `ArrowLeft` / `Esc`) and speaker notes toggle.

### AC-7: Responsive Mobile & Desktop Layout
- **Given** any page (`/`, `/signin`, `/create/generate`, `/docs/[id]`, `/public/[slug]`) viewed on a mobile viewport (`390x844`)
- **When** the layout renders
- **Then** navigation collapses into a mobile-friendly header/drawer and multi-column Smart Layouts within cards stack cleanly without horizontal overflow.
