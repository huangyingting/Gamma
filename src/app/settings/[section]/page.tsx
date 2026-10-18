'use client';

import React, { use } from 'react';
import {
  WorkspaceShell,
  type WorkspaceSection,
} from '@/components/workspace/WorkspaceShell';

const SECTION_MAP: Record<string, WorkspaceSection> = {
  overview: 'settings-overview',
  members: 'settings-members',
  billing: 'settings-billing',
  sharing: 'settings-sharing',
  'public-links': 'settings-public-links',
  'api-keys': 'settings-api-keys',
  'my-connectors': 'settings-my-connectors',
  design: 'settings-design',
  sso: 'settings-sso',
  'audit-logs': 'settings-audit-logs',
  'ownerless-files': 'settings-ownerless-files',
  'unowned-folders': 'settings-unowned-folders',
};

export default function SettingsSubPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = use(params);
  const mapped = SECTION_MAP[section] || 'settings-members';
  return <WorkspaceShell initialSection={mapped} />;
}
