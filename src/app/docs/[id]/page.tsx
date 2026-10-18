'use client';

import React, { use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GammaEditor } from '@/components/editor/GammaEditor';

function DocEditorInner({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  return <GammaEditor docId={id} initialPresentMode={mode === 'present'} />;
}

export default function DocEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <DocEditorInner id={id} />
    </Suspense>
  );
}
