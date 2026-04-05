"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // Implement Google OAuth here
    // Example with NextAuth: signIn('google', { callbackUrl: '/builder' });
    
    // Simulate sign in for demo
    setTimeout(() => {
      setIsLoading(false);
      router.push('/builder');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8">
        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="mb-8 text-slate-400 hover:text-white transition flex items-center gap-1 text-sm"
        >
          ← Back
        </button>

        {/* Sign In Card */}
        <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17.5V6.5L17 17.5V6.5" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-sm text-slate-400">Sign in to continue building amazing projects</p>
          </div>

          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-11 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all duration-200 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-slate-500">or</span>
            </div>
          </div>

          {/* Email Sign In (optional) */}
          <p className="text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 transition">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}