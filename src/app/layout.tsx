import type { Metadata } from 'next';
import './globals.css';
import { SessionProviderWrapper } from '@/components/providers/SessionProviderWrapper';

export const metadata: Metadata = {
  title: 'Gamma 5 — AI Presentations, Webpages, Documents & Agent Workspace',
  description:
    'A new medium for presenting ideas, powered by the Gamma 5 Conversational Agent, Fluid Smart Layouts, and Enterprise Governance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
