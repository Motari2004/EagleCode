// components/ReplaceModal.tsx
import React, { useState } from 'react';
import { X, FileText, Layout, FileCode, Check, AlertCircle, Home, Menu, Footer } from 'lucide-react';

interface ReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFile: string | null, editAll: boolean) => void;
  files: string[];
  oldText: string;
  newText: string;
  isPartialMatch?: boolean;
  fileContext?: Array<{
    file_path: string;
    display_name: string;
    description: string;
    route?: string;
    snippet?: string;
  }>;
}

const ReplaceModal: React.FC<ReplaceModalProps> = ({
  isOpen, onClose, onConfirm, files, oldText, newText, isPartialMatch = false, fileContext = []
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [editAll, setEditAll] = useState(false);

  if (!isOpen) return null;

  const getFileIcon = (path: string) => {
    if (path.includes('layout.tsx')) return <Layout size={16} className="text-purple-400" />;
    if (path.includes('page.tsx')) {
      if (path.includes('app/page.tsx')) return <Home size={16} className="text-green-400" />;
      return <FileCode size={16} className="text-blue-400" />;
    }
    if (path.includes('Navigation')) return <Menu size={16} className="text-yellow-400" />;
    if (path.includes('Footer')) return <Footer size={16} className="text-orange-400" />;
    return <FileText size={16} className="text-gray-400" />;
  };

  const getFileBadge = (path: string) => {
    if (path.includes('layout.tsx')) return <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Layout</span>;
    if (path.includes('app/page.tsx')) return <span className="text-[9px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">Home</span>;
    if (path.includes('/page.tsx')) {
      const route = path.replace('app/', '').replace('/page.tsx', '');
      return <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">/{route}</span>;
    }
    if (path.includes('Navigation')) return <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">Nav</span>;
    if (path.includes('Footer')) return <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">Footer</span>;
    return null;
  };

  // Get display name from context or generate from path
  const getDisplayName = (path: string) => {
    const context = fileContext.find(c => c.file_path === path);
    if (context?.display_name) return context.display_name;
    
    if (path.includes('layout.tsx')) return 'Global Layout';
    if (path.includes('app/page.tsx')) return 'Homepage';
    if (path.includes('/page.tsx')) {
      const route = path.replace('app/', '').replace('/page.tsx', '');
      return route.charAt(0).toUpperCase() + route.slice(1) + ' Page';
    }
    return path.split('/').pop()?.replace('.tsx', '').replace('.jsx', '') || path;
  };

  const getDescription = (path: string) => {
    const context = fileContext.find(c => c.file_path === path);
    if (context?.description) return context.description;
    
    if (path.includes('layout.tsx')) return 'Affects all pages - layout structure';
    if (path.includes('app/page.tsx')) return 'Main landing page content';
    if (path.includes('/page.tsx')) {
      const route = path.replace('app/', '').replace('/page.tsx', '');
      return `Page content for /${route}`;
    }
    return 'Source file';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-2xl max-w-md w-full p-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Replace Text</h2>
              <p className="text-xs text-gray-400">{files.length} file(s) contain this text</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Text Comparison - Collapsed */}
        <details className="mb-3">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
            Show text to replace
          </summary>
          <div className="mt-2 space-y-2">
            <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
              <p className="text-[10px] text-red-400 font-semibold">OLD</p>
              <p className="text-xs text-red-300 font-mono break-words line-clamp-2">{oldText}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
              <p className="text-[10px] text-green-400 font-semibold">NEW</p>
              <p className="text-xs text-green-300 font-mono break-words line-clamp-2">{newText}</p>
            </div>
          </div>
        </details>

        {/* File Selection */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-white mb-2">Select file to edit:</p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {files.map((file) => (
              <label
                key={file}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                  selectedFile === file && !editAll ? 'bg-purple-500/20 border-purple-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => { setSelectedFile(file); setEditAll(false); }}
              >
                <input 
                  type="radio" 
                  name="fileSelection" 
                  checked={selectedFile === file && !editAll}
                  onChange={() => { setSelectedFile(file); setEditAll(false); }} 
                  className="w-3.5 h-3.5" 
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <p className="text-xs font-medium text-white">{getDisplayName(file)}</p>
                    {getFileBadge(file)}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{getDescription(file)}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Edit All Option */}
        <label
          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all mb-3 ${
            editAll ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
          onClick={() => { setEditAll(true); setSelectedFile(null); }}
        >
          <input 
            type="checkbox" 
            checked={editAll} 
            onChange={() => { setEditAll(!editAll); if (!editAll) setSelectedFile(null); }} 
            className="w-3.5 h-3.5 rounded" 
          />
          <FileText size={14} className="text-blue-400" />
          <div>
            <p className="text-xs font-medium text-white">Edit All Files</p>
            <p className="text-[10px] text-gray-400">Replace in all {files.length} files</p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10">
            Cancel
          </button>
          <button
            onClick={() => editAll ? onConfirm(null, true) : selectedFile && onConfirm(selectedFile, false)}
            disabled={!editAll && !selectedFile}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
              editAll || selectedFile ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90' : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check size={14} /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplaceModal;