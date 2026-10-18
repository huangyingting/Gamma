# Architecture Decision Records (ADR) — Gamma Platform

## ADR-001: Next.js 16 App Router Full-Stack Architecture
- **Status**: Accepted
- **Context**: Live `https://gamma.app/` uses Next.js with hybrid server/client rendering for fast workspace navigation, public deck sharing (`/public/[slug]`), and rich client-side interactivity in the card editor (`/docs/[id]`).
- **Decision**: Build on **Next.js 16 (App Router)** with React 19 and TypeScript. Server Components and Route Handlers (`/api/**`) enforce authentication, RBAC, and database persistence, while dedicated interactive Client Components power the Workspace Dashboard, 4-Mode AI Creation Studio, and Collaborative Card & Smart-Layout Editor.
- **Consequences**: Unified TypeScript codebase, zero-CORS internal API routes, instant SSR for public/shared decks and published sites, and deterministic E2E testability.

---

## ADR-002: Dual-Database Prisma 7 Architecture (SQLite Local Dev + PostgreSQL Production)
- **Status**: Accepted
- **Context**: The platform must run self-contained in local development and CI using SQLite while supporting horizontal scale in production on PostgreSQL without code changes.
- **Decision**: Use **Prisma 7 (`@prisma/client`)** with driver adapters:
  - Local development & automated tests: `@prisma/adapter-better-sqlite3` (`better-sqlite3`) backed by `prisma/schema.prisma` (`provider = "sqlite"`).
  - Production deployment: `@prisma/adapter-pg` (`pg`) backed by `prisma/schema.postgres.prisma` (`provider = "postgresql"`).
  - `src/lib/prisma.ts` dynamically selects the adapter based on the `DATABASE_URL` protocol (`file:` vs `postgres://` / `postgresql://`).
- **Consequences**: Zero external database daemon required for local development or Playwright E2E suites, paired with drop-in PostgreSQL production readiness.

---

## ADR-003: Invite-Only Account Admission, Database-Backed Revocation & CLI-Only Admin Bootstrap
- **Status**: Accepted
- **Context**: Public sign-up must be disabled in favor of controlled invite-only onboarding with single-use expiring tokens, role-based access control (`ADMIN`, `EDITOR`, `VIEWER`), immediate session revocation (`ACTIVE` vs `REVOKED`), and immutable audit logging, following `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md`.
- **Decision**:
  1. **No Public Bootstrap API**: Initial administrator creation is restricted exclusively to the CLI script `scripts/bootstrap-admin.ts` (`npm run bootstrap:admin`).
  2. **Transactional Invitation Redemption**: Registration (`/api/auth/register` and `/signup?code=...`) validates that the invitation code exists, is `PENDING`, has not expired (`expiresAt > now`), and matches the normalized `invitedEmail` (`trim().toLowerCase()`), then atomically marks the invitation `ACCEPTED` and creates the `User` inside `prisma.$transaction`.
  3. **Live JWT Re-Validation**: NextAuth's `jwt` callback queries Prisma on every token verification to confirm `user.status === 'ACTIVE'` and synchronize `user.role`. Revoked accounts are immediately denied access across both UI pages and API routes.
  4. **Audit Logging**: Every admission, authentication, role change, and invitation lifecycle event writes a structured record to `AuditLog`.
- **Consequences**: Eliminates unauthorized signups, prevents privilege escalation, guarantees instant revocation enforcement, and provides a complete compliance audit trail.

---

## ADR-004: Fluid Card-Based Document & Smart-Layout Block Engine
- **Status**: Accepted
- **Context**: Unlike traditional slide tools (PowerPoint/Keynote) that use fixed `1920x1080` absolute-pixel coordinates, Gamma's core innovation (verified in `21_real_doc_editor_unlocked.png` through `28_editor_add_block_menu.png`) is **fluid, responsive cards** composed of structured semantic blocks (`heading`, `paragraph`, `smart_layout`, `chart`, `stat_grid`, `timeline`, `comparison`, `callout`, `image`, `table`, `embed`, `code`, `Checklist`) and per-card styling (`accentPosition`: `none | top | left | right | background`, `accentImage`, `backgroundColor`, `fullBleed`, `contentAlignment`).
- **Decision**: Represent each Gamma deck (`Doc`) as an ordered collection of `Card` records where each card stores:
  - `title`, `orderIndex`, `layoutAccent` (`none`, `top`, `left`, `right`, `background`), `accentImageUrl`, `backgroundColor`, `fullBleed`, `alignment` (`top`, `center`, `bottom`), `speakerNotes`
  - `blocks` (JSON array of strongly typed block nodes supporting inline rich formatting, multi-column Smart Layouts, interactive SVG data charts, metric stat cards, timelines, callout boxes, tables, and media).
- **Consequences**: Cards automatically reflow from multi-column desktop layouts (`1440px`) to single-column mobile stacks (`390px`), support one-click layout transformations, and render identically in Editor, Viewer, Presenter Mode, and Published Sites.

---

## ADR-005: Gamma 5 Two-Tier Left Navigation & Unified Fixed Formatting Bar
- **Status**: Accepted
- **Context**: Live Playwright inspection of Gamma 5 (`04_workspace_gammas_grid.png`, `07_workspace_ai_images.png`, `08_workspace_templates.png`, `11_workspace_themes.png`, `21_real_doc_editor_unlocked.png`) revealed two signature navigation paradigms:
  1. **Workspace 2-Tier Sidebar**: A `56px` dark/high-contrast primary icon rail (`Home`, `Media`, `Templates`, `Customize`, `Settings`, `Access & Audit`) paired with a `220px` contextual secondary navigation panel.
  2. **Editor Unified Header + Fixed Formatting Bar**: A top `UnifiedToolbar` (`Home`, `Agent` toggle, editable Title, `Theme`, `Share`, `Present`) stacked above a `48px` `FixedFormattingBar` (`Manual Edit | ✨ Agent` mode switch, `Undo`/`Redo`, `+ Add block`, Typography preset, Font family, Text/Highlight color, `B`/`I`/`U`, Alignment, Lists, Comment trigger) and a left `Filmstrip` + collapsible `Gamma Agent` split pane.
- **Decision**: Implement both the 2-Tier Workspace Sidebar and the Unified Header + Fixed Formatting Bar + Filmstrip + Agent Split Pane with exact structural and visual fidelity.
- **Consequences**: Matches the authentic Gamma 5 UX discovered during live exploration while keeping every tool reachable within 1 click.

---

## ADR-006: Four-Path AI Creation Studio (`/create/*`) & Interactive Outline-First Generation
- **Status**: Accepted
- **Context**: Gamma's `/create` hub (`10_create_hub.png`, `15_create_generate.png`–`18_create_from_template.png`) guides users through 4 distinct creation workflows (`Generate`, `Paste in text`, `Import file or URL`, `Create from template`) using a two-stage **Prompt → Editable Card-by-Card Outline + Theme Selection → Full Deck Generation** pipeline.
- **Decision**: Implement all 4 creation workflows with an interactive Outline Editor (allowing users to add, reorder, edit, or delete card outline items, choose card count `1–10`, pick format `Presentation | Webpage | Document | Social`, select text density `Brief | Medium | Detailed`, and preview themes) before synthesizing the complete multi-card deck with rich Smart Layouts, charts, and curated visuals.
- **Consequences**: Gives users deterministic control over deck structure prior to generation and works reliably offline/locally with intelligent domain-aware synthesis as well as optional LLM API integration.

---

## ADR-007: Live Theme Engine & CSS Custom Property Injection
- **Status**: Accepted
- **Context**: In Gamma (`11_workspace_themes.png`, `25_editor_theme_drawer.png`), switching a theme (`Prism`, `Stratos`, `Aurora`, `Obsidian`, `Founder`, `Sage`) immediately updates card backgrounds, page canvas gradients, heading/body fonts, accent colors, smart-layout card surfaces, and chart palettes without mutating underlying block content.
- **Decision**: Store themes as first-class `Theme` entities with structured tokens (`bgPage`, `bgCard`, `textPrimary`, `textSecondary`, `accentPrimary`, `accentSecondary`, `fontHeading`, `fontBody`, `borderRadius`, `cardBorder`, `chartPalette`) and inject them as scoped CSS variables on the deck canvas container. Users can also create and customize themes in `/themes` or inside the Editor Theme Drawer.
- **Consequences**: Instantaneous zero-layout-shift theme switching and complete separation of content from presentation.

---

## ADR-008: Gamma Sites Publishing & Custom Domain Management (`/sites`)
- **Status**: Accepted
- **Context**: Gamma 5 includes a dedicated `Sites` product (`06_workspace_sites.png`) that converts any Gamma deck into a multi-section responsive website with custom domain configuration (`roadmap.genesisiq.ai`), navigation header bar, SEO metadata, and `Active` / `Draft` publishing states.
- **Decision**: Model `Site` in Prisma linked to a source `Doc`, supporting one-click conversion of any Gamma into a published site, custom domain assignment, navigation bar toggles, and a live public site renderer at `/s/[siteSlug]`.
- **Consequences**: Full parity with Gamma Sites workflow.

---

## ADR-009: Media / AI Images Studio (`/ai-images`)
- **Status**: Accepted
- **Context**: Gamma's `Media` icon rail opens `/ai-images` (`07_workspace_ai_images.png`) where users can generate AI illustrations/photos with style presets (`Photorealistic`, `3D Render`, `Vector Art`, `Cyberpunk`, `Minimalist Line`, `Watercolor`), filter by `All images`, `Generated by you`, and `Uploaded by you`, and insert any generated asset directly into a deck card's accent image or media block.
- **Decision**: Persist workspace media assets in the `AiImage` table and provide an interactive AI Image Generator studio (generating rich deterministic SVG/data-URI & high-res curated visual assets with prompt, aspect ratio, and style metadata) directly integrated with the Card Editor's Accent Image and Media Block pickers.
- **Consequences**: Seamless visual asset creation and reuse across decks.

---

## ADR-010: CASL-Aligned Authorization Matrix & Export Engine
- **Status**: Accepted
- **Context**: Gamma enforces granular permissions (`ADMIN`, `EDITOR`, `VIEWER` at the workspace/account level plus `publicAccess` levels `NONE`, `VIEW`, `COMMENT`, `EDIT` at the document level) and supports exporting decks (`26_editor_share_modal.png`).
- **Decision**: Enforce role and document permission checks in a centralized policy helper (`src/lib/permissions.ts`), restricting mutations for `VIEWER` accounts while allowing `VIEWER` users to browse workspaces, view decks, enter Presenter Mode, and export read-only formats (`HTML/Print-PDF`, `Markdown`, `JSON`).
- **Consequences**: Defense-in-depth authorization across both API route handlers and UI controls.
