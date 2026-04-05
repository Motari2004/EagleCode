"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, AlertCircle, CheckCircle2, X, ExternalLink } from "lucide-react";

interface DatabaseUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  isProcessing?: boolean;
  promptText: string;
}

export function DatabaseUrlModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isProcessing = false,
  promptText 
}: DatabaseUrlModalProps) {
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [error, setError] = useState("");
  const [dbType, setDbType] = useState<"postgresql" | "mysql" | "mongodb" | "supabase">("postgresql");

  if (!isOpen) return null;

  const validateUrl = (url: string): boolean => {
    try {
      // Check if it's a valid database URL format
      const urlPatterns = {
        postgresql: /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[\w-]+$/,
        mysql: /^mysql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[\w-]+$/,
        mongodb: /^mongodb:\/\/[^:]+:[^@]+@[^:]+:\d+\/[\w-]+$/,
        supabase: /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/postgres$/
      };
      
      return urlPatterns[dbType].test(url);
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!databaseUrl.trim()) {
      setError("Database URL is required");
      return;
    }
    
    if (!validateUrl(databaseUrl)) {
      setError(`Invalid ${dbType.toUpperCase()} URL format. Please check your connection string.`);
      return;
    }
    
    setError("");
    onSubmit(databaseUrl);
  };

  const getExampleUrl = () => {
    switch(dbType) {
      case "postgresql":
        return "postgresql://username:password@localhost:5432/mydb";
      case "mysql":
        return "mysql://username:password@localhost:3306/mydb";
      case "mongodb":
        return "mongodb://username:password@localhost:27017/mydb";
      case "supabase":
        return "postgresql://postgres:password@db.supabase.co:5432/postgres";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Database Required</h2>
              <p className="text-sm text-gray-400">Authentication system needs a database</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Prompt Preview */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-400 font-semibold mb-1">Your Request:</p>
            <p className="text-sm text-white">{promptText}</p>
          </div>

          {/* Database Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Database Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "postgresql", label: "PostgreSQL", icon: "🐘" },
                { id: "mysql", label: "MySQL", icon: "🐬" },
                { id: "mongodb", label: "MongoDB", icon: "🍃" },
                { id: "supabase", label: "Supabase", icon: "⚡" }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setDbType(type.id as any)}
                  className={`p-2 rounded-lg border transition-all ${
                    dbType === type.id
                      ? "border-purple-500 bg-purple-500/20 text-white"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Database URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Database Connection URL
            </label>
            <Input
              type="text"
              value={databaseUrl}
              onChange={(e) => {
                setDatabaseUrl(e.target.value);
                setError("");
              }}
              placeholder={getExampleUrl()}
              className="bg-black/40 border-white/10 text-white font-mono text-sm"
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={12} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-400">
                <p className="font-semibold mb-1">Where to get a database?</p>
                <ul className="space-y-1 text-yellow-300/80">
                  <li>• <strong>Neon</strong> (Free PostgreSQL) - <a href="https://neon.tech" target="_blank" className="underline hover:text-yellow-300">neon.tech</a></li>
                  <li>• <strong>Supabase</strong> (Free PostgreSQL) - <a href="https://supabase.com" target="_blank" className="underline hover:text-yellow-300">supabase.com</a></li>
                  <li>• <strong>MongoDB Atlas</strong> (Free) - <a href="https://mongodb.com/atlas" target="_blank" className="underline hover:text-yellow-300">mongodb.com/atlas</a></li>
                  <li>• <strong>Railway</strong> (Free tier) - <a href="https://railway.app" target="_blank" className="underline hover:text-yellow-300">railway.app</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle2 size={12} />
              <span>Your database URL will be stored in .env.local and never committed to git</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Database size={16} className="mr-2" />
                  Continue with Database
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}