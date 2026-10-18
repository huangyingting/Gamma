'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { MarketingHome } from '@/components/marketing/MarketingHome';

function HomeDispatcher() {
  const searchParams = useSearchParams();
  const [forceWorkspace, setForceWorkspace] = useState(false);
  const view = searchParams.get('view');

  if (view === 'marketing' && !forceWorkspace) {
    return <MarketingHome onEnterWorkspace={() => setForceWorkspace(true)} />;
  }

  return <WorkspaceShell initialSection="gammas" />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <HomeDispatcher />
    </Suspense>
  );
}
