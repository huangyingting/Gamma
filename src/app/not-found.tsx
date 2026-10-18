import Link from 'next/link';
import { Sparkles, ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      data-testid="error-404-page"
      className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-7 h-7 text-indigo-400" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
          404 • Page or Gamma Not Found
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          We couldn&apos;t find that gamma
        </h1>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          This presentation, site, or workspace folder may have been moved to Trash,
          or its public access link was revoked by a workspace administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition"
          >
            <Home className="w-4 h-4" />
            Back to Workspace
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold text-slate-200 transition"
          >
            <Search className="w-4 h-4" />
            Create with AI
          </Link>
        </div>
      </div>
    </div>
  );
}
