# Product Requirements Document (PRD) — Gamma Platform

## 1. Product Vision & Scope

**Gamma** is an AI-native presentation, document, and webpage creation platform that replaces rigid slide decks with fluid, interactive, responsive cards powered by an AI Generation Engine and collaborative **Gamma 5 Agent**. Additionally, the platform enforces enterprise-grade **Invite-Only Account Admission**, role-based access control (`ADMIN`, `EDITOR`, `VIEWER`), immediate account revocation, CLI-only admin bootstrap, and immutable audit logging.

---

## 2. User Personas & Roles

1. **Workspace Administrator (`ADMIN`)**
   - Bootstrapped via CLI (`npm run bootstrap:admin`) or promoted by an existing Admin.
   - Full privileges across all workspace decks, folders, themes, templates, AI images, and published sites.
   - Exclusive access to **Access & Invitations Governance** (`/settings/members`): creates single-use expiring invitation codes bound to specific email addresses and roles, revokes pending invitations, changes user roles (`ADMIN`, `EDITOR`, `VIEWER`), revokes or reactivates user accounts (`ACTIVE` / `REVOKED`), and inspects the immutable `AuditLog`.
2. **Content Creator / Editor (`EDITOR`)**
   - Redeems a valid invitation code to register.
   - Creates, edits, styles, shares, presents, and publishes Gammas, folders, custom themes, templates, AI images, and Gamma Sites.
3. **Workspace Viewer (`VIEWER`)**
   - Redeems a `VIEWER` invitation code.
   - Read-only access to workspace Gammas, folders, templates, and themes; can launch fullscreen Presenter Mode and export permitted decks, but cannot create, mutate, or delete workspace content or manage invitations.
4. **External / Unauthenticated Visitor**
   - Can browse public marketing pages (`/`, `/pricing`), view explicitly shared public decks (`/public/[slug]`) and published Gamma Sites (`/s/[siteSlug]`), and sign in (`/signin`) or redeem a valid invitation link (`/signup?code=...`).

---

## 3. Functional Requirements

### FR-1: Public Marketing, Pricing & Authentication Flows
- **FR-1.1 Marketing Home (`/`)**: Unauthenticated visitors see the Gamma 5 hero experience (*"Gamma 5 is here — Meet the new Gamma Agent"*), interactive feature showcase, template previews, and CTAs (`Sign in`, `Redeem invite`, `Pricing`). Authenticated users visiting `/` are rendered the Workspace Dashboard (or routed seamlessly).
- **FR-1.2 Pricing Page (`/pricing`)**: Displays `Free`, `Plus`, `Pro`, and `Ultra` tier cards with monthly/annual billing toggle and feature comparison table (`33_public_pricing.png`).
- **FR-1.3 Sign In (`/signin`)**: Email + password authentication via NextAuth Credentials provider, session-expired toast notice (`?reason=expired` or `?reason=revoked`), and link to `/forgot-password` and `/signup` (`02_signin_full.png`, `03_signin_session_expired_toast.png`).
- **FR-1.4 Invite-Only Registration (`/signup`)**: Requires a valid, single-use, unexpired invitation token (`code`). Supports real-time invitation token verification (`/api/invitations/verify?code=...`) pre-populating the invited email and assigned role badge. Rejects open signup attempts without a valid code and records `REGISTRATION_REJECTED` in `AuditLog`.

### FR-2: Gamma 5 Two-Tier Workspace Dashboard (`/`)
- **FR-2.1 Primary Icon Rail (`56px`)**: Fixed leftmost navigation rail with icons for `Home` (`Gammas`), `Media` (`/ai-images`), `Templates` (`/templates`), `Customize` (`/themes`), `Settings & Members` (`/settings/members`), user profile avatar, and sign-out button.
- **FR-2.2 Secondary Contextual Panel (`220px`)**:
  - Under `Home`: Workspace switcher header, `Search (Cmd+K)` quick-find modal trigger, navigation links (`Gammas`, `Sites`, `AI Images`, `Templates`, `Themes`, `Trash`), and `FOLDERS` section (`PINNED`, `RECENT`, `+ New folder` creation button, and dynamic folder links).
- **FR-2.3 Gammas Hub (`04_workspace_gammas_grid.png`, `05_workspace_gammas_list.png`)**:
  - Top action bar: `+ Create new AI` (routes to `/create`), `+ New gamma` (creates blank deck and opens editor), `Import` (routes to `/create/import`).
  - Filter tabs: `All`, `Recently viewed`, `Created by you`, `Favorites`.
  - View mode switcher: **Grid View** (visual theme-styled thumbnail cards with card count badge, folder pill, favorite star, and action menu) and **List View** (table with `Title`, `Folder`, `Created`, `Last viewed`, `Creator`, and actions).
  - Deck actions: Open in Editor, Present, Duplicate, Move to Folder, Toggle Favorite, Rename, Move to Trash.
  - Optional Gamma 5 launch announcement modal (`"Meet the new Gamma"`) dismissible by user (`04a_gamma5_announcement_modal.png`).

### FR-3: Folders, Sites, Media, Templates, Themes & Trash Hubs
- **FR-3.1 Folders (`/folders/[id]`)**: Filter decks by folder, toggle folder `isPinned`, rename/delete folder, and assign/remove decks (`05b_workspace_folder_view.png`).
- **FR-3.2 Gamma Sites (`/sites`)**: Convert any existing Gamma deck into a live published website or create a new site; configure custom domain (e.g., `roadmap.genesisiq.ai`), toggle `Active` / `Draft` status, preview at `/s/[siteSlug]`, and jump to Editor (`06_workspace_sites.png`).
- **FR-3.3 Media / AI Images (`/ai-images`)**: Generate new AI images from text prompts with style presets (`3D Render`, `Photorealistic`, `Vector Art`, `Neon Glass`, `Editorial Illustration`) and aspect ratios (`16:9`, `1:1`, `4:3`), filter by `All images`, `Generated by you`, `Uploaded by you`, copy/download, or insert into decks (`07_workspace_ai_images.png`).
- **FR-3.4 Templates (`/templates`)**: Browse `Workspace templates` and `Explore templates` across 12 category pills (`All`, `Company`, `Creative`, `Education`, `Reporting`, `Project Management`, `Fundraising`, `Sales`, `Marketing`, `Consulting`, `People`, `Strategy`), preview slide structure, and click `Use template` to instantiate a new editable Gamma deck (`08_workspace_templates.png`).
- **FR-3.5 Customize / Themes (`/themes`)**: Browse `Custom`, `Standard`, and `Archived` themes (`Prism`, `Stratos`, `Aurora`, `Obsidian`, `Founder`, `Sage`), create/edit custom themes (`+ New theme`) with custom color tokens and heading/body font pairs, and preview live card rendering (`11_workspace_themes.png`).
- **FR-3.6 Trash (`/trash`)**: View soft-deleted Gammas (`archivedAt != null`) with one-click `Restore` or `Delete permanently` (`13_workspace_trash.png`).

### FR-4: Four-Path AI Creation Studio (`/create/*`)
- **FR-4.1 Creation Gateway (`/create`)**: 4 visual workflow cards (`Generate`, `Paste in text`, `Import file or URL`, `Create from template`) plus `Recent prompts` quick-launch list (`10_create_hub.png`).
- **FR-4.2 Generate from Prompt (`/create/generate`)**: Choose format (`Presentation`, `Webpage`, `Document`, `Social`), card count (`1–10 cards`), language, and topic prompt; generate an interactive card-by-card **Outline** where cards can be added, reordered, edited, or removed; choose text density (`Brief`, `Medium`, `Detailed`), select a visual `Theme`, and click `Generate` to synthesize a multi-card Gamma deck (`15_create_generate.png`).
- **FR-4.3 Paste in Text (`/create/paste`)**: Paste markdown, meeting notes, or articles; pick text handling mode (`Condense`, `Preserve`, `Expand`) and format, preview outline, and generate deck (`16_create_paste.png`).
- **FR-4.4 Import File or URL (`/create/import`)**: Upload `.md` / `.txt` / `.json` document content or paste a webpage URL/structured content to extract sections into a Gamma deck (`17_create_import.png`).
- **FR-4.5 Create from Template (`/create/from-template`)**: Pick a curated template blueprint, supply custom topic/context instructions, and generate a tailored deck (`18_create_from_template.png`).

### FR-5: Gamma 5 Collaborative Card Editor (`/docs/[id]`)
- **FR-5.1 Unified Toolbar & Fixed Formatting Bar (`21_real_doc_editor_unlocked.png`)**:
  - Top `UnifiedToolbar`: `Home` breadcrumb button, `Agent` panel toggle, inline-editable Document Title, folder badge, `Theme` drawer button, `Share` modal button, `Present` mode button, and collaborator presence indicator.
  - `FixedFormattingBar`: `[Manual Edit | ✨ Agent]` mode switch, `Undo` / `Redo` history stack, `+ Add block` menu trigger, Typography level selector (`Display`, `Title`, `Heading 1`, `Heading 2`, `Body`), Font family selector, Text & Highlight color pickers, Bold/Italic/Underline, Alignment (`Left`, `Center`, `Right`), Bullet/Numbered list converters, and Card Comment button.
- **FR-5.2 Left Filmstrip**:
  - Toggle between **Thumbnail View** and **Outline List View**.
  - `+ New card` button and between-card `+` insertion triggers (`Blank card`, `AI card from prompt`, `Smart layout card`).
  - Drag/up-down card reordering, card duplication, and card deletion.
- **FR-5.3 Fluid Canvas Cards & Block Types (`22_editor_card2_menus.png`, `23_editor_slash_menu.png`, `28_editor_add_block_menu.png`)**:
  - Every card supports inline editing of its title and blocks.
  - Typing `/` inside a text block or clicking `+ Add block` opens the categorized Block Insertion Menu supporting:
    - **Text & Headings**: `Heading 1`, `Heading 2`, `Paragraph`, `Bulleted List`, `Checklist`, `Quote / Callout` (`info`, `success`, `warning`, `accent`).
    - **Smart Layouts**: `2-Column Grid`, `3-Column Cards`, `4-Column Feature Boxes`, `Timeline / Roadmap`, `Process Steps`, `Comparison Table`.
    - **Charts & Metrics**: `Stat / KPI Metric Grid` (big numbers + delta badges), `Interactive Area / Line Chart`, `Bar Chart`, `Donut Breakdown` with editable data rows.
    - **Media & Interactive**: `AI Image / Media Block`, `Code Snippet`, `CTA Button`.
- **FR-5.4 Card Styling Popover (`24_editor_card_styling.png`)**:
  - 5 visual Accent Layout positions: `None`, `Top`, `Left`, `Right`, `Background`.
  - Accent image picker (choose from Workspace AI Images or enter custom URL).
  - Card-specific background color override, `Full bleed card` toggle, and vertical content alignment (`Top`, `Center`, `Bottom`).
  - Speaker notes drawer (`📝 Speaker notes`) per card.
- **FR-5.5 Live Theme Drawer (`25_editor_theme_drawer.png`)**:
  - Slide-over drawer allowing instant switching between all standard and custom workspace themes, plus live customization of primary accent color and font pair.
- **FR-5.6 Gamma 5 AI Agent Split Pane (`27_editor_ai_agent_panel.png`)**:
  - Left-docked conversational AI assistant aware of the active deck and selected card.
  - Supports natural language instructions and quick-action chips:
    - *"Rewrite active card for executive clarity"*
    - *"Add a 3-column smart layout with key takeaways"*
    - *"Add an interactive velocity chart to this card"*
    - *"Generate a new summary & next-steps card"*
    - *"Switch visual layout to left-accent with illustration"*
- **FR-5.7 Share, Permissions & Export Modal (`26_editor_share_modal.png`)**:
  - Configure workspace access (`No access`, `Can view`, `Can comment`, `Can edit`, `Full access`) and public link sharing (`/public/[slug]`).
  - Export deck to **Print / PDF**, **Standalone Interactive HTML**, **Markdown (`.md`)**, or **Gamma JSON (`.gamma.json`)**.
- **FR-5.8 Fullscreen Presenter Mode (`30_editor_presenter_mode.png`)**:
  - Dedicated fullscreen stage (`?mode=present` or `Present` button) with keyboard navigation (`ArrowRight`/`Space` next card, `ArrowLeft` previous card, `Esc` exit), card progress counter (`Card X of N`), optional Speaker Notes HUD overlay, and Spotlight pointer mode.

### FR-6: Invite-Only Access Governance & Audit Log (`/settings/members`)
- **FR-6.1 Invitation Management (`ADMIN` only)**:
  - Issue single-use invitations specifying `invitedEmail`, `role` (`ADMIN`, `EDITOR`, `VIEWER`), and expiration window (`24 hours` to `30 days`, default `7 days`).
  - Copy ready-to-share registration link (`/signup?code=...`) or raw code.
  - Filter invitations by status (`PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED`) and revoke pending invitations.
- **FR-6.2 Member Role & Status Management (`ADMIN` only)**:
  - Change any user's role (`ADMIN`, `EDITOR`, `VIEWER`) or status (`ACTIVE`, `REVOKED`), with self-demotion and self-revocation safety guards so the active admin cannot lock out the workspace.
- **FR-6.3 Immutable Audit Log Viewer (`ADMIN` only)**:
  - Inspect chronological security events (`ADMIN_BOOTSTRAPPED`, `INVITATION_CREATED`, `INVITATION_REVOKED`, `INVITATION_REDEEMED`, `REGISTRATION_REJECTED`, `LOGIN_SUCCEEDED`, `LOGIN_REJECTED`, `USER_ROLE_UPDATED`, `USER_STATUS_UPDATED`) with actor email, target email, timestamp, and metadata JSON.
