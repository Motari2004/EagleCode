"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import {
  User, Mail, Calendar, Settings, LogOut, Shield, Star, Code2,
  FolderGit2, Award, Clock, Edit3, Save, X, CheckCircle2, Loader2,
  Sparkles, Rocket, Home, Zap, TrendingUp, Gift, CreditCard, Zap as ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, logout, token } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [credits, setCredits] = useState({
    
    dailyRemaining: 0,
    monthlyRemaining: 0,
    dailyLimit: 5,
    monthlyLimit: 30,
    plan: 'free',
    isLoading: true
  });
  const [stats, setStats] = useState({
    projectsCreated: 0,
    memberSince: ""
  });

  useEffect(() => {
    if (!user && !token) {
      router.push("/signin");
      return;
    }
    if (user) {
      setUsername(user.name || "");
      loadCredits();
      loadStats();
    }
  }, [user, token, router]);

  const loadCredits = async () => {
    try {
      console.log("Loading credits for user:", user?.id);
      const authToken = localStorage.getItem("eaglecode_token");
      
      if (!authToken) {
        console.error("No auth token found");
        setCredits(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://eaglecode2-2.onrender.com';
      
      const cacheBuster = Date.now();
      
      const response = await fetch(`${backendUrl}/api/credits?user_id=${user?.id}&_=${cacheBuster}`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      console.log("Credits response status:", response.status);
      const data = await response.json();
      console.log("Full credits data from API:", data);
      
      if (response.ok && data.success !== false) {
        console.log("Plan from API:", data.plan);
        
        setCredits({
          dailyRemaining: data.dailyRemaining ?? 0,
          monthlyRemaining: data.monthlyRemaining ?? 0,
          dailyLimit: data.dailyLimit ?? 5,
          monthlyLimit: data.monthlyLimit ?? 30,
          plan: data.plan ?? 'free',
          isLoading: false
        });
        
        localStorage.setItem('user_plan', data.plan);
        
      } else {
        console.error("Failed to load credits:", data);
        setCredits(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Failed to load credits:", error);
      setCredits(prev => ({ ...prev, isLoading: false }));
    }
  };

  // ✅ FIXED: Use backendUrl instead of hardcoded localhost
  const loadStats = async () => {
    try {
      const authToken = localStorage.getItem("eaglecode_token");
      
      if (!authToken) {
        console.error("No auth token found for stats");
        setStats({
          projectsCreated: 0,
          memberSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
        });
        setIsLoading(false);
        return;
      }
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://eaglecode2-2.onrender.com';
      
      console.log("📊 Fetching projects from:", `${backendUrl}/api/get-projects?limit=100`);
      
      const response = await fetch(`${backendUrl}/api/get-projects?limit=100`, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("📊 Projects response status:", response.status);
      
      const data = await response.json();
      console.log("📊 Projects data:", data);
      
      let projects = [];
      if (data.success && data.projects) {
        projects = data.projects;
      } else if (Array.isArray(data)) {
        projects = data;
      } else if (data.projects && Array.isArray(data.projects)) {
        projects = data.projects;
      }
      
      console.log(`📊 Found ${projects.length} projects`);
      
      // Calculate member since from the oldest project or use current date
      let memberSince = "";
      if (projects.length > 0) {
        const oldestProject = projects.reduce((oldest: any, p: any) => {
          const pDate = new Date(p.timestamp);
          const oldestDate = new Date(oldest.timestamp);
          return pDate < oldestDate ? p : oldest;
        }, projects[0]);
        
        if (oldestProject?.timestamp) {
          memberSince = new Date(oldestProject.timestamp).toLocaleDateString("en-US", { 
            month: "long", 
            year: "numeric" 
          });
        }
      }
      
      if (!memberSince) {
        memberSince = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
      }
      
      setStats({
        projectsCreated: projects.length,
        memberSince: memberSince
      });
      
    } catch (error) {
      console.error("Failed to load stats:", error);
      setStats({
        projectsCreated: 0,
        memberSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    setIsEditing(false);
    toast.success("Username updated!", { duration: 2000 });
  };

  const getPlanColor = () => {
    switch (credits.plan) {
      case 'free': return 'from-slate-500 to-slate-600';
      case 'pro': return 'from-cyan-500 to-blue-500';
      case 'business': return 'from-purple-500 to-pink-500';
      default: return 'from-cyan-500 to-purple-500';
    }
  };

  const getPlanName = () => {
    switch (credits.plan) {
      case 'free': return 'Free';
      case 'pro': return 'Pro';
      case 'business': return 'Business';
      default: return credits.plan || 'Free';
    }
  };














  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }











  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0f0f1a] to-[#1a1429]">
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              🦅
            </div>
            <span className="font-bold text-sm tracking-tight">
              <span className="text-white">Eagle</span>
              <span className="text-amber-500">Code</span>
            </span>
          </button>
          
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="border-red-500/40 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/60 text-red-400 font-medium rounded-lg px-4 py-1.5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 group"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-12 transition-transform duration-300" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        
        <div className="max-w-4xl mx-auto">
          





          






          
{/* Loading State - Premium */}
{isLoading || credits.isLoading ? (
  <div className="flex items-center justify-center py-20">
    
    <div className="relative w-full max-w-md">
      
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-2xl rounded-3xl animate-pulse" />

      {/* Glass card */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">

        {/* Animated logo */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-bounce">
          🦅
        </div>

        {/* Shimmer bar (fake loading content) */}
        <div className="mt-6 space-y-3">
          <div className="h-3 w-2/3 mx-auto bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-1/2 mx-auto bg-white/10 rounded animate-pulse delay-150" />
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-1 mt-5">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-150" />
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-300" />
        </div>

        {/* Text */}
        <p className="text-sm text-slate-400 mt-4 tracking-wide">
          Loading your data...
        </p>
      </div>
    </div>
  </div>














          ) : (
            <>
              {/* Profile Header Card */}
              <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.05)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
                  <div className="absolute -bottom-10 left-8">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-28 h-28 rounded-2xl ring-4 ring-cyan-500/30 shadow-2xl object-cover bg-slate-800"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-2xl ring-4 ring-cyan-500/30">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="px-8 pb-8 pt-14">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-white/10 border-white/20 text-white text-xl font-bold h-12 w-64"
                            autoFocus
                          />
                          <button
                            onClick={handleUpdateUsername}
                            className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition"
                          >
                            <Save className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setUsername(user.name || "");
                            }}
                            className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </div>
                    







                  </div>
                  






                  
                  {/* Credits Section */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <ZapIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-slate-400">Daily Credits</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {credits.dailyLimit - credits.dailyRemaining}/{credits.dailyLimit}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">{credits.dailyRemaining} remaining today</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-slate-400">Monthly Credits</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {credits.monthlyLimit - credits.monthlyRemaining}/{credits.monthlyLimit}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">{credits.monthlyRemaining} remaining this month</p>
                    </div>
                  </div>
                  
                  {/* Simple Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <FolderGit2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                      <p className="text-xl font-bold text-white">{stats.projectsCreated}</p>
                      <p className="text-[10px] text-slate-400">Projects</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Calendar className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-white">{stats.memberSince}</p>
                      <p className="text-[10px] text-slate-400">Member Since</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Account Settings Card */}
              <div className="mt-6 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Account Settings</h2>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-slate-400">Email Verification</span>
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-400">Current Plan</span>
                    <span className={`text-xs px-3 py-1 bg-gradient-to-r ${getPlanColor()} text-white rounded-full font-medium uppercase`}>
                      {getPlanName()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Upgrade Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => router.push("/pricing")}
                  className="px-9 py-4.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
              
              {/* Back to Home Button */}
              <div className="mt-3 flex justify-center">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="px-6 py-2.5 border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back Home
                </Button>
              </div>

            </>
          )}
        </div>
      </main>
    </div>
  );
}