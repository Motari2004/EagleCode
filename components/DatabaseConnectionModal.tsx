"use client";

import React, { useState } from 'react';
import { X, Loader2, Database, ExternalLink } from 'lucide-react';

interface DatabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (connectionString: string) => void;
  message?: string;
  instruction?: string;
  example?: string;
  isConnecting?: boolean;
}

export default function DatabaseConnectionModal({
  isOpen,
  onClose,
  onSubmit,
  message,
  instruction,
  example,
  isConnecting = false
}: DatabaseConnectionModalProps) {
  const [connectionString, setConnectionString] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!connectionString.trim()) {
      setError('Please enter your Neon connection string');
      return;
    }
    
    if (!connectionString.startsWith('postgresql://')) {
      setError('Must start with postgresql://');
      return;
    }
    
    setError('');
    onSubmit(connectionString);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Compact Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-2xl max-w-md w-full p-5 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
        
        {/* Icon - Smaller */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/30">
          <Database size={20} className="text-white" />
        </div>
        
        {/* Title - Smaller */}
        <h3 className="text-lg font-bold text-center text-white mb-2">
          Neon Database Required
        </h3>
        
        {/* Message - Compact */}
        <p className="text-xs text-slate-400 text-center mb-3">
          {message || "Authentication requires a Neon database"}
        </p>
        
        {/* Quick link */}
        <div className="text-center mb-3">
          <a 
            href="https://console.neon.tech" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            Get free Neon database <ExternalLink size={10} />
          </a>
        </div>
        
        {/* Input */}
        <div className="mb-3">
          <input
            type="text"
            value={connectionString}
            onChange={(e) => {
              setConnectionString(e.target.value);
              setError('');
            }}
            placeholder="postgresql://user:pass@host/db?sslmode=require"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white text-xs font-mono"
          />
          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}
        </div>
        
        {/* Example toggle - Compact */}
        <button
          onClick={() => setShowExample(!showExample)}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors mb-3"
        >
          {showExample ? 'Hide example' : 'Show example'}
        </button>
        
        {showExample && (
          <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700 mb-3">
            <code className="text-[10px] text-green-400 break-all">
              {example || "postgresql://alex:pass@ep-cool.neon.tech/neondb?sslmode=require"}
            </code>
          </div>
        )}
        
        {/* Buttons - Compact */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isConnecting}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Connecting...
              </span>
            ) : (
              'Connect'
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-all duration-300"
          >
            Cancel
          </button>
        </div>
        
        {/* Note - Tiny */}
        <p className="text-center text-[10px] text-slate-500 mt-3">
          Your data stays in your own database
        </p>
      </div>
    </div>
  );
}