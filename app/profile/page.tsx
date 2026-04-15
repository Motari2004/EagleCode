"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import {
  User, Mail, Calendar, Settings, LogOut, Shield, Star, Code2,
  FolderGit2, Award, Clock, Edit3, Save, X, CheckCircle2, Loader2,
  Sparkles, Rocket, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user, logout, token } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    projectsCreated: 0,
    filesGenerated: 0,
    memberSince: "",
    aiEdits: 0
  });

  useEffect(() => {
    if (!user && !token) {
      router.push("/signin");
    }
    if (user) {
      loadUserStats();
    }
  }, [user, token, router]);

  const loadUserStats = () => {
    // Load stats from localStorage
    const projects = localStorage.getItem("scorpioSavedProjects");
    const projectCount = projects ? JSON.parse(projects).length : 0;
    
    setStats({
      projectsCreated: projectCount,
      filesGenerated: projectCount * 12,
      memberSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      aiEdits: Math.floor(Math.random() * 50) + 10
    });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              🦅
            </div>
            <span className="font-bold text-sm tracking-tight">Eagle<span className="text-amber-500">Code</span></span>
          </button>
          
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        
        {/* Profile Header Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.05)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
            </div>
            
            {/* Profile Info */}
            <div className="px-8 pb-8 relative">
              {/* Avatar */}
              <div className="flex justify-between items-start">
                <div className="-mt-16">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-28 h-28 rounded-2xl ring-4 ring-cyan-500/30 shadow-2xl object-cover"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-2xl">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Name and Email */}
              <div className="mt-6">
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                
                <div className="flex items-center gap-2 mt-2 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                  <FolderGit2 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.projectsCreated}</p>
                  <p className="text-xs text-slate-400">Projects</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                  <Code2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.filesGenerated.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Files Generated</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                  <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.aiEdits}</p>
                  <p className="text-xs text-slate-400">AI Edits</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                  <Calendar className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">{stats.memberSince}</p>
                  <p className="text-xs text-slate-400">Member Since</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Sections */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            
            {/* Account Settings Card */}
            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Account Settings</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-slate-400">Email Verification</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Verified</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-slate-400">Account Type</span>
                  <span className="text-xs px-2 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full">Premium</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-400">2-Factor Auth</span>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300">Enable</button>
                </div>
              </div>
            </div>
            
            {/* Activity Card */}
            <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Created new project</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Used AI Edit feature</p>
                    <p className="text-xs text-slate-500">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Deployed project to Vercel</p>
                    <p className="text-xs text-slate-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back to Landing Page Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}