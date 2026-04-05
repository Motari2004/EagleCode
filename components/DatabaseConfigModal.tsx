"use client";

import { useState } from "react";
import { X, Database, Key, AlertCircle, Check, Loader2, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (databaseUrl: string) => void;
  editDescription: string;
  isProcessing?: boolean;
}

export function DatabaseConfigModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editDescription,
  isProcessing = false 
}: DatabaseConfigModalProps) {
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("postgresql");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const providers = [
    { 
      id: "postgresql", 
      name: "PostgreSQL", 
      icon: "🐘", 
      color: "from-blue-600 to-cyan-600",
      example: "postgresql://username:password@localhost:5432/mydb",
      docs: "https://www.postgresql.org/docs/current/libpq-connect.html"
    },
    { 
      id: "mysql", 
      name: "MySQL", 
      icon: "🐬", 
      color: "from-blue-500 to-teal-500",
      example: "mysql://username:password@localhost:3306/mydb",
      docs: "https://dev.mysql.com/doc/refman/8.0/en/connecting.html"
    },
    { 
      id: "mongodb", 
      name: "MongoDB", 
      icon: "🍃", 
      color: "from-green-600 to-emerald-600",
      example: "mongodb://username:password@localhost:27017/mydb",
      docs: "https://www.mongodb.com/docs/manual/reference/connection-string/"
    },
    { 
      id: "supabase", 
      name: "Supabase", 
      icon: "⚡", 
      color: "from-emerald-500 to-green-500",
      example: "postgresql://postgres:password@db.supabase.co:5432/postgres",
      docs: "https://supabase.com/docs/guides/database/connecting-to-postgres"
    },
    { 
      id: "neon", 
      name: "Neon Tech", 
      icon: "💜", 
      color: "from-purple-500 to-pink-500",
      example: "postgresql://user:password@ep-cool-limit.cloud.neon.tech/neondb",
      docs: "https://neon.tech/docs/connect/connect-from-any-app"
    },
    { 
      id: "railway", 
      name: "Railway", 
      icon: "🚂", 
      color: "from-red-500 to-orange-500",
      example: "postgresql://postgres:password@railway.internal:5432/railway",
      docs: "https://docs.railway.app/guides/postgresql"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!databaseUrl.trim()) {
      toast.error("Please enter a valid database connection string");
      return;
    }
    
    // Basic validation
    const urlPattern = /^(postgresql|postgres|mysql|mongodb):\/\/[^\s]+$/;
    if (!urlPattern.test(databaseUrl.toLowerCase())) {
      toast.warning("Please ensure your database URL is in the correct format", {
        description: "Example: postgresql://username:password@localhost:5432/dbname",
        duration: 5000,
      });
    }
    
    onSubmit(databaseUrl);
  };

  const copyExample = () => {
    const provider = providers.find(p => p.id === selectedProvider);
    if (provider) {
      navigator.clipboard.writeText(provider.example);
      setCopied(true);
      toast.success("Example copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25">
                <Database size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">🔐 Add Authentication System</h3>
                <p className="text-xs text-purple-300 mt-0.5">Configure your database connection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Edit Request Info */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
            <p className="text-xs text-purple-300">
              <span className="font-medium">Request:</span> {editDescription}
            </p>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Database Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedProvider === provider.id
                      ? `border-purple-500 bg-gradient-to-r ${provider.color} bg-opacity-10 shadow-lg shadow-purple-500/20`
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{provider.icon}</span>
                    <span className={`text-sm font-medium ${
                      selectedProvider === provider.id ? "text-white" : "text-gray-300"
                    }`}>
                      {provider.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Database URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Database Connection String <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
              <Input
                type="text"
                value={databaseUrl}
                onChange={(e) => setDatabaseUrl(e.target.value)}
                placeholder={providers.find(p => p.id === selectedProvider)?.example}
                className="pl-10 pr-24 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={copyExample}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              This will be stored in .env.local - never commit this file to git!
            </p>
          </div>

          {/* Where to get database URL */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ExternalLink size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-400">
                <p className="font-medium mb-2">📌 Where to get your database URL?</p>
                <ul className="space-y-2 text-xs text-blue-300/80">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Local PostgreSQL:</strong> postgresql://user:pass@localhost:5432/mydb</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Supabase:</strong> Project Settings → Database → Connection string</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Neon Tech:</strong> Dashboard → Connection details → Connection string</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Railway:</strong> Dashboard → PostgreSQL → Connect → Connection URL</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* What will be generated */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
              <Database size={14} />
              AI will generate:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-300/80">
              <div className="flex items-center gap-2">✓ Login page</div>
              <div className="flex items-center gap-2">✓ Registration page</div>
              <div className="flex items-center gap-2">✓ Protected dashboard</div>
              <div className="flex items-center gap-2">✓ Auth provider context</div>
              <div className="flex items-center gap-2">✓ Route middleware</div>
              <div className="flex items-center gap-2">✓ API routes for auth</div>
              <div className="flex items-center gap-2">✓ Updated navigation</div>
              <div className="flex items-center gap-2">✓ .env.local configuration</div>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-400">
                <strong>Important Security Notes:</strong>
                <br />• Never commit .env.local to version control
                <br />• Change JWT_SECRET in production
                <br />• Use HTTPS in production
                <br />• Add rate limiting for login attempts
              </p>
            </div>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="p-5 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl px-5 py-2.5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isProcessing || !databaseUrl.trim()}
            className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-2.5 font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2 inline" />
                Configuring Database...
              </>
            ) : (
              <>
                <Database size={16} className="mr-2 inline" />
                Add Authentication System
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}