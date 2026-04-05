// app/builder/page.tsx
import { Suspense } from 'react';
import ProfessionalBuilder from './ProfessionalBuilder.tsx';

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#1a1429] to-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading Scorpio Builder...</p>
        </div>
      </div>
    }>
      <ProfessionalBuilder />
    </Suspense>
  );
}