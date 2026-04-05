"use client";
import { useState } from "react";
import { FileCode, Folder, Hash, Layers } from "lucide-react";

export function FileExplorer({ files }: { files: Record<string, string> }) {
  const filePaths = Object.keys(files);
  const [activeFile, setActiveFile] = useState(filePaths[0] || "");

  if (filePaths.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 bg-slate-950 font-mono">
        Waiting for project architecture...
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#1e1e1e] border rounded-xl overflow-hidden shadow-2xl">
      {/* Sidebar: File Tree */}
      <div className="w-64 bg-[#252526] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Layers size={14} className="text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explorer</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filePaths.map((path) => (
            <button
              key={path}
              onClick={() => setActiveFile(path)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all ${
                activeFile === path 
                  ? "bg-indigo-600 text-white shadow-lg" 
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
        <div className="h-10 bg-[#2d2d2d] flex items-center px-6 border-b border-white/5 gap-2">
          <span className="text-[10px] font-mono text-indigo-300">{activeFile}</span>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-[#1e1e1e] custom-scrollbar">
          <pre className="text-sm font-mono leading-relaxed text-indigo-100/90 whitespace-pre-wrap">
            <code>{files[activeFile]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}