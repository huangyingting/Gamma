'use client';

import React, { use } from 'react';
import { GammaEditor } from '@/components/editor/GammaEditor';

export default function PublicDocViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <GammaEditor docId={id} readOnly={true} />;
}
