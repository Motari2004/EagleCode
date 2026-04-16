"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Loader2, CheckCircle, XCircle, UserPlus, AlertCircle, LogIn } from "lucide-react";

export default function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useUser();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "not_signed_up" | "already_exists">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(10);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirected = useRef(false);
  const hasProcessed = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
  }, []);

  // Handle redirect separately
  const handleRedirect = useCallback((path: string) => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    cleanup();
    
    // Use window.location for home redirect (more reliable on Vercel)
    if (path === "/") {
      window.location.href = path;
    } else {
      router.push(path);
    }
  }, [router, cleanup]);

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed.current) return;
    
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const type = searchParams.get("type");

    console.log("🔍 Callback params:", { token: !!token, error, type });

    if (error) {
      hasProcessed.current = true;
      const decodedError = decodeURIComponent(error);
      setErrorMessage(decodedError);
      
      if (type === "not_signed_up" || decodedError.includes("No account found")) {
        setStatus("not_signed_up");
        
        let count = 10;
        setCountdown(count);
        
        intervalRef.current = setInterval(() => {
          count -= 1;
          setCountdown(count);
          
          if (count <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            handleRedirect("/signup");
          }
        }, 1000);
        
        return;
      } 
      else if (type === "already_exists" || decodedError.includes("already exists")) {
        setStatus("already_exists");
        
        let count = 10;
        setCountdown(count);
        
        intervalRef.current = setInterval(() => {
          count -= 1;
          setCountdown(count);
          
          if (count <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            handleRedirect("/signin");
          }
        }, 1000);
        
        return;
      }
      else {
        setStatus("error");
        redirectTimeoutRef.current = setTimeout(() => {
          handleRedirect("/signin");
        }, 3000);
      }
      return;
    }

    if (token && !hasProcessed.current) {
      hasProcessed.current = true;
      localStorage.setItem("eaglecode_token", token);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = {
          id: payload.user_id,
          email: payload.email,
          name: payload.name,
          picture: payload.picture || ""
        };
        
        localStorage.setItem("eaglecode_user", JSON.stringify(userData));
        
        if (!user) {
          login(userData);
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
      
      setStatus("success");
      
      // Use window.location for more reliable redirect on Vercel
      setTimeout(() => {
        console.log("🔀 Redirecting to home page");
        window.location.href = "/";
      }, 1500);
    } else if (!error && !token && !hasProcessed.current) {
      hasProcessed.current = true;
      setStatus("error");
      setErrorMessage("No authentication token received");
      redirectTimeoutRef.current = setTimeout(() => {
        handleRedirect("/signin");
      }, 3000);
    }

    return cleanup;
  }, [searchParams, router, login, cleanup, handleRedirect, user]);

  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md p-8 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Authenticating...</h2>
          <p className="text-sm text-slate-400">Verifying your Google account</p>
        </div>
      </div>
    );
  }

  // Success State
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Successfully Signed In!</h2>
          <p className="text-sm text-slate-400">Redirecting you to EagleCode...</p>
          <div className="mt-4">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Not Signed Up State
  if (status === "not_signed_up") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <UserPlus className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Account Not Found</h2>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-400 font-medium mb-2">⚠️ {errorMessage}</p>
            <p className="text-xs text-slate-400">
              You need to create an account before you can sign in.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <AlertCircle className="w-4 h-4 animate-pulse" />
            <span className="text-sm">
              Redirecting to <span className="text-amber-400 font-medium">Sign Up</span> in <span className="text-amber-400 font-bold text-xl">{countdown}</span> seconds...
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
          <button
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              handleRedirect("/signup");
            }}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center justify-center gap-1 mx-auto"
          >
            Click here to go now →
          </button>
        </div>
      </div>
    );
  }

  // Already Exists State
  if (status === "already_exists") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <LogIn className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Account Already Exists</h2>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-400 font-medium mb-2">ℹ️ {errorMessage}</p>
            <p className="text-xs text-slate-400">
              Please sign in instead of creating a new account.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <AlertCircle className="w-4 h-4 animate-pulse" />
            <span className="text-sm">
              Redirecting to <span className="text-blue-400 font-medium">Sign In</span> in <span className="text-blue-400 font-bold text-xl">{countdown}</span> seconds...
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
          <button
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              handleRedirect("/signin");
            }}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center justify-center gap-1 mx-auto"
          >
            Click here to go now →
          </button>
        </div>
      </div>
    );
  }

  // Generic Error State
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8 text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
        <p className="text-sm text-red-400 mb-2">{errorMessage}</p>
        <p className="text-xs text-slate-500">Redirecting back to sign in...</p>
      </div>
    </div>
  );
}