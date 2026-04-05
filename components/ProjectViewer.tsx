"use client";

import { useState } from "react";
import { FileCode, Folder, Hash, Layers, Code } from "lucide-react";

export default function ProjectViewer({ files }: { files: Record<string, string> }) {
  const filePaths = Object.keys(files);
  const [activeFile, setActiveFile] = useState(filePaths[0] || "");

  if (filePaths.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 bg-slate-950 font-mono text-sm border rounded-xl border-white/5">
        <div className="flex flex-col items-center gap-2">
          <Code className="animate-pulse" size={24} />
          <span>Waiting for AI project generation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0D1117] border rounded-xl overflow-hidden border-white/10 shadow-2xl">
      {/* Sidebar: File Tree */}
      <div className="w-56 bg-[#161B22] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Layers size={14} className="text-blue-400" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {filePaths.map((path) => (
            <button
              key={path}
              onClick={() => setActiveFile(path)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition-all mb-1 ${
                activeFile === path 
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {path.endsWith(".css") ? <Hash size={14} /> : <FileCode size={14} />}
              <span className="truncate">{path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor: Code View */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-10 bg-[#0D1117] flex items-center px-6 border-b border-white/5">
          <span className="text-[11px] font-mono text-blue-300 opacity-80">{activeFile}</span>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-[#0D1117]">
          <pre className="text-sm font-mono leading-relaxed text-blue-100/90 whitespace-pre-wrap">
            <code>{files[activeFile]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}