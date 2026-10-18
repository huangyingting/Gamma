# Gamma Documentation Suite

This directory contains the complete engineering, product, architecture, and verification documentation for the **Gamma** full-stack application, based on our systematic Playwright exploration of `https://gamma.app/` (Gamma 5 / Gamma 3.0) and the NextAuth Invite-Only Account Admission specification.

## Document Index

1. **[../GAMMA_EXPLORATION_AND_PARITY_REPORT.md](../GAMMA_EXPLORATION_AND_PARITY_REPORT.md)**
   - Playwright exploration coverage across **85 verified high-resolution screenshots (`00`–`83` in `screenshots/`)**, reverse-engineered Next.js route topology (`139` routes), GraphQL operation catalog (`287` operations), `714` `data-testid` attributes, LaunchDarkly feature flags, CASL permission rules, and security summary.
2. **[01_ADR_ARCHITECTURE_DECISION_RECORDS.md](./01_ADR_ARCHITECTURE_DECISION_RECORDS.md)**
   - Architecture Decision Records (ADRs 001–010) covering Next.js 16 App Router, Prisma 7 Dual SQLite/PostgreSQL Driver Adapters, NextAuth v4 Invite-Only Admission & CLI Bootstrap, Fluid Card & Smart Layout Engine, Gamma 5 2-Tier Sidebar & Unified Toolbar, Multi-Modal AI Creation Pipeline, Live Theme Engine, Sites Publishing, AI Image Studio, and RBAC + Audit Logging.
3. **[02_PRD_PRODUCT_REQUIREMENTS.md](./02_PRD_PRODUCT_REQUIREMENTS.md)**
   - Product Requirements Document covering target personas, functional requirements across all workspace hubs, AI creation flows, interactive card editing, presentation mode, sharing/export, and invite-only governance.
4. **[03_ARCHITECTURE_AND_DATA_MODEL.md](./03_ARCHITECTURE_AND_DATA_MODEL.md)**
   - System architecture diagrams, request lifecycle flows, component hierarchy, and complete Prisma relational + JSON document schema (`User`, `Invitation`, `AuditLog`, `Workspace`, `Folder`, `Doc`, `Card`, `Theme`, `Template`, `AiImage`, `Site`, `DocComment`).
5. **[04_TECHNICAL_SPEC_AND_IMPLEMENTATION_PLAN.md](./04_TECHNICAL_SPEC_AND_IMPLEMENTATION_PLAN.md)**
   - Detailed REST/RPC API specification, route map, design tokens, card block schemas, AI outline/deck generator specification, and phased implementation plan.
6. **[05_TASK_BACKLOG_AND_ACCEPTANCE_CRITERIA.md](./05_TASK_BACKLOG_AND_ACCEPTANCE_CRITERIA.md)**
   - Structured engineering task backlog across Epics E1–E8 and testable Gherkin Acceptance Criteria (`Given / When / Then`).
7. **[06_FEATURE_PARITY_MATRIX.md](./06_FEATURE_PARITY_MATRIX.md)**
   - Side-by-side Feature Parity Matrix mapping every explored `gamma.app` capability, UI state, error state, and responsive layout to our implementation and Playwright verification tests.
8. **[NEXTAUTH_INVITE_ONLY_SPEC.md](./NEXTAUTH_INVITE_ONLY_SPEC.md)**
   - Canonical security specification for Invite-Only Registration, Single-Use/Expiring Invitations, Roles (`ADMIN`, `EDITOR`, `VIEWER`), Account Revocation (`ACTIVE`, `REVOKED`), CLI-Only Admin Bootstrap (`npm run bootstrap:admin`), and Audit Logging.
