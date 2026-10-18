# System Architecture & Data Model — Gamma Platform

## 1. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                        Client Browser (Desktop 1440px / Mobile 390px)             |
|                                                                                   |
|  +-----------------------+  +------------------------+  +----------------------+  |
|  | Public & Auth Views   |  | 2-Tier Workspace Shell |  | Gamma 5 Card Editor  |  |
|  | /  /pricing  /signin  |  | / (Grid/List) /folders |  | UnifiedToolbar       |  |
|  | /signup?code=...      |  | /sites /ai-images      |  | FixedFormattingBar   |  |
|  | /public/[slug]        |  | /templates /themes     |  | Filmstrip + Canvas   |  |
|  | /s/[siteSlug]         |  | /trash /settings/*     |  | AI Agent Split Pane  |  |
|  +-----------+-----------+  +-----------+------------+  +----------+-----------+  |
+--------------|--------------------------|--------------------------|--------------+
               | HTTPS / JSON             |                          |
               v                          v                          v
+-----------------------------------------------------------------------------------+
|                         Next.js 16 App Router Server Runtime                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Auth & Admission Layer (NextAuth v4 + src/lib/account-admission/*)          |  |
|  | - Credentials Provider (bcrypt verification + ACTIVE status gate)           |  |
|  | - Live JWT/Session DB Re-Validation (instant REVOKED account lockout)       |  |
|  | - Role Policy Guard (ADMIN / EDITOR / VIEWER) + Document Permission Guard   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +------------------------+ +------------------------+ +-----------------------+  |
|  | Workspace & Deck APIs  | | AI Generation & Agent  | | Governance & Audit    |  |
|  | /api/docs, /api/cards  | | /api/ai/outline        | | /api/invitations      |  |
|  | /api/folders, /themes  | | /api/ai/generate-deck  | | /api/admin/users      |  |
|  | /api/templates, /sites | | /api/ai/agent          | | /api/admin/audit-logs |  |
|  | /api/ai-images         | |                        | | scripts/bootstrap-*   |  |
|  +-----------+------------+ +-----------+------------+ +-----------+-----------+  |
+--------------|--------------------------|--------------------------|--------------+
               |                          |                          |
               v                          v                          v
+-----------------------------------------------------------------------------------+
|                     Prisma 7 ORM Client (src/lib/prisma.ts)                       |
|        +---------------------------------+---------------------------------+      |
|        | Local Dev / Test Driver Adapter | Production Driver Adapter       |      |
|        | @prisma/adapter-better-sqlite3  | @prisma/adapter-pg              |      |
|        | SQLite (file:./dev.db)          | PostgreSQL (postgresql://...)   |      |
+--------+---------------------------------+---------------------------------+------+
```

---

## 2. Database Schema & Entity-Relationship Model

Both `prisma/schema.prisma` (SQLite for local development) and `prisma/schema.postgres.prisma` (PostgreSQL for production) define an identical domain model:

### 2.1 Core Admission, Identity & Audit Entities

#### `User`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `email` | `String` | `@unique` — Normalized lowercase (`trim().toLowerCase()`) |
| `name` | `String` | Display name |
| `passwordHash` | `String` | Bcrypt hash (`12` rounds) |
| `avatarUrl` | `String?` | Optional avatar URL or initials color |
| `role` | `String` | `'ADMIN' \| 'EDITOR' \| 'VIEWER'` (`@default("EDITOR")`) |
| `status` | `String` | `'ACTIVE' \| 'REVOKED'` (`@default("ACTIVE")`) |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

#### `Invitation`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `code` | `String` | `@unique` — Cryptographically random invite token (e.g. `GAMMA-INV-...`) |
| `invitedEmail` | `String` | Normalized email address to which this single-use invite is bound |
| `role` | `String` | `'ADMIN' \| 'EDITOR' \| 'VIEWER'` (`@default("EDITOR")`) |
| `status` | `String` | `'PENDING' \| 'ACCEPTED' \| 'REVOKED' \| 'EXPIRED'` (`@default("PENDING")`) |
| `expiresAt` | `DateTime` | Expiration timestamp (`default: +7 days`) |
| `acceptedAt` | `DateTime?` | Timestamp when redeemed |
| `revokedAt` | `DateTime?` | Timestamp when revoked by an Admin |
| `invitedById` | `String` | FK → `User.id` |
| `acceptedByUserId` | `String?` | `@unique` FK → `User.id` |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

#### `AuditLog`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `action` | `String` | Event code (`ADMIN_BOOTSTRAPPED`, `INVITATION_CREATED`, `INVITATION_REVOKED`, `INVITATION_REDEEMED`, `REGISTRATION_REJECTED`, `LOGIN_SUCCEEDED`, `LOGIN_REJECTED`, `USER_ROLE_UPDATED`, `USER_STATUS_UPDATED`, `DOC_CREATED`, `DOC_DELETED`, `SITE_PUBLISHED`) |
| `actorUserId` | `String?` | FK → `User.id` (nullable for unauthenticated/CLI events) |
| `actorEmail` | `String?` | Email of the actor |
| `targetType` | `String` | `'USER' \| 'INVITATION' \| 'AUTH' \| 'DOC' \| 'SITE'` |
| `targetId` | `String?` | ID of the target record |
| `targetEmail` | `String?` | Email of the target user/invitee |
| `metadataJson` | `String` | JSON-serialized structured event context (`@default("{}")`) |
| `ipAddress` | `String?` | Request IP or `'cli'` |
| `createdAt` | `DateTime` | `@default(now())` |

---

### 2.2 Gamma Workspace, Decks, Cards, Themes, Templates, Media & Sites Entities

#### `Folder`
| Column | Type | Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `name` | `String` | Folder display name (e.g. `Engineering & Strategy`, `Q3 Product Launch`) |
| `slug` | `String` | `@unique` URL-safe slug |
| `color` | `String` | Accent color hex (`#6366f1`) |
| `icon` | `String` | Folder icon identifier |
| `isPinned` | `Boolean` | Appears under `PINNED` in left sidebar (`@default(false)`) |
| `createdById` | `String` | FK → `User.id` |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

#### `Theme`
| Column | Type | Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `name` | `String` | Theme title (`Prism`, `Stratos`, `Aurora`, `Obsidian`, `Founder`, `Sage`) |
| `slug` | `String` | `@unique` slug |
| `category` | `String` | `'standard' \| 'custom' \| 'archived'` |
| `mode` | `String` | `'light' \| 'dark'` |
| `bgPage` | `String` | CSS background for deck viewport (solid or gradient) |
| `bgCard` | `String` | Default card surface background |
| `textPrimary` | `String` | Primary heading/body text hex |
| `textSecondary` | `String` | Muted text hex |
| `accentPrimary` | `String` | Primary brand/accent color hex |
| `accentSecondary` | `String` | Secondary gradient/chart color hex |
| `fontHeading` | `String` | Heading font family (`Space Grotesk`, `Plus Jakarta Sans`, `Outfit`, `Inter`) |
| `fontBody` | `String` | Body font family |
| `cardRadius` | `String` | Border radius token (`16px`, `20px`, `8px`) |
| `createdById` | `String?` | Optional creator FK → `User.id` |
| `createdAt` | `DateTime` | `@default(now())` |

#### `Doc` (A Gamma Deck / Document / Webpage)
| Column | Type | Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `title` | `String` | Document title |
| `slug` | `String` | `@unique` URL slug (e.g. `your-roadmap-to-success-amqq3hoavnc5sek`) |
| `description` | `String` | Summary / subtitle |
| `format` | `String` | `'presentation' \| 'webpage' \| 'document' \| 'social'` (`@default("presentation")`) |
| `creationMethod` | `String` | `'generate' \| 'paste' \| 'import' \| 'template' \| 'manual'` |
| `promptText` | `String?` | Original AI prompt or source text |
| `themeId` | `String` | FK → `Theme.id` |
| `folderId` | `String?` | Nullable FK → `Folder.id` |
| `ownerId` | `String` | FK → `User.id` |
| `isFavorite` | `Boolean` | Starred in workspace (`@default(false)`) |
| `isPublic` | `Boolean` | Accessible via `/public/[slug]` (`@default(true)`) |
| `workspaceAccess` | `String` | `'full' \| 'edit' \| 'comment' \| 'view' \| 'none'` (`@default("edit")`) |
| `viewCount` | `Int` | Total views counter (`@default(1)`) |
| `lastViewedAt` | `DateTime` | `@default(now())` |
| `archivedAt` | `DateTime?` | Non-null when moved to Trash |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

#### `Card` (Individual Fluid Slide / Card inside a `Doc`)
| Column | Type | Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `docId` | `String` | FK → `Doc.id` (`onDelete: Cascade`) |
| `orderIndex` | `Int` | 0-based position in the deck filmstrip |
| `title` | `String` | Card primary heading |
| `layoutAccent` | `String` | `'none' \| 'top' \| 'left' \| 'right' \| 'background'` (`@default("none")`) |
| `accentImageUrl` | `String?` | URL or data URI for the card's accent image |
| `backgroundColor` | `String?` | Optional per-card background color override |
| `fullBleed` | `Boolean` | Full-bleed layout flag (`@default(false)`) |
| `contentAlignment` | `String` | `'top' \| 'center' \| 'bottom'` (`@default("center")`) |
| `speakerNotes` | `String` | Presenter notes for this card (`@default("")`) |
| `blocksJson` | `String` | JSON array of typed `CardBlock[]` nodes |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

#### `Template`
| Column | Type | Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `title` | `String` | Template name |
| `slug` | `String` | `@unique` |
| `category` | `String` | `'Company' \| 'Creative' \| 'Education' \| 'Reporting' \| 'Project Management' \| 'Fundraising' \| 'Sales' \| 'Marketing' \| 'Consulting' \| 'People' \| 'Strategy'` |
| `description` | `String` | Overview of the template |
| `isWorkspace` | `Boolean` | Workspace-custom vs Standard Explore catalog |
| `themeId` | `String` | Default `Theme.id` |
| `previewCardsJson` | `String` | JSON blueprint of multi-card template content |
| `usageCount` | `Int` | Number of times instantiated |
| `createdAt` | `DateTime` | `@default(now())` |

#### `AiImage`
| Column | Type | Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `prompt` | `String` | Text prompt used to generate or describe the asset |
| `stylePreset` | `String` | `'3D Render' \| 'Photorealistic' \| 'Vector Art' \| 'Neon Glass' \| 'Editorial'` |
| `aspectRatio` | `String` | `'16:9' \| '1:1' \| '4:3'` |
| `sourceType` | `String` | `'generated' \| 'uploaded'` |
| `imageUrl` | `String` | Rich SVG data URI or image URL |
| `createdById` | `String` | FK → `User.id` |
| `createdAt` | `DateTime` | `@default(now())` |

#### `Site`
| Column | Type | Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `name` | `String` | Site title (e.g. `GenesisIQ Product Hub`) |
| `siteSlug` | `String` | `@unique` public path `/s/[siteSlug]` |
| `customDomain` | `String` | Custom domain (e.g. `roadmap.genesisiq.ai`) |
| `status` | `String` | `'ACTIVE' \| 'DRAFT'` (`@default("ACTIVE")`) |
| `docId` | `String` | FK → `Doc.id` (`onDelete: Cascade`) |
| `showHeaderNav` | `Boolean` | Auto-generate top navigation links from card titles (`@default(true)`) |
| `seoTitle` | `String` | Meta title |
| `seoDescription` | `String` | Meta description |
| `publishedAt` | `DateTime` | Last published timestamp |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

#### `DocComment`
| Column | Type | Description |
|---|---|---|
| `id` | `String` | `@id @default(cuid())` |
| `docId` | `String` | FK → `Doc.id` (`onDelete: Cascade`) |
| `cardId` | `String?` | Optional target card ID |
| `authorId` | `String` | FK → `User.id` |
| `content` | `String` | Comment body |
| `resolved` | `Boolean` | `@default(false)` |
| `createdAt` | `DateTime` | `@default(now())` |

---

## 3. Typed `CardBlock` JSON Schema

Each `Card.blocksJson` serializes an array of `CardBlock` objects:

```ts
export type CardBlockType =
  | 'heading'
  | 'paragraph'
  | 'bullet_list'
  | 'checklist'
  | 'smart_layout'
  | 'stat_grid'
  | 'chart'
  | 'timeline'
  | 'callout'
  | 'table'
  | 'image'
  | 'code'
  | 'button';

export interface CardBlock {
  id: string;
  type: CardBlockType;
  text?: string;
  level?: 'display' | 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center' | 'right';
  color?: string;
  highlightColor?: string;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  // For bullet_list / checklist
  items?: Array<{ id: string; text: string; checked?: boolean }>;
  // For smart_layout (2/3/4 column cards, feature boxes, comparison)
  columns?: number;
  variant?: 'cards' | 'bordered' | 'minimal' | 'gradient';
  cells?: Array<{ id: string; badge?: string; title: string; body: string; accentColor?: string }>;
  // For stat_grid (KPI metrics)
  stats?: Array<{ id: string; value: string; label: string; delta?: string; trend?: 'up' | 'down' | 'neutral' }>;
  // For chart (interactive Area, Bar, Line, Donut chart)
  chartType?: 'area' | 'bar' | 'line' | 'donut';
  chartTitle?: string;
  dataPoints?: Array<{ label: string; value: number; secondaryValue?: number }>;
  // For timeline / roadmap
  steps?: Array<{ id: string; phase: string; title: string; detail: string; status?: string }>;
  // For callout
  calloutTone?: 'info' | 'success' | 'warning' | 'accent';
  calloutTitle?: string;
  // For table
  headers?: string[];
  rows?: string[][];
  // For image
  imageUrl?: string;
  caption?: string;
  // For code
  language?: string;
  // For button
  buttonLabel?: string;
  buttonUrl?: string;
}
```
