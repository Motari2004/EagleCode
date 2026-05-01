// components/PageTransition.tsx
"use client";

import { Loader2 } from "lucide-react";

export default function PageTransition({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050507] flex items-center justify-center">
      
      {/* Glow background */}
      <div className="absolute w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />

      {/* Content */}
      <div className="relative flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-xl">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>

        <p className="text-sm text-slate-400 mt-4 animate-pulse">
          Loading your profile...
        </p>
      </div>
    </div>
  );
}