// app/builder/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ProfessionalBuilder from './ProfessionalBuilder';

export default function BuilderPage() {
  const [showLoading, setShowLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress increases from 0 to 100 over 4 seconds
    const startTime = Date.now();
    const duration = 4000; // 4 seconds
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => setShowLoading(false), 100);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0a1a] to-[#1a0a2a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Logo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-5xl">🦅</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            EagleCode Builder
          </h2>

          {/* Progress Bar - ONE TIME, NO REPEAT */}
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percentage */}
          <p className="text-xs text-slate-500 font-mono">{Math.floor(progress)}%</p>

          {/* Loading Steps - Fade in sequentially */}
          <div className="space-y-2 mt-4">
            <div className={`flex items-center gap-3 text-sm transition-all duration-500 ${progress >= 0 ? 'text-purple-400' : 'text-slate-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${progress >= 0 ? 'bg-purple-500' : 'bg-slate-600'}`} />
              <span className={progress >= 0 ? 'text-white' : 'text-slate-600'}>Initializing AI Engine...</span>
              {progress >= 0 && <span className="text-green-500 text-xs ml-auto">✓</span>}
            </div>
            
            <div className={`flex items-center gap-3 text-sm transition-all duration-500 ${progress >= 33 ? 'text-pink-400' : 'text-slate-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${progress >= 33 ? 'bg-pink-500' : 'bg-slate-600'}`} />
              <span className={progress >= 33 ? 'text-white' : 'text-slate-600'}>Loading Components...</span>
              {progress >= 33 && <span className="text-green-500 text-xs ml-auto">✓</span>}
            </div>
            
            <div className={`flex items-center gap-3 text-sm transition-all duration-500 ${progress >= 66 ? 'text-amber-400' : 'text-slate-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${progress >= 66 ? 'bg-amber-500' : 'bg-slate-600'}`} />
              <span className={progress >= 66 ? 'text-white' : 'text-slate-600'}>Preparing Workspace...</span>
              {progress >= 66 && <span className="text-green-500 text-xs ml-auto">✓</span>}
            </div>
          </div>

          {/* Animated Dots */}
          <div className="flex gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  return <ProfessionalBuilder />;
}