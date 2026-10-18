'use client';

import React, { use } from 'react';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

export default function FolderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <WorkspaceShell initialSection="folder-detail" folderSlug={slug} />;
}
