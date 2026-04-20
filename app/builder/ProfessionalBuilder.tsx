"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useBuild } from "@/hooks/useBuild";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { Bot,ArrowRight } from "lucide-react";





import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatabaseConfigModal } from "@/components/DatabaseConfigModal";
import { DeployModal } from "@/components/DeployModal";
import {
  Send, Loader2, FileCode, FolderTree, Download,
  Terminal, Copy, Check, Globe, RefreshCw,
  Sparkles, Layers, Search, Code2, Activity, CheckCircle2,
  Maximize2, Minimize2, X, AlertCircle, Folder, FolderOpen,  Rocket, Save, Trash2, Edit3, Target, Zap, Shield, Code, Star, Coffee, Clock,CheckCircle
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SavedProject {
  id: string;
  name: string;
  prompt: string;
  files: Record<string, string>;
  preview_html: string;  // Keep for backward compatibility, but will be deprecated
  preview_url?: string;   // NEW: Cloudinary URL for preview HTML
  thumbnail_url?: string; // NEW: Cloudinary URL for thumbnail (was thumbnail_base64)
  files_url?: string;     // NEW: Cloudinary URL for ZIP file
  timestamp: string;
  project_type?: string;
}




// Add this interface to define the binary image type
interface BinaryImage {
  __type: 'binary_image';
  data: Uint8Array;
  blobUrl: string;
  filename: string;
  size: number;
}













const getPreviewHTML = (htmlContent: string) => {
  if (!htmlContent || htmlContent.trim() === "") {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Scorpio Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: linear-gradient(135deg, #020617 0%, #0a0f2a 100%);
              min-height: 100vh;
              font-family: 'Inter', system-ui, sans-serif;
              color: #94a3b8;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 5rem; margin-bottom: 1rem;">🚀</div>
            <h1 style="font-size: 2rem; margin-bottom: 0.5rem; color: #3b82f6;">Scorpio Preview</h1>
            <p>Your Next.js + TypeScript multi-page project will appear here once generated.</p>
          </div>
        </body>
      </html>
    `;
  }

  // Check if the content already has a full HTML structure
  const hasFullHtml = htmlContent.includes('<!DOCTYPE html>') || 
                      htmlContent.includes('<html') ||
                      htmlContent.includes('<head') ||
                      htmlContent.includes('<body');
  
  if (hasFullHtml) {
    // Return as-is - it's already a complete HTML document
    return htmlContent;
  }
  
  // If it's just HTML fragment, wrap it properly
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scorpio Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', system-ui, sans-serif;
            background: radial-gradient(ellipse at top, #0a0212 0%, #1a052a 50%, #0a0212 100%);
            color: #e2e8f0;
            min-height: 100vh;
        }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
};







// Hierarchical File Tree Component
function FileTree({
  files,
  searchTerm,
  activeFile,
  generatingFile,
  generationLog,
  onFileSelect,
  onQuickEdit,
  isEditMode
}: {
  files: Record<string, any>;
  searchTerm: string;
  activeFile: string;
  generatingFile: string | null;
  generationLog: any[];
  onFileSelect: (path: string) => void;
  onQuickEdit?: (path: string) => void;
  isEditMode?: boolean;
}) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const buildTree = (filePaths: string[]) => {
    const tree: any = { folders: {}, files: [] };
    filePaths.forEach(path => {
      const parts = path.split('/');
      let current = tree;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          if (!current.files) current.files = [];
          current.files.push({ name: part, fullPath: path });
        } else {
          if (!current.folders) current.folders = {};
          if (!current.folders[part]) current.folders[part] = { folders: {}, files: [] };
          current = current.folders[part];
        }
      });
    });
    return tree;
  };

  const filePaths = Object.keys(files).filter(f => f !== "preview_html");
  const filteredPaths = filePaths.filter(path => 
    path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const treeData = buildTree(filteredPaths);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const renderTree = (node: any, currentPath: string = "") => {
    return (
      <div className="pl-1">
        {/* Render Folders */}
        {node.folders && Object.keys(node.folders).map(folderName => {
          const folderFullPath = currentPath ? `${currentPath}/${folderName}` : folderName;
          const isExpanded = expandedFolders[folderFullPath] !== false;

          return (
            <div key={folderFullPath} className="mb-1">
              <button
                onClick={() => toggleFolder(folderFullPath)}
                className="w-full flex items-center gap-2 py-1.5 px-3 hover:bg-white/5 rounded-xl text-left text-sm text-slate-300 font-medium"
              >
                {isExpanded ? <FolderOpen size={16} className="text-blue-400" /> : <Folder size={16} className="text-slate-400" />}
                <span className="truncate">{folderName}</span>
              </button>
              {isExpanded && renderTree(node.folders[folderName], folderFullPath)}
            </div>
          );
        })}

        {/* Render Files */}
        {node.files && Array.isArray(node.files) && node.files.map((file: { name: string; fullPath: string }, index: number) => {
          const isGenerating = generatingFile === file.fullPath;
          const isComplete = generationLog.some(log => log.file === file.fullPath && log.status === 'complete');
          const isActive = activeFile === file.fullPath;

          return (
            <div
              key={file.fullPath + index}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] flex items-center gap-3 transition-all relative group hover:bg-white/5 cursor-pointer ${isActive ? 'bg-blue-500/10' : ''}`}
              onClick={() => onFileSelect(file.fullPath)}
            >
              {isGenerating && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
              )}
              <FileCode size={16} className={isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400"} />
              <span className={`truncate flex-1 font-mono text-[12px] ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`}>
                {file.name}
              </span>
              {isGenerating && <Loader2 size={12} className="animate-spin text-blue-500 ml-auto" />}
              {isComplete && !isGenerating && <CheckCircle2 size={12} className="text-green-500 ml-auto" />}
              {onQuickEdit && !isGenerating && !isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickEdit(file.fullPath);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-yellow-500/20 rounded-lg transition-all"
                  title="Quick edit this file"
                >
                  <Zap size={12} className="text-yellow-500" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (filteredPaths.length === 0) {
    return <div className="text-center py-12 text-slate-500 text-sm">No files found</div>;
  }

  return <div className="space-y-1">{renderTree(treeData)}</div>;
}

export default function ProfessionalBuilder() {
  const searchParams = useSearchParams();
    const { user } = useUser(); // Add this line
  const [prompt, setPrompt] = useState("");
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "preview">("preview");
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
const [pendingEditDescription, setPendingEditDescription] = useState("");
const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);


  // ========== ADD THESE TWO LINES HERE ==========
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  // =============================================




  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);


























  





 const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';















const iframeReady = useRef(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const isPreviewNavigating = useRef(false);
  const [editPrompt, setEditPrompt] = useState("");

  const [loadedFiles, setLoadedFiles] = useState<Record<string, string> | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);

  const {
    files: buildFiles,
    setFiles: setBuildFiles,
    isBuilding,
    progress,
    startBuild,
    currentFile: generatingFile,
    generationLog,
    error: buildError,
  } = useBuild();

  const files = loadedFiles || buildFiles;

  const [activeFile, setActiveFile] = useState("");
  const [copied, setCopied] = useState(false);
  const [virtualPath, setVirtualPath] = useState("/");
  const [currentTerminalMessage, setCurrentTerminalMessage] = useState<{file: string, status: 'generating' | 'complete'} | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFileTree, setShowFileTree] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [navigationHistory, setNavigationHistory] = useState<string[]>(["/"]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPreviewDelayed, setShowPreviewDelayed] = useState(false); // ADD THIS LINE
  







const hasAutoStarted = useRef(false);
const lastSavedBuildId = useRef<string | null>(null);
const iframeRef = useRef<HTMLIFrameElement>(null);
const terminalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const debouncePreviewRef = useRef<NodeJS.Timeout | null>(null);
const codeContainerRef = useRef<HTMLDivElement>(null);
const savedProjectsRef = useRef<SavedProject[]>([]);  // 👈 ADD THIS LINE


const [isSaving, setIsSaving] = useState(false);

const isSavingRef = useRef(false);




// Add this with your other useState declarations (around line 200-250)
const [isMobile, setIsMobile] = useState(false);


const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);








// Add with your other useState declarations
const [credits, setCredits] = useState({
  dailyRemaining: 0,
  monthlyRemaining: 0,
  dailyLimit: 0,
  monthlyLimit: 0,
  plan: 'free',
  isLoading: true
});
const [isCheckingCredits, setIsCheckingCredits] = useState(false);

















// Credit check function
const checkAndDeductCredits = async (creditsToDeduct: number, action: string) => {
  console.log("🔍 checkAndDeductCredits called!", { creditsToDeduct, action });
  
  if (!user) {
    console.log("❌ No user found!");
    toast.error("Please sign in to continue", {
      style: {
        background: '#1e1b4b',
        color: '#fff',
        border: '1px solid rgba(139, 92, 246, 0.3)',
      },
      icon: '🔐',
    });
    return false;
  }

  console.log("👤 User ID:", user.id);

  try {
    console.log("📡 Checking credits for user:", user.id);
    const checkResponse = await fetch(`/api/credits?userId=${user.id}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const creditData = await checkResponse.json();
    console.log("📡 Credit data:", creditData);
    
    if (!checkResponse.ok) {
      console.log("❌ Credit check failed:", creditData);
      toast.error("Failed to check credits");
      return false;
    }
    












     // ========== CHECK FOR INSUFFICIENT CREDITS ==========
    if (creditData.dailyRemaining < creditsToDeduct) {
      console.log("❌ Insufficient daily credits:", creditData.dailyRemaining);
      
      // Show modal instead of toast
      setShowUpgradeModal(true);
      return false;
    }
    
    if (creditData.monthlyRemaining < creditsToDeduct) {
      console.log("❌ Insufficient monthly credits:", creditData.monthlyRemaining);
      
      // Show modal instead of toast
      setShowUpgradeModal(true);
      return false;
    }
    
    // ========== LOW CREDIT WARNINGS ==========
    if (creditData.dailyRemaining === 1) {
      toast.warning(`Only 1 Credit Left!`, {
        description: `After this ${action}, you'll have 0 credits. Consider upgrading to Pro for unlimited credits.`,
        duration: 8000,
        position: "top-center",
        style: {
          background: 'linear-gradient(135deg, #1e1b4b, #2d1b69)',
          color: '#fff',
          border: '1px solid rgba(245, 158, 11, 0.5)',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        },
        icon: '⚠️',
        action: {
          label: "Upgrade 💎",
          onClick: () => window.location.href = "/pricing"
        }
      });
    }
    
    if (creditData.dailyRemaining >= 2 && creditData.dailyRemaining <= 3) {
      toast.warning(`Low on Credits!`, {
        description: `Only ${creditData.dailyRemaining} credits left today. Upgrade to Pro for more credits.`,
        duration: 5000,
        position: "top-center",
        style: {
          background: 'linear-gradient(135deg, #1e1b4b, #2d1b69)',
          color: '#fff',
          border: '1px solid rgba(245, 158, 11, 0.5)',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        },
        icon: '⚠️',
        action: {
          label: "Upgrade 🚀",
          onClick: () => window.location.href = "/pricing"
        }
      });
    }
    
    console.log("✅ Credits available, deducting...");
    const deductResponse = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: user.id, 
        credits: creditsToDeduct 
      })
    });
    
    const deductData = await deductResponse.json();
    console.log("📡 Deduct response:", deductData);
    
    if (deductResponse.ok) {
      await loadCredits();
      
      toast.success(`Credits Deducted!`, {
        description: `Used ${creditsToDeduct} credit${creditsToDeduct > 1 ? 's' : ''} for ${action}. ${deductData.dailyRemaining} credits left today.`,
        duration: 4000,
        position: "bottom-right",
        style: {
          background: 'linear-gradient(135deg, #064e3b, #065f46)',
          color: '#fff',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        },
        icon: '✅',
      });
      







      return true;
    } else {
      toast.error("Failed to deduct credits", {
        style: {
          background: '#1e1b4b',
          color: '#fff',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
        },
      });
      return false;
    }
  } catch (error) {
    console.error("❌ Credit check error:", error);
    toast.error("Failed to check credits", {
      style: {
        background: '#1e1b4b',
        color: '#fff',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
      },
    });
    return false;
  }
};






















  // ========== ADD THE mobileStyles CONSTANT HERE ==========
  const mobileStyles = `
    @media (max-width: 768px) {
      .header-container { padding: 0 12px; }
      .brand-subtext { display: none; }
      .action-button span { display: none; }
      .action-button svg { margin-right: 0; }
      .desktop-only { display: none; }
      .preview-info-badge { display: none; }
      .view-toggle button span { display: none; }
      .deploy-button span { display: none; }
      .ai-edit-button span { display: none; }
    }
  `;














// Generate a professional project name based on prompt - DYNAMIC & UNIQUE
const generateProjectName = (promptText: string, existingNames: string[] = []): string => {
  // If user specified a name with "called" or "named"
  const calledMatch = promptText.match(/(?:called|named|titled)\s+["']?([A-Za-z0-9\s]+)["']?/i);
  if (calledMatch) {
    return calledMatch[1].trim();
  }
  
  // Word banks for dynamic name generation
  const prefixes = [
    'Summit', 'Riverside', 'Golden', 'Crystal', 'Iron', 'Peak', 'Valley', 
    'Heritage', 'Legacy', 'Pioneer', 'Vibrant', 'Serene', 'Royal', 'Elite',
    'Urban', 'Modern', 'Artisan', 'Rustic', 'Coastal', 'Mountain', 'Ocean',
    'Sunset', 'Dawn', 'Horizon', 'Noble', 'Grand', 'Prime', 'Select'
  ];
  
  const middles = [
    'Peak', 'Valley', 'View', 'Point', 'Spring', 'Lake', 'River', 'Forest',
    'Meadow', 'Hill', 'Ridge', 'Harbor', 'Bay', 'Beach', 'Heights', 'Gardens',
    'Square', 'Park', 'Acres', 'Manor', 'Estate', 'Commons', 'Crossing'
  ];
  
  const suffixes: Record<string, string[]> = {
    school: ['Academy', 'School', 'Institute', 'Learning Center', 'College Prep', 'Education Center'],
    coffee: ['Roastery', 'Coffee Co.', 'Brew', 'Cafe', 'Beanery', 'Coffee House', 'Roast'],
    hotel: ['Resort', 'Hotel', 'Inn', 'Lodge', 'Suites', 'Retreat', 'Getaway'],
    gym: ['Fitness', 'Gym', 'Training Center', 'Athletic Club', 'Strength', 'Performance'],
    restaurant: ['Bistro', 'Kitchen', 'Dining', 'Restaurant', 'Eatery', 'Tavern'],
    portfolio: ['Studio', 'Creative', 'Design', 'Portfolio', 'Agency', 'Collective'],
    ecommerce: ['Market', 'Store', 'Shop', 'Goods', 'Emporium', 'Marketplace'],
    default: ['Studio', 'Creative', 'Hub', 'Workspace', 'Collective', 'Lab']
  };
  
  // Determine project type
  const lowerPrompt = promptText.toLowerCase();
  let projectType = 'default';
  
  if (lowerPrompt.includes('school') || lowerPrompt.includes('academy') || lowerPrompt.includes('education')) {
    projectType = 'school';
  } else if (lowerPrompt.includes('coffee') || lowerPrompt.includes('roastery') || lowerPrompt.includes('brew')) {
    projectType = 'coffee';
  } else if (lowerPrompt.includes('hotel') || lowerPrompt.includes('resort') || lowerPrompt.includes('inn')) {
    projectType = 'hotel';
  } else if (lowerPrompt.includes('gym') || lowerPrompt.includes('fitness') || lowerPrompt.includes('workout')) {
    projectType = 'gym';
  } else if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('cafe') || lowerPrompt.includes('bistro')) {
    projectType = 'restaurant';
  } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('creative') || lowerPrompt.includes('designer')) {
    projectType = 'portfolio';
  } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
    projectType = 'ecommerce';
  }
  
  // Generate unique name - ensure it's not in existing names
  let attempts = 0;
  let generatedName = '';
  let isUnique = false;
  
  while (!isUnique && attempts < 20) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = middles[Math.floor(Math.random() * middles.length)];
    const suffix = suffixes[projectType][Math.floor(Math.random() * suffixes[projectType].length)];
    
    // Different formats
    const formats = [
      `${prefix} ${suffix}`,
      `${prefix} ${middle} ${suffix}`,
      `${prefix} ${middle}`,
      `${middle} ${suffix}`
    ];
    
    generatedName = formats[Math.floor(Math.random() * formats.length)];
    
    // Check uniqueness against existing names
    isUnique = !existingNames.some(name => 
      name.toLowerCase() === generatedName.toLowerCase() ||
      name.toLowerCase().includes(generatedName.toLowerCase()) ||
      generatedName.toLowerCase().includes(name.toLowerCase())
    );
    
    attempts++;
  }
  
  return generatedName;
};


















// ========== ADD THESE STORAGE HELPER FUNCTIONS HERE ==========
const getStorageSize = () => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += localStorage.getItem(key)?.length || 0;
    }
  }
  return total;
};











const canSaveToLocalStorage = (estimatedSize: number) => {
  const currentSize = getStorageSize();
  // Increase limit to 8MB total (most browsers support 10MB)
  const maxSize = 8 * 1024 * 1024; // 8MB total for all projects
  
  console.log(`📊 Storage: Current ${(currentSize / 1024 / 1024).toFixed(2)}MB, Adding ${(estimatedSize / 1024 / 1024).toFixed(2)}MB, Limit 8MB`);
  
  return (currentSize + estimatedSize) < maxSize;
};







const clearOldProjects = () => {
  // Use the ref to get current projects without stale closure
  const currentProjects = savedProjectsRef.current;
  const sorted = [...currentProjects].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const recent = sorted.slice(0, 3);
  setSavedProjects(recent);
  localStorage.setItem("scorpioSavedProjects", JSON.stringify(recent));
  toast.success(`Cleared old projects. Kept ${recent.length} most recent.`);
  setTimeout(() => window.location.reload(), 1500);
};













const saveProjectToDatabase = async (project: SavedProject) => {
  try {
    console.log("💾 Saving to database:", project.name);
    
    const token = localStorage.getItem("eaglecode_token");
    
    const response = await fetch(`${BACKEND_URL}/api/save-project`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(project)
    });
    
    const result = await response.json();
    


    if (result.success) {
        console.log("✅ Saved to database:", result.id);
        
        // ========== UPDATE LOCALSTORAGE CACHE ==========
        const cached = localStorage.getItem("projectsCache");
        let projects = [];
        
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                projects = parsed.data || [];
            } catch(e) {
                console.error("Failed to parse cache:", e);
            }
        }
        
        // Add new project to the beginning
        const newProjectMetadata = {
            id: result.id,
            name: project.name,
            prompt: project.prompt?.slice(0, 100) || "",
            timestamp: new Date().toISOString(),
            thumbnail_url: result.thumbnail_url || null,
            project_type: project.project_type || "general"
        };
        
        projects.unshift(newProjectMetadata);
        const latest10 = projects.slice(0, 10);
        
        const newCache = {
            data: latest10,
            timestamp: Date.now()
        };
        
        localStorage.setItem("projectsCache", JSON.stringify(newCache));
        console.log("✅ Cache updated with new project");
        
        // ========== DISPATCH STORAGE EVENT ==========
        window.dispatchEvent(new StorageEvent("storage", {
            key: "projectsCache",
            newValue: JSON.stringify(newCache),
            oldValue: cached,
            storageArea: localStorage
        }));
        console.log("✅ Storage event dispatched");
        // ===========================================
        
        // Set flag for navigation
        sessionStorage.setItem("projectsNeedRefresh", "true");
        
        return true;
    } else {
        throw new Error(result.detail || "Save failed");
    }
  } catch (error) {
    console.error("Failed to save to database:", error);
    return false;
  }
};



























const loadProjectsFromDatabase = async () => {
  try {
    console.log("📚 Loading projects from database...");
    
    // Get the auth token
    const token = localStorage.getItem("eaglecode_token");
    
    // If no token, user is not logged in - don't try to load projects
    if (!token) {
      console.log("⚠️ No token found, user not logged in");
      setSavedProjects([]);
      savedProjectsRef.current = [];
      return [];
    }
    
    console.log("🔑 Token found, loading projects...");
    
    const response = await fetch(`${BACKEND_URL}/api/get-projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("📡 Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("📊 Projects response:", result);
    
    if (result.success && result.projects) {
      // ✅ Add explicit type for the project parameter
      const projects: SavedProject[] = result.projects.map((project: {
        id: string;
        name: string;
        prompt: string;
        files: Record<string, string>;
        preview_html: string;
        preview_url?: string;
        thumbnail_url?: string;
        files_url?: string;
        timestamp: string;
        project_type?: string;
      }) => ({
        id: project.id,
        name: project.name,
        prompt: project.prompt || '',
        files: project.files || {},
        preview_html: project.preview_html || '',
        preview_url: project.preview_url || null,
        thumbnail_url: project.thumbnail_url || null,
        files_url: project.files_url || null,
        timestamp: project.timestamp,
        project_type: project.project_type || 'general'
      }));
      
      // Sort by timestamp (newest first)
      const sorted = projects.sort((a: SavedProject, b: SavedProject) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setSavedProjects(sorted);
      savedProjectsRef.current = sorted;
      console.log(`✅ Loaded ${sorted.length} projects from database`);
      console.log(`   📸 Thumbnails: ${sorted.filter((p: SavedProject) => p.thumbnail_url).length} have thumbnails`);
      console.log(`   🖼️ Previews: ${sorted.filter((p: SavedProject) => p.preview_url).length} have previews`);
      console.log(`   📦 ZIP files: ${sorted.filter((p: SavedProject) => p.files_url).length} have ZIP downloads`);
      return sorted;
    } else {
      console.log("No projects found or request failed");
      setSavedProjects([]);
      savedProjectsRef.current = [];
      return [];
    }
  } catch (error) {
    console.error("❌ Failed to load projects from database:", error);
    setSavedProjects([]);
    savedProjectsRef.current = [];
    return [];
  }
};













const deleteProjectFromDatabase = async (projectId: string) => {
  try {
    const token = localStorage.getItem("eaglecode_token");
    
    const response = await fetch(`${BACKEND_URL}/api/delete-project/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Failed to delete project:", error);
    return false;
  }
};







// Add this after your other refs and before the useEffect hooks
const regeneratePreviewForLoadedProject = useCallback(async (projectFiles: Record<string, string>) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-preview`, {  // ✅ Updated
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: projectFiles,
        projectName: currentProjectName || "Scorpio Project"
      })
    });

    const result = await response.json();

    if (result.success) {
      // Update the files with the new preview HTML
      const updatedFiles = { ...projectFiles };
      updatedFiles.preview_html = result.preview_html;
      
      // Update state
      if (loadedFiles) {
        setLoadedFiles(updatedFiles);
        
        // Update saved project
        const existingProject = savedProjects.find(p => p.name === currentProjectName);
        if (existingProject) {
          const updatedProjects = savedProjects.map(p => 
            p.id === existingProject.id 
              ? { ...p, files: updatedFiles, timestamp: new Date().toISOString() }
              : p
          );
          setSavedProjects(updatedProjects);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedProjects));
        }
      } else {
        setBuildFiles(updatedFiles);
      }
      
      toast.success("Preview regenerated with working navigation!");
      setPreviewKey(Date.now());
      return true;
    }
  } catch (error) {
    console.error("Failed to regenerate preview:", error);
    toast.error("Failed to regenerate preview");
    return false;
  }
}, [currentProjectName, loadedFiles, savedProjects, setBuildFiles]);

























// Load credits when user is logged in - ALWAYS FETCH FRESH
const loadCredits = useCallback(async () => {
  if (!user) return;
  
  try {
    const response = await fetch(`/api/credits?userId=${user.id}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await response.json();
    console.log("💰 Credits loaded from database:", data);
    




    
    // Only update credits after we have valid data
    if (data.dailyRemaining !== undefined) {
      setCredits({
        isLoading: false,
        dailyRemaining: data.dailyRemaining,
        monthlyRemaining: data.monthlyRemaining,
        dailyLimit: data.dailyLimit,
        monthlyLimit: data.monthlyLimit,
        plan: data.plan
      });
    }
  } catch (error) {
    console.error("Failed to load credits:", error);
  }
}, [user]);

useEffect(() => {
  loadCredits();
}, [loadCredits]);













// Show low credit warning on page load - ONLY toast, NO modal
useEffect(() => {
  if (!user || credits.dailyLimit === 0 || isBuilding) return;
  
  // Only show toast warnings for low credits (2-3 credits left)
  if (credits.dailyRemaining >= 2 && credits.dailyRemaining <= 3 && credits.plan === 'free') {
    toast.warning(`⚠️ Low on credits! Only ${credits.dailyRemaining} credits left today.`, {
      duration: 5000,
      position: "top-center",
      style: {
        background: 'linear-gradient(135deg, #1e1b4b, #2d1b69)',
        color: '#fff',
        border: '1px solid rgba(245, 158, 11, 0.5)',
        borderRadius: '16px',
      },
      action: {
        label: "Upgrade",
        onClick: () => window.location.href = "/pricing"
      }
    });
  }
  
  // REMOVE any setShowUpgradeModal calls from here
}, [credits.dailyRemaining, credits.plan, credits.dailyLimit, user, isBuilding]);












// Load projects from database when user is logged in
useEffect(() => {
  if (user && user.id) {
    console.log("👤 User logged in, loading projects...");
    loadProjectsFromDatabase();
  } else {
    console.log("👤 No user logged in, clearing projects");
    setSavedProjects([]);
    savedProjectsRef.current = [];
  }
}, [user]); // Only run when user changes














// Mobile detection
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);









  // Strong auto-switch to preview when build completes
  useEffect(() => {
    if (!isBuilding && Object.keys(buildFiles).length > 2 && !loadedFiles) {
      console.log("✅ Build completed → Switching to Preview mode");
      setViewMode("preview");
      setTimeout(() => {
        setPreviewKey(Date.now());
        setPreviewError(null);
      }, 300);
    }
  }, [isBuilding, buildFiles, loadedFiles]);

  // Force preview to show when build completes and preview_html exists
  useEffect(() => {
    if (!isBuilding && files.preview_html && !loadedFiles && !showPreviewDelayed) {
      console.log("🚀 Build complete, showing preview");
      setShowPreviewDelayed(true);
      setViewMode("preview");
    }
  }, [isBuilding, files.preview_html, loadedFiles, showPreviewDelayed]);








useEffect(() => {
    if (!isBuilding && files.preview_html && !loadedFiles && !previewUrl) {
      console.log("🔄 Build completed, forcing preview URL creation");
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        const processedHtml = getPreviewHTML(files.preview_html);
        const newUrl = URL.createObjectURL(new Blob([processedHtml], { type: 'text/html' }));
        setPreviewUrl(newUrl);
        setShowPreviewDelayed(true);
        setPreviewKey(Date.now());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isBuilding, files.preview_html, loadedFiles, previewUrl]);

















  // Add this useEffect near your other useEffects
  useEffect(() => {
    if (isBuilding && !loadedFiles) {
      // Force minimum 10 second loading time
      const minLoadTime = setTimeout(() => {
        // This ensures the loading screen stays for at least 10 seconds
      }, 10000);
      
      return () => clearTimeout(minLoadTime);
    }
  }, [isBuilding, loadedFiles]);
























  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);





  // Load saved projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("scorpioSavedProjects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedProjects(parsed);
      } catch (e) {
        console.error("Failed to parse saved projects", e);
      }
    }
  }, []);






// ========== COMPREHENSIVE PREVIEW DEBUG ==========
useEffect(() => {
  console.log("🔍 ========== PREVIEW DEBUG INFO ==========");
  console.log("  - files.preview_html exists:", !!files.preview_html);
  console.log("  - previewUrl exists:", !!previewUrl);
  console.log("  - isBuilding:", isBuilding);
  console.log("  - showPreviewDelayed:", showPreviewDelayed);
  console.log("  - viewMode:", viewMode);
  console.log("  - loadedFiles:", !!loadedFiles);
  console.log("  - Object.keys(files).length:", Object.keys(files).length);
  
  if (files.preview_html) {
    console.log("  - preview_html length:", files.preview_html.length);
    console.log("  - preview_html first 200 chars:", files.preview_html.substring(0, 200));
    console.log("  - Has DOCTYPE:", files.preview_html.includes('<!DOCTYPE'));
    console.log("  - Has <html>:", files.preview_html.includes('<html'));
  } else {
    console.log("  - ❌ No preview_html in files");
    console.log("  - Available files:", Object.keys(files));
  }
  
  console.log("  - Iframe condition:", previewUrl && !isBuilding && showPreviewDelayed);
  console.log("==========================================");
}, [files.preview_html, previewUrl, isBuilding, showPreviewDelayed, viewMode, loadedFiles, files]);














// Update ref when savedProjects changes
useEffect(() => {
  savedProjectsRef.current = savedProjects;
}, [savedProjects]);


















// ========== Load project from sessionStorage when coming from landing page ==========
useEffect(() => {
  if (mounted && !loadedFiles && !isBuilding) {
    const projectToLoad = sessionStorage.getItem("projectToLoad");
    if (projectToLoad) {
      try {
        const project = JSON.parse(projectToLoad);
        console.log("📦 Loading project from landing page:", project.name);
        
        setLoadedFiles(project.files);
        setPrompt(project.prompt || "");
        setCurrentProjectName(project.name);
        
        const fileKeys = Object.keys(project.files);
        if (fileKeys.length > 0) {
          const firstFile = fileKeys.find(f => f !== "preview_html") || fileKeys[0];
          setActiveFile(firstFile);
        }
        
        setViewMode("preview");
        
        // Check if we have saved preview
        if (project.preview_html) {
          // Use saved preview instantly
          const updatedFiles = { ...project.files };
          updatedFiles.preview_html = project.preview_html;
          setLoadedFiles(updatedFiles);
          setShowPreviewDelayed(true);
          setPreviewKey(Date.now());
          console.log("✅ Using saved preview - instant load!");
          toast.success(`"${project.name}" loaded instantly!`, { duration: 3000 });
        } else {
          // Fallback: regenerate preview
          console.log("⚠️ No saved preview, regenerating...");
          setTimeout(async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/api/generate-preview`, {  // ✅ Updated
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  files: project.files,
                  projectName: project.name || "Scorpio Project"
                })
              });

              const result = await response.json();
              
              if (result.success) {
                const updatedFiles = { ...project.files };
                updatedFiles.preview_html = result.preview_html;
                setLoadedFiles(updatedFiles);
                console.log("✅ Preview regenerated");
              }
            } catch (error) {
              console.error("Failed to regenerate preview:", error);
            }
            
            setShowPreviewDelayed(true);
            setPreviewKey(Date.now());
          }, 500);
        }
        
        sessionStorage.removeItem("projectToLoad");
      } catch (e) {
        console.error("Failed to load project from sessionStorage", e);
        sessionStorage.removeItem("projectToLoad");
      }
    }
  }
}, [mounted, loadedFiles, isBuilding]);












const loadProjectDirectly = useCallback(async (project: SavedProject) => {
  setIsLoadingProject(true);
  setShowPreviewDelayed(false);
  
  try {
    const token = localStorage.getItem("eaglecode_token");
    
    const response = await fetch(`${BACKEND_URL}/api/get-project/${project.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setLoadedFiles(data.files);
      setPrompt(data.project.prompt || "");
      setCurrentProjectName(data.project.name);
      
      const fileKeys = Object.keys(data.files);
      if (fileKeys.length > 0) {
        const firstFile = fileKeys.find(f => f !== "preview_html") || fileKeys[0];
        setActiveFile(firstFile);
      }
      
      setViewMode("preview");
      
      if (data.project.preview_html) {
        setShowPreviewDelayed(true);
        setPreviewKey(Date.now());
        toast.success(`Loaded "${data.project.name}"!`, { duration: 3000 });
      }
    }
  } catch (error) {
    console.error("Failed to load project:", error);
    toast.error("Failed to load project");
  } finally {
    setIsLoadingProject(false);
  }
}, []);





// Add this function to get all saved projects (not just the most recent)
const getAllSavedProjects = useCallback(() => {
  const saved = localStorage.getItem("scorpioSavedProjects");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Sort by timestamp descending (newest first)
      const sorted = parsed.sort((a: SavedProject, b: SavedProject) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return sorted;
    } catch (e) {
      console.error("Failed to parse saved projects", e);
      return [];
    }
  }
  return [];
}, []);

// Update the saved projects loading useEffect
useEffect(() => {
  const loadSavedProjects = () => {
    const saved = localStorage.getItem("scorpioSavedProjects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sort by timestamp descending (newest first)
        const sorted = parsed.sort((a: SavedProject, b: SavedProject) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setSavedProjects(sorted);
        console.log(`📚 Loaded ${sorted.length} saved projects`);
      } catch (e) {
        console.error("Failed to parse saved projects", e);
      }
    }
  };
  
  loadSavedProjects();
}, []);




















const reconstructPreview = (updatedFiles: Record<string, string>): string => {
  return (
    updatedFiles["index.html"] ||
    updatedFiles["pages/index.html"] ||
    updatedFiles["src/index.html"] ||
    Object.entries(updatedFiles).find(([k]) => k.endsWith(".html") && k !== "preview_html")?.[1] ||
    ""
  );
};















// Intelligent AI-powered edit function - no target file required
const applyIntelligentEdit = useCallback(async () => {
  if (!editPrompt.trim()) {
    toast.error("Please describe what change you want to make");
    return;
  }

  // Add credit check here
  let creditsNeeded = 2;
  if (editPrompt.length > 200) creditsNeeded = 3;
  if (editPrompt.length > 500) creditsNeeded = 5;
  
  const hasCredits = await checkAndDeductCredits(creditsNeeded, "AI Edit");
  if (!hasCredits) return;


  const currentFiles = loadedFiles || buildFiles;
  
  if (Object.keys(currentFiles).length <= 1) {
    toast.error("No project loaded to edit");
    return;
  }

  setIsEditingProject(true);
  
  // Get stored database URL if any
  const storedDbUrl = localStorage.getItem('temp_database_url');
  
  try {
      const response = await fetch(`${BACKEND_URL}/api/edit-file`, {  // ✅ Updated
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        edit_description: editPrompt,
        all_files: currentFiles,
        existing_preview: rawPreviewHtml || currentFiles.preview_html || "",
        regenerate_preview: true,
        database_url: storedDbUrl || null  // <-- ADD THIS LINE
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    const result = await response.json();








    
    // ADD THIS BLOCK - Check if backend needs database URL
    if (result.needs_database_url) {
      setIsEditingProject(false);
      setPendingEditDescription(editPrompt);
      setShowDatabaseModal(true);
      return;
    }
    
    if (result.success) {
      // Update files with all edits
      const updatedFiles = { ...currentFiles };
      
      // Apply all edits
      if (result.edits) {
        result.edits.forEach((edit: any) => {
          updatedFiles[edit.file_path] = edit.updated_content;
        });
      }

      if (result.preview_html) {
        updatedFiles.preview_html = result.preview_html;
      } else {
        // Fallback: Reconstruct preview from source files
        const rebuilt = reconstructPreview(updatedFiles);
        if (rebuilt) updatedFiles.preview_html = rebuilt;
        console.log("Updated preview HTML:", updatedFiles.preview_html);
      }

      // Update state based on whether we're in loaded or build mode
      if (loadedFiles) {
        setLoadedFiles(updatedFiles);
        
        // Update saved project - use prompt as identifier to prevent duplicates
        const existingProject = savedProjects.find(p => p.prompt === prompt || p.name === currentProjectName);
        if (existingProject) {
          const updatedProjects = savedProjects.map(p => 
            p.id === existingProject.id 
              ? { 
                  ...p, 
                  files: updatedFiles, 
                  preview_html: updatedFiles.preview_html || "",  // <-- CRITICAL: Save the new preview!
                  timestamp: new Date().toISOString() 
                }
              : p
          );
          setSavedProjects(updatedProjects);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedProjects));
          console.log("✅ Updated existing project with new preview:", existingProject.name);
        } else {
          // Create new project only if no existing project found
          const newProject: SavedProject = {
            id: Date.now().toString(),
            name: currentProjectName || prompt.slice(0, 35) || "Edited Project",
            prompt: prompt || editPrompt,
            preview_html: updatedFiles.preview_html || "",
            files: updatedFiles,
            timestamp: new Date().toISOString()
          };
          const updated = [newProject, ...savedProjects];
          setSavedProjects(updated);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updated));
          console.log("✅ Created new project from edit with preview:", newProject.name);
        }
      } else {
        // Update build files directly
        setBuildFiles(updatedFiles);
        
        // Also update saved project if it exists (use prompt as identifier)
        const existingProject = savedProjects.find(p => p.prompt === prompt);
        if (existingProject) {
          const updatedProjects = savedProjects.map(p => 
            p.id === existingProject.id 
              ? { 
                  ...p, 
                  files: updatedFiles, 
                  preview_html: updatedFiles.preview_html || "",  // <-- Save preview
                  timestamp: new Date().toISOString() 
                }
              : p
          );
          setSavedProjects(updatedProjects);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedProjects));
          console.log("✅ Updated build project with new preview:", existingProject.name);
        } else if (prompt) {
          // Create new project from build mode edit
          const newProject: SavedProject = {
            id: Date.now().toString(),
            name: prompt.slice(0, 35) || "Build Project",
            prompt: prompt,
            preview_html: updatedFiles.preview_html || "",
            files: updatedFiles,
            timestamp: new Date().toISOString()
          };
          const updated = [newProject, ...savedProjects];
          setSavedProjects(updated);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updated));
          setCurrentProjectName(newProject.name);
          console.log("✅ Created new project from build edit with preview:", newProject.name);
        }
      }
      
      // Show success message with details
      const changeSummary = result.change_summary || `Applied changes to ${result.files_edited?.join(', ') || 'files'}`;
      
      toast.success(`✅ ${changeSummary}`, {
        duration: 3000,
        position: "bottom-right",
      });
      
      // Exit edit mode first
      setIsEditMode(false);
      setEditPrompt("");

      // Force preview refresh
      setTimeout(() => {
        setViewMode("preview");
        setPreviewKey(Date.now());
      }, 300);

    } else {
      const errorMsg = result.error || "Unknown error";
      const hint = result.hint ? ` ${result.hint}` : '';
      toast.error(`❌ Edit failed: ${errorMsg}${hint}`, {
        duration: 5000,
        position: "bottom-right",
      });
    }
  } catch (error) {
    console.error("Intelligent edit failed:", error);
    toast.error(`Failed to apply edit: ${error instanceof Error ? error.message : "Unknown error"}`, {
      duration: 5000,
      position: "bottom-right",
    });
  } finally {
    setIsEditingProject(false);
  }
}, [editPrompt, loadedFiles, buildFiles, savedProjects, currentProjectName, setBuildFiles, prompt]); // No changes to dependencies



































  // Clear loaded project and return to AI-generated project
  const clearLoadedProject = useCallback(() => {
    setLoadedFiles(null);
    setActiveFile("");
    setPrompt("");
    setCurrentProjectName("");
    setIsEditMode(false);
    setEditPrompt("");
    toast.info("Switched to AI build mode");
  }, []);









// ========== ADD THIS HANDLER HERE ==========
const handleDatabaseConfigured = useCallback(async (updatedFiles: Record<string, string>) => {
  // Update files in state
  if (loadedFiles) {
    setLoadedFiles(updatedFiles);
  } else {
    setBuildFiles(updatedFiles);
  }
  
  // Update saved project
  const existingProject = savedProjects.find(p => p.name === currentProjectName);
  if (existingProject) {
    const updatedProjects = savedProjects.map(p =>
      p.id === existingProject.id
        ? { ...p, files: updatedFiles, timestamp: new Date().toISOString() }
        : p
    );
    setSavedProjects(updatedProjects);
    localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedProjects));
  } else if (prompt) {
    // Create new project with database
    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: currentProjectName || prompt.slice(0, 35),
      prompt: prompt,
      files: updatedFiles,
      preview_html: updatedFiles.preview_html || "",
      timestamp: new Date().toISOString()
    };
    const updated = [newProject, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem("scorpioSavedProjects", JSON.stringify(updated));
  }
  
  toast.success("Database configured! New files added to your project.");
  
  // Refresh the preview
  setTimeout(() => {
    setViewMode("preview");
    setPreviewKey(Date.now());
  }, 500);
}, [loadedFiles, buildFiles, savedProjects, currentProjectName, prompt]);
// ===========================================











// ========== NON-BLOCKING AUTO-SAVE (Toast only, no overlay) ==========
const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const [isAutoSaving, setIsAutoSaving] = useState(false);
const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);




// Generate a unique ID for the current build
const currentBuildId = useMemo(() => {
  return `${prompt}-${Object.keys(buildFiles).length}`;
}, [prompt, buildFiles]);














const silentSaveToDatabase = useCallback(async () => {
  console.log("🔵 ========== AUTO-SAVE START ==========");
  console.log("🔵 Current isAutoSaving:", isAutoSaving);
  console.log("🔵 Current buildFiles count:", Object.keys(buildFiles).length);
  
  // ========== ADD THROTTLE CHECK ==========
  const now = Date.now();
  if (lastSaveTime && (now - lastSaveTime.getTime()) < 10000) {
    console.log(`⏭️ Auto-save throttled - last save was ${Math.floor((now - lastSaveTime.getTime()) / 1000)}s ago`);
    return;
  }
  // ========================================
  
  // Prevent concurrent saves
  if (isAutoSaving) {
    console.log("⏭️ Auto-save already in progress, skipping...");
    return;
  }
  
  // Validate we have a project to save
  if (!prompt || Object.keys(buildFiles).length <= 1) {
    console.log("⏭️ Auto-save skipped - no project to save");
    return;
  }
  
  // Don't save during build or if there's an error
  if (isBuilding || buildError) {
    console.log("⏭️ Auto-save skipped - build in progress or error");
    return;
  }
  
  // Skip if we already saved this exact build
  if (lastSavedBuildId.current === currentBuildId) {
    console.log("⏭️ Auto-save skipped - already saved this build");
    return;
  }
  
  console.log("🟢 Starting auto-save...");
  
  // Set saving state to show indicator
  setIsAutoSaving(true);
  
  // Show loading toast
  const toastId = toast.loading("💾 Saving project...", {
    duration: 3000,
    position: "bottom-right",
    icon: "💾",
  });
  
  try {
    // Create a clean copy of files for saving
    const completeFiles = { ...buildFiles };
    
    // Ensure preview_html exists
    if (!completeFiles.preview_html && rawPreviewHtml) {
      completeFiles.preview_html = rawPreviewHtml;
    }
    
    // Extract project name
    let actualProjectName = currentProjectName || prompt.slice(0, 35);
    
    const navContent = buildFiles["components/Navigation.tsx"];
    if (navContent && typeof navContent === 'string') {
      const brandMatch = navContent.match(/<Link[^>]*href="\/"[^>]*>([^<]+)<\/Link>/);
      if (brandMatch && brandMatch[1]) {
        const extractedName = brandMatch[1].trim();
        if (extractedName && extractedName.length > 1) {
          actualProjectName = extractedName;
        }
      }
    }
    
    const existingProject = savedProjectsRef.current.find(p => p.prompt === prompt);
    
    const projectToSave: SavedProject = {
      id: existingProject?.id || Date.now().toString(),
      name: actualProjectName,
      prompt: prompt,
      files: completeFiles,
      preview_html: completeFiles.preview_html || "",
      timestamp: new Date().toISOString()
    };
    
    // ========== ADD TOKEN HERE ==========
    const token = localStorage.getItem("eaglecode_token");
    
    // Send to backend with Authorization header
    const response = await fetch(`${BACKEND_URL}/api/save-project`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectToSave)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log("✅ Save SUCCESSFUL!");
      
      // Mark this build as saved AND update throttle time
      lastSavedBuildId.current = currentBuildId;
      setLastSaveTime(new Date());
      setCurrentProjectName(actualProjectName);
      
      // Update saved projects list with the new/updated project
      const updatedProjects = [...savedProjectsRef.current];
      const existingIndex = updatedProjects.findIndex(p => p.id === projectToSave.id);
      
      if (existingIndex >= 0) {
        updatedProjects[existingIndex] = {
          ...updatedProjects[existingIndex],
          name: actualProjectName,
          prompt: prompt,
          timestamp: new Date().toISOString()
        };
      } else {
        updatedProjects.unshift({
          id: projectToSave.id,
          name: actualProjectName,
          prompt: prompt,
          files: {},
          preview_html: "",
          timestamp: new Date().toISOString()
        });
      }
      
      const trimmedProjects = updatedProjects.slice(0, 20);
      setSavedProjects(trimmedProjects);
      savedProjectsRef.current = trimmedProjects;
      
      // Show success toast
      toast.success(`💾 Saved: ${actualProjectName}`, {
        id: toastId,
        duration: 2500,
        position: "bottom-right",
        icon: "✅",
      });
      
      console.log(`✅ Auto-saved: ${actualProjectName}`);
    } else {
      toast.error("Save failed: " + (result.message || "Unknown error"), {
        id: toastId,
        duration: 3000,
        position: "bottom-right",
      });
    }
    
  } catch (error) {
    console.error("❌ Auto-save error:", error);
    toast.error("Auto-save failed: " + (error instanceof Error ? error.message : "Network error"), {
      id: toastId,
      duration: 3000,
      position: "bottom-right",
    });
  } finally {
    // Reset saving state after a short delay
    setTimeout(() => {
      console.log("🟢 Resetting isAutoSaving to false");
      setIsAutoSaving(false);
    }, 500);
  }
  
  console.log("🔵 ========== AUTO-SAVE END ==========");
}, [buildFiles, prompt, isBuilding, buildError, currentProjectName, currentBuildId, isAutoSaving, lastSaveTime]);






// ========== DEBOUNCED AUTO-SAVE TRIGGER ==========
useEffect(() => {
  // Clear existing timeout
  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }
  
  // Only auto-save if we have a valid project and not already saving
  const hasValidProject = !isBuilding && 
                          Object.keys(buildFiles).length > 1 && 
                          prompt && 
                          !loadedFiles;
  
  if (hasValidProject && !isAutoSaving) {
    // Reset saved flag when build changes significantly
    if (Object.keys(buildFiles).length > 5 && lastSavedBuildId.current) {
      lastSavedBuildId.current = null;
    }
    
    // Schedule auto-save after 3 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      silentSaveToDatabase();
    }, 3000);
  }
  
  return () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };
}, [buildFiles, isBuilding, prompt, loadedFiles, isAutoSaving]);



















const manualSave = useCallback(async () => {
  const currentFiles = files;
  if (Object.keys(currentFiles).length <= 1) {
    toast.error("No project to save");
    return;
  }
  
  const existingNames = savedProjectsRef.current.map(p => p.name);
  const projectName = generateProjectName(prompt, existingNames);
  const previewHtml = currentFiles["preview_html"] || "";
  
  const existingProject = savedProjectsRef.current.find(p => p.prompt === prompt);
  
  const projectToSave: SavedProject = {
    id: existingProject?.id || Date.now().toString(),
    name: projectName,
    prompt: prompt,
    files: { ...currentFiles },
    preview_html: previewHtml,
    timestamp: new Date().toISOString()
  };
  
  const saved = await saveProjectToDatabase(projectToSave);
  



















  if (saved) {
    const updatedProjects = await loadProjectsFromDatabase();
    setSavedProjects(updatedProjects);
    savedProjectsRef.current = updatedProjects;
    setCurrentProjectName(projectName);
    
    // 🔥 Update cache by adding/updating the project
    const cached = localStorage.getItem("projectsCache");
    if (cached) {
      const parsed = JSON.parse(cached);
      
      // Create metadata for the new/updated project
      const projectMetadata = {
        id: projectToSave.id,
        name: projectName,
        prompt: prompt.slice(0, 80),
        files: {},
        preview_html: '',
        timestamp: projectToSave.timestamp
      };
      
      // Check if project already exists in cache
      const existingIndex = parsed.data.findIndex((p: any) => p.id === projectToSave.id);
      if (existingIndex >= 0) {
        // Update existing project
        parsed.data[existingIndex] = projectMetadata;
        console.log("✅ Updated existing project in cache");
      } else {
        // Add new project to beginning
        parsed.data.unshift(projectMetadata);
        console.log("✅ Added new project to cache");
      }
      
      // Keep only latest 20 projects in cache
      parsed.data = parsed.data.slice(0, 20);
      parsed.timestamp = Date.now();
      
      localStorage.setItem("projectsCache", JSON.stringify(parsed));
    } else {
      // Create new cache if doesn't exist
      const projectsMetadata = updatedProjects.map((p: SavedProject) => ({
        id: p.id,
        name: p.name,
        prompt: p.prompt.slice(0, 80),
        files: {},
        preview_html: '',
        timestamp: p.timestamp
      }));
      localStorage.setItem("projectsCache", JSON.stringify({
        data: projectsMetadata,
        timestamp: Date.now()
      }));
      console.log("✅ Created new cache with projects");
    }
    
    toast.success(`Project saved to database: "${projectName}"`);
  } else {
    toast.error("Failed to save to database");
  }
}, [files, prompt]);
















const deleteProject = useCallback(async (projectId: string, projectName: string) => {
  const deleted = await deleteProjectFromDatabase(projectId);
  
  if (deleted) {
    const updatedProjects = await loadProjectsFromDatabase();
    setSavedProjects(updatedProjects);
    savedProjectsRef.current = updatedProjects;
    toast.success(`Deleted "${projectName}"`);
    setShowDeleteConfirm(null);
    
    if (loadedFiles && currentProjectName === projectName) {
      clearLoadedProject();
    }
  } else {
    toast.error("Failed to delete project");
  }
}, [loadedFiles, currentProjectName, clearLoadedProject]);












// Add this at the top of your component, after all the useState declarations (around line 200-250)
const isVercel = typeof window !== 'undefined' && 
                 (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || 
                  window.location.hostname.includes('vercel.app'));





















const generatePreview = useCallback(async () => {
  if (Object.keys(files).length <= 1) return;

  // Add loading state
  setIsGeneratingPreview(true);

  try {
    // Always use production backend
    const endpoint = 'https://eaglecode2.onrender.com/api/generate-preview';
    
    console.log(`📡 Generating preview using endpoint: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: files,
        projectName: currentProjectName || prompt?.slice(0, 40) || "Scorpio App"
      })
    });

    const result = await response.json();

    if (result.success) {
      // For static HTML, update the files with the preview HTML
      if (result.preview_html) {
        const updatedFiles = { ...files };
        updatedFiles.preview_html = result.preview_html;
        
        if (loadedFiles) {
          setLoadedFiles(updatedFiles);
        } else {
          setBuildFiles(updatedFiles);
        }
        
        setPreviewKey(Date.now());
        toast.success("Preview ready!");
      } else {
        setPreviewKey(Date.now());
        toast.success("Interactive preview ready!");
      }
    }
  } catch (error) {
    console.error("Preview generation failed:", error);
    toast.error("Failed to generate preview");
  } finally {
    // Hide loading state
    setIsGeneratingPreview(false);
  }
}, [files, currentProjectName, prompt, loadedFiles, setBuildFiles, isVercel]);











// AUTO-START Logic from URL
useEffect(() => {
  const urlPrompt = searchParams.get("prompt");
  if (urlPrompt && !hasAutoStarted.current && !loadedFiles && !isBuilding) {
    console.log("🚀 Auto-starting build with prompt:", urlPrompt);
    setPrompt(urlPrompt);
    
    // Set loading state immediately so button shows spinner
    setIsCheckingCredits(true);
    
    // Check credits before auto-starting
    setTimeout(async () => {
      let creditsNeeded = 2;
      if (urlPrompt.length > 500) creditsNeeded = 3;
      if (urlPrompt.length > 1000) creditsNeeded = 5;
      
      console.log("💰 Auto-start credits needed:", creditsNeeded);
      console.log("💰 Calling checkAndDeductCredits for auto-start...");
      
      const hasCredits = await checkAndDeductCredits(creditsNeeded, "AI Generation");
      
      setIsCheckingCredits(false);
      
      if (hasCredits) {
        console.log("🚀 Auto-starting build...");
        startBuild(urlPrompt);
      } else {
        console.log("❌ No credits, auto-start cancelled");
        // Clear the URL parameter to prevent infinite loop
        window.history.replaceState({}, "", "/builder");
      }
    }, 100);
    hasAutoStarted.current = true;
  }
}, [searchParams, startBuild, loadedFiles, isBuilding]);






















  // Handle terminal messages
  useEffect(() => {
    if (!isBuilding) {
      setCurrentTerminalMessage(null);
      return;
    }
    const latestGenerating = generationLog.filter(log => log.status === 'generating').pop();
    const latestCompleted = generationLog.filter(log => log.status === 'complete').pop();

    if (latestGenerating) {
      setCurrentTerminalMessage({ file: latestGenerating.file, status: 'generating' });
    } else if (latestCompleted) {
      setCurrentTerminalMessage({ file: latestCompleted.file, status: 'complete' });
      if (terminalTimeoutRef.current) clearTimeout(terminalTimeoutRef.current);
      terminalTimeoutRef.current = setTimeout(() => setCurrentTerminalMessage(null), 1500);
    }
  }, [generationLog, isBuilding]);

  // Set active file
  useEffect(() => {
    const filePaths = Object.keys(files).filter(f => f !== "preview_html");
    if (filePaths.length > 0 && !activeFile) setActiveFile(filePaths[0]);
    if (generatingFile && !loadedFiles) {
      setActiveFile(generatingFile);
      if (viewMode === "preview") setViewMode("code");
    }
  }, [files, activeFile, generatingFile, viewMode, loadedFiles]);




















// Auto-show preview when files.preview_html is received
useEffect(() => {
  if (files.preview_html && !isBuilding && !loadedFiles) {
    console.log("🎯 Auto-displaying preview from build");
    setShowPreviewDelayed(true);
    setViewMode("preview");
    // Force refresh of preview
    setPreviewKey(Date.now());
  }
}, [files.preview_html, isBuilding, loadedFiles]);


















// Enhanced Navigation listener with origin checking
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // Verify the message is from our iframe
    if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
      return;
    }
    
    if (event.data?.type === "NAVIGATE") {
      console.log("📍 Preview navigation:", event.data.path);
      const newPath = event.data.path || "/";
      
      // Prevent parent navigation
      isPreviewNavigating.current = true;
      setVirtualPath(newPath);
      setNavigationHistory(prev => [...prev.slice(0, currentPathIndex + 1), newPath]);
      setCurrentPathIndex(prev => prev + 1);
      
      // Reset the flag after navigation completes
      setTimeout(() => {
        isPreviewNavigating.current = false;
      }, 100);
      
    } else if (event.data?.type === "PREVIEW_READY") {
      console.log("✅ Preview iframe ready");
      iframeReady.current = true;
    } else if (event.data?.type === "ERROR") {
      setPreviewError(event.data.error);
    }
  };
  
  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, [currentPathIndex]);

// Prevent hash changes from affecting the parent
useEffect(() => {
  const handleHashChange = (e: HashChangeEvent) => {
    if (isPreviewNavigating.current) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };
  
  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
}, []);










// Override pushState in iframe to prevent parent navigation
useEffect(() => {
  if (!iframeRef.current || !iframeRef.current.contentWindow) return;
  
  const iframeWindow = iframeRef.current.contentWindow;
  
  
  // Store original methods
  const originalPushState = iframeWindow.history.pushState;
  const originalReplaceState = iframeWindow.history.replaceState;
  


  // Override pushState
  iframeWindow.history.pushState = function(state: any, title: string, url: string | null) {
    originalPushState.call(this, state, title, url);
    // Notify parent but don't let it navigate
    window.postMessage({ type: "NAVIGATE", path: url }, "*");
  };
  
  iframeWindow.history.replaceState = function(state: any, title: string, url: string | null) {
    originalReplaceState.call(this, state, title, url);
    window.postMessage({ type: "NAVIGATE", path: url }, "*");
  };
  
  return () => {
    iframeWindow.history.pushState = originalPushState;
    iframeWindow.history.replaceState = originalReplaceState;
  };
}, [iframeRef.current]);

// Preview with debounce
const rawPreviewHtml = files["preview_html"] || "";
const previewHtml = useMemo(() => getPreviewHTML(rawPreviewHtml), [rawPreviewHtml]);



















// Create preview URL from HTML content - NO DEBOUNCE, immediate
useEffect(() => {
  if (!rawPreviewHtml) return;
  
  console.log("🎨 Creating preview from HTML, length:", rawPreviewHtml.length);
  console.log("Preview HTML first 200 chars:", rawPreviewHtml.substring(0, 200));
  
  // Clean up old URL
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  
  // Process the HTML (your function handles both full and fragment)
  const processedHtml = getPreviewHTML(rawPreviewHtml);
  
  // Create new blob URL
  const blob = new Blob([processedHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  setPreviewUrl(url);
  setShowPreviewDelayed(true);
  setPreviewError(null);
  iframeReady.current = false;
  
  console.log("✅ Preview URL created:", url.substring(0, 50) + "...");
  
  return () => {
    if (url) URL.revokeObjectURL(url);
  };
}, [rawPreviewHtml]);






























// Navigation controls with user-friendly messages
const goBack = useCallback(() => {
  console.log("🔙 Back button clicked - Current state:", { 
    currentPathIndex, 
    navigationHistoryLength: navigationHistory.length,
    hasIframe: !!iframeRef.current?.contentWindow
  });
  
  // If we have iframe navigation history (more than 1 page in history)
  if (currentPathIndex > 0 && iframeRef.current?.contentWindow) {
    try {
      console.log("🖼️ Navigating back within iframe to index:", currentPathIndex - 1);
      
      // Send a message to the iframe to navigate back
      iframeRef.current.contentWindow.postMessage({ 
        type: 'NAVIGATE_BACK', 
        path: navigationHistory[currentPathIndex - 1] 
      }, '*');
      
      // Update local state
      setCurrentPathIndex(prev => prev - 1);
      setVirtualPath(navigationHistory[currentPathIndex - 1] || "/");
      
      toast.success(`📄 Navigating to ${navigationHistory[currentPathIndex - 1] || "home"}`, { 
        duration: 1500,
        icon: "🔙"
      });
      return;
    } catch (e) {
      console.warn("Cannot navigate back in iframe:", e);
    }
  }
  
  // If we have a prompt parameter and no history, show warning before leaving
  const hasPromptParam = window.location.search.includes('prompt');
  if (hasPromptParam) {
    console.log("⚠️ About to leave builder - showing confirmation");
    
    // Show a toast with action buttons
    toast.warning("⚠️ You're about to leave the builder", {
      duration: 5000,
      position: "bottom-center",
      icon: "🚪",
      action: {
        label: "Stay Here",
        onClick: () => {
          console.log("User chose to stay");
          toast.success("👍 Staying in builder", { duration: 2000 });
        }
      },
      actionButtonStyle: {
        backgroundColor: "#8b5cf6",
        color: "white",
        padding: "4px 12px",
        borderRadius: "8px"
      }
    });
    
    // Also show a confirm dialog for extra safety
    const confirmLeave = window.confirm(
      "⚠️ Going back will take you to the landing page.\n\n" +
      "Your current project will be saved. You can restore it from the sidebar.\n\n" +
      "Click OK to go to landing page, Cancel to stay here."
    );
    
    if (confirmLeave) {
      console.log("User confirmed - going to landing page");
      toast.info("🏠 Taking you to landing page...", { duration: 1500 });
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } else {
      console.log("User cancelled - staying in builder");
      toast.success("✅ Staying in builder", { duration: 2000 });
    }
    return;
  }
  
  // Default: show message before going to landing page
  toast.info("🏠 Going to Scorpio landing page", {
    duration: 2000,
    icon: "🏠",
    position: "bottom-center"
  });
  
  setTimeout(() => {
    window.location.href = '/';
  }, 300);
}, [currentPathIndex, navigationHistory]);








const goForward = useCallback(() => {
  console.log("➡️ Forward button clicked - Current state:", { 
    currentPathIndex, 
    navigationHistoryLength: navigationHistory.length,
    canGoForward: currentPathIndex < navigationHistory.length - 1
  });
  
  if (currentPathIndex < navigationHistory.length - 1 && iframeRef.current?.contentWindow) {
    try {
      console.log("🖼️ Navigating forward within iframe to index:", currentPathIndex + 1);
      
      // Send a message to the iframe to navigate forward
      iframeRef.current.contentWindow.postMessage({ 
        type: 'NAVIGATE_FORWARD', 
        path: navigationHistory[currentPathIndex + 1] 
      }, '*');
      
      // Update local state
      setCurrentPathIndex(prev => prev + 1);
      setVirtualPath(navigationHistory[currentPathIndex + 1] || "/");
      
      toast.success(`📄 Navigating to ${navigationHistory[currentPathIndex + 1] || "next page"}`, { 
        duration: 1500,
        icon: "➡️"
      });
    } catch (e) {
      console.warn("Cannot navigate forward:", e);
    }
  } else {
    console.log("📌 No forward history available");
    toast.info("🔚 No more pages in forward history", { 
      duration: 2000,
      icon: "📌",
      position: "bottom-center"
    });
  }
}, [currentPathIndex, navigationHistory]);










const refreshPreview = useCallback(() => {
  // Clean up old blob URL
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  
  // Create new blob URL directly using rawPreviewHtml
  if (rawPreviewHtml) {
    const processedHtml = getPreviewHTML(rawPreviewHtml);
    const newUrl = URL.createObjectURL(new Blob([processedHtml], { type: 'text/html' }));
    setPreviewUrl(newUrl);
    setPreviewKey(Date.now());
    setPreviewError(null);
    iframeReady.current = false;
    toast.info("Refreshing preview...");
  }
}, [rawPreviewHtml, previewUrl]);








const currentFileContent = useMemo(() => {
  if (!activeFile || !files[activeFile]) return "";
  
  const content = files[activeFile];
  
  // Type guard to check if it's a BinaryImage
  const isBinaryImage = (obj: any): obj is BinaryImage => {
    return obj && typeof obj === 'object' && obj.__type === 'binary_image';
  };
  
  if (isBinaryImage(content)) {
    return `[Binary Image: ${content.filename} (${content.size.toLocaleString()} bytes)]\n\nThis is a binary image file. It will be saved as a real .jpg when you export the project.`;
  }
  
  // Handle regular text files
  if (typeof content === 'string') return content;
  if (typeof content === 'object') return JSON.stringify(content, null, 2);
  
  return String(content);
}, [activeFile, files]);





const getFileLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
    css: 'css', scss: 'scss', html: 'html', json: 'json',
    md: 'markdown', py: 'python'
  };
  return map[ext] || 'javascript';
};










// Type guard to check if an object is a BinaryImage
const isBinaryImage = (obj: any): obj is BinaryImage => {
  return obj && typeof obj === 'object' && obj.__type === 'binary_image';
};












const downloadZip = async () => {
  const zip = new JSZip();
  
  for (const [filePath, content] of Object.entries(files)) {
    if (filePath === "preview_html") continue;
    
    // Type-safe binary image check - using 'as any' to fix TypeScript error
    const isBinaryImage = content && 
      typeof content === 'object' && 
      (content as any).__type === 'binary_image';
    
    if (isBinaryImage && (content as any).data) {
      const binaryContent = content as { data: Uint8Array };
      // Add binary data directly to zip
      zip.file(filePath, binaryContent.data);
      console.log(`📦 Added image to zip: ${filePath} (${binaryContent.data.length} bytes)`);
    }
    // Handle blob URL strings (fallback)
    else if (typeof content === 'string' && content.startsWith('blob:')) {
      try {
        const response = await fetch(content);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        zip.file(filePath, new Uint8Array(arrayBuffer));
        console.log(`📦 Added blob image to zip: ${filePath}`);
      } catch (err) {
        console.error(`Failed to add image ${filePath}:`, err);
      }
    }
    // Handle regular text files
    else if (typeof content === 'string') {
      zip.file(filePath, content);
    }
    // Handle any other objects
    else if (typeof content === 'object' && content !== null) {
      zip.file(filePath, JSON.stringify(content, null, 2));
    }
  }
  
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `scorpio-${currentProjectName || 'project'}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`);
  toast.success("Project exported successfully");
};

const copyCode = () => {
  if (currentFileContent && typeof currentFileContent === 'string') {
    navigator.clipboard.writeText(currentFileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied");
  }
};


















// Add cleanup on component unmount - SIMPLER VERSION
useEffect(() => {
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    // Don't try to access files here - blob URLs will be cleaned up
    // when the page is closed or refreshed
  };
}, [previewUrl]);







// Warn before leaving if saving
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isSaving) {
      e.preventDefault();
      e.returnValue = 'Your project is still saving. Are you sure you want to leave?';
      return e.returnValue;
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isSaving]);




































  



const handleDeployWithOptions = async (options: any) => {
  console.log("Deploying with options:", options);
  
  try {
    let response;
    




// Find this code block (around line 1370)
if (options.platform === "vercel") {
  if (!options.vercelToken) {
    toast.error("Vercel token is required for deployment");
    return;
  }
  
  toast.loading("Deploying to Vercel...", { id: "vercel-deploy" });
  
  response = await fetch(`${BACKEND_URL}/api/deploy-vercel`, {  // ✅ Updated
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      // Add these headers for better security handling
      'Origin': window.location.origin,
    },
    body: JSON.stringify({
      files: files,
      projectName: currentProjectName || prompt?.slice(0, 35) || "scorpio-project",
      vercel_token: options.vercelToken,
      envVars: options.envVars,
      region: options.region,
    }),
    // Add credentials mode
    credentials: 'omit', // or 'include' if your backend needs cookies
  });
      
      const result = await response.json();
      toast.dismiss("vercel-deploy");
      
      if (result.success) {
        toast.success(`🚀 Successfully deployed to Vercel!`, {
          duration: 5000,
          action: {
            label: "Open URL",
            onClick: () => window.open(result.deployment_url, '_blank')
          }
        });
        
        toast.info(`Your project is live at: ${result.deployment_url}`, {
          duration: 8000,
          action: {
            label: "Visit",
            onClick: () => window.open(result.deployment_url, '_blank')
          }
        });
      } else {
        toast.error("Deployment failed: " + (result.message || "Unknown error"));
      }
    } else {
      // For other platforms, use the advanced deploy endpoint (download ZIP)
      response = await fetch('http://localhost:8000/api/deploy-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files,
          projectName: currentProjectName || prompt?.slice(0, 35) || "scorpio-project",
          options: {
            platform: options.platform,
            database: options.database,
            envVars: options.envVars,
            region: options.region,
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Download the zip file
        const binaryData = atob(result.zip_data);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.project_name}-${options.platform}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Deployment package ready for ${options.platform}!`);
        
        if (result.url) {
          toast.info(`Your project will be available at: ${result.url}`, { duration: 5000 });
        }
      } else {
        toast.error("Deployment failed: " + (result.message || "Unknown error"));
      }
    }
  } catch (error) {
    console.error("Deploy error:", error);
    toast.error("Failed to deploy project: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};










  const downloadCurrentFile = () => {
    if (!activeFile || !currentFileContent) return;
    saveAs(new Blob([currentFileContent]), activeFile);
    toast.success(`Downloaded ${activeFile}`);
  };

  const clearSearch = () => setSearchTerm("");

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const clearAllProjects = () => {
    if (confirm("Are you sure you want to delete ALL saved projects?")) {
      setSavedProjects([]);
      localStorage.removeItem("scorpioSavedProjects");
      toast.success("All projects cleared");
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (terminalTimeoutRef.current) clearTimeout(terminalTimeoutRef.current);
      if (debouncePreviewRef.current) clearTimeout(debouncePreviewRef.current);
    };
  }, []);

  if (!mounted) return null;













// Upgrade Modal Component - Shows correct message based on which limit is reached
const UpgradeModal = () => {
  if (!showUpgradeModal) return null;
  
  const remainingCredits = credits.dailyRemaining;
  const isMonthlyLimitReached = credits.monthlyRemaining === 0;
  const isDailyLimitReached = credits.dailyRemaining === 0 && !isMonthlyLimitReached;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowUpgradeModal(false)}
      />
      
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl max-w-sm w-full p-5">
        <button
          onClick={() => setShowUpgradeModal(false)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>
        
        <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${
          isMonthlyLimitReached ? 'from-red-500 to-red-700' : 'from-yellow-500 to-orange-500'
        } flex items-center justify-center mx-auto mb-3`}>
          <AlertCircle className="w-7 h-7 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-center text-white mb-2">
          {isMonthlyLimitReached ? "Monthly Limit Reached!" : "Daily Limit Reached!"}
        </h3>
        
        <div className="text-center mb-4">
          {isMonthlyLimitReached ? (
            <>
              <p className="text-slate-300 text-sm mb-1">You've used all your credits for this month</p>
              <p className="text-xs text-slate-400 mt-2">Upgrade to Premium for unlimited credits!</p>
            </>
          ) : (
            <>
              <p className="text-slate-300 text-sm mb-1">You've used all {credits.dailyLimit} credits for today</p>
              <p className="text-4xl font-bold text-yellow-400">{remainingCredits}</p>
              <p className="text-slate-300 text-sm mt-1">Credits reset tomorrow at midnight</p>
            </>
          )}
        </div>
        
        <div className="border-t border-white/10 my-3"></div>
        
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Wait for Reset</p>
            <p className="text-xs text-slate-400 mt-1">
              {isMonthlyLimitReached ? "Resets next month" : "Tomorrow at midnight"}
            </p>
          </div>
          
          <div className="flex-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-3 text-center border border-cyan-500/30">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Upgrade to Premium</p>
            <p className="text-xs text-cyan-400 mt-1">Get unlimited credits</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setShowUpgradeModal(false);
            window.location.href = "/pricing";
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-base hover:opacity-90 transition-all duration-300"
        >
          Upgrade to Premium 🚀
        </button>
        
        <button
          onClick={() => setShowUpgradeModal(false)}
          className="w-full py-2 text-sm text-slate-400 hover:text-white transition mt-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};









// Credits Info Modal - Shows when user has credits
const CreditsInfoModal = () => {
  if (!showCreditsModal) return null;
  
  const remainingCredits = credits.dailyRemaining;
  
  const getUpgradeText = () => {
    switch (credits.plan) {
      case 'free': return 'Upgrade to Pro';
      case 'pro': return 'Upgrade to Business';
      case 'business': return 'Upgrade to Enterprise';
      default: return 'Upgrade';
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowCreditsModal(false)}
      />
      
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl max-w-sm w-full p-5">
        <button
          onClick={() => setShowCreditsModal(false)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>
        
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-7 h-7 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-center text-white mb-2">Your Credits</h3>
        
        <div className="text-center mb-4">
          <p className="text-slate-300 text-sm mb-1">You have</p>
          <p className="text-5xl font-bold text-green-400">{remainingCredits}</p>
          <p className="text-slate-300 text-sm mt-1">credits remaining today</p>
          <div className="mt-3 p-2 bg-white/5 rounded-lg">
            <p className="text-xs text-slate-400">📅 Monthly: {credits.monthlyRemaining}/{credits.monthlyLimit}</p>
            <p className="text-xs text-slate-400 mt-1">💎 Plan: <span className="capitalize text-yellow-400">{credits.plan}</span></p>
          </div>
        </div>
        
        <div className="border-t border-white/10 my-3"></div>
        
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Close</p>
            <p className="text-xs text-slate-400 mt-1">View your balance</p>
          </div>
          
          <div className="flex-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-3 text-center border border-cyan-500/30">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">{getUpgradeText()}</p>
            <p className="text-xs text-cyan-400 mt-1">Get more credits</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setShowCreditsModal(false);
            window.location.href = "/pricing";
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-base hover:opacity-90 transition-all duration-300"
        >
          {getUpgradeText()} 🚀
        </button>
        
        <button
          onClick={() => setShowCreditsModal(false)}
          className="w-full py-2 text-sm text-slate-400 hover:text-white transition mt-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};












  return (


<div className={`flex flex-col h-screen bg-black text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>

  <style>{mobileStyles}</style>

  {/* Mobile-specific styles for horizontal scrolling */}
  <style>{`
    @media (max-width: 768px) {
      .mobile-horizontal-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
      }
      .mobile-sidebar {
        scroll-snap-align: start;
        min-width: 85vw;
        width: 85vw;
        flex-shrink: 0;
      }
      .mobile-preview {
        scroll-snap-align: start;
        min-width: 100vw;
        width: 100vw;
        flex-shrink: 0;
      }
      .mobile-code-view {
        scroll-snap-align: start;
        min-width: 100vw;
        width: 100vw;
        flex-shrink: 0;
      }
      .mobile-sidebar-collapsed {
        min-width: 60px;
        width: 60px;
      }
      .hide-on-mobile {
        display: none;
      }
      .mobile-header-buttons button span {
        display: none;
      }
      .mobile-header-buttons button svg {
        margin: 0;
      }
    }
  `}</style>





















  {/* Header - EagleCode with Emoji - Fully scrollable on mobile */}
<header className="h-16 border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-amber-900/95 to-slate-900/95 backdrop-blur-xl flex items-center z-50 shrink-0 shadow-lg shadow-amber-500/10">
  
  {/* Scrollable container for ALL header content on mobile */}
  <div className={`flex items-center gap-3 px-3 sm:px-6 w-full ${isMobile ? 'overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent' : 'justify-between'}`}
       style={isMobile ? { 
         overflowX: 'auto', 
         overflowY: 'hidden',
         WebkitOverflowScrolling: 'touch',
         scrollbarWidth: 'thin',
         gap: '16px'
       } : {}}>
    
    {/* Logo Section - Now scrollable on mobile */}
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse-glow text-xl">
        🦅
      </div>
      <div className="flex flex-col flex-shrink-0">
        <span className="font-bold tracking-tighter text-white text-lg leading-none uppercase whitespace-nowrap">EagleCode</span>
        <span className="text-[9px] text-amber-400 font-mono tracking-[0.2em] font-bold whitespace-nowrap">STUDIO</span>
      </div>
    </div>










    {/* Dynamic Input Area - AI-Powered Editing - Scrollable on mobile */}
    <div className="relative flex-1 group min-w-[200px] sm:min-w-[300px]">
      {isEditMode && (loadedFiles || Object.keys(buildFiles).length > 1) ? (
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-lg">
              🦂
            </div>
            <Input
              className="bg-amber-500/10 border-amber-500/30 h-11 text-sm focus:ring-1 focus:ring-amber-500/50 pl-10 pr-12 rounded-xl transition-all text-white placeholder:text-gray-400 w-full"
              placeholder="Describe what you want to change..."
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyIntelligentEdit()}
              autoFocus
            />







            <Button
              onClick={applyIntelligentEdit}
              disabled={isEditingProject}
              className="absolute right-1.5 top-1.5 h-8 w-9 flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full p-0 transition-transform duration-200 active:scale-90 shadow-lg shadow-amber-500/40"
            >
              {isEditingProject ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <ArrowRight size={40} />
              )}
            </Button>















            
          </div>
          <Button
            onClick={() => {
              setIsEditMode(false);
              setEditPrompt("");
            }}
            variant="outline"
            className="h-11 border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl px-4 text-gray-300 hover:text-white transition-all duration-300 flex-shrink-0"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
            <Search size={16} />
          </div>
          <Input
            className="bg-white/5 border-white/10 h-11 text-sm focus:ring-1 focus:ring-purple-500/50 pl-10 pr-12 rounded-xl transition-all text-white placeholder:text-gray-500 backdrop-blur-sm w-full"
            placeholder={loadedFiles ? "Click 'Edit' to modify this project with AI" : "Describe your app or what to change..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}






            onKeyDown={async (e) => {
  if (e.key === "Enter" && !loadedFiles) {
    console.log("🔘 Enter key pressed");
    
    // Set loading state immediately
    setIsCheckingCredits(true);
    
    let creditsNeeded = 2;
    if (prompt.length > 500) creditsNeeded = 3;
    if (prompt.length > 1000) creditsNeeded = 5;
    
    const hasCredits = await checkAndDeductCredits(creditsNeeded, "AI Generation");
    
    setIsCheckingCredits(false);
    
    if (hasCredits) {
      startBuild(prompt);
    }
  }
}}



            disabled={!!loadedFiles}
          />












          <Button
  onClick={async () => {
    console.log("🔘 Generate button clicked");
    console.log("loadedFiles:", loadedFiles);
    console.log("prompt length:", prompt.length);
    
    if (!loadedFiles) {
      // Set loading state immediately
      setIsCheckingCredits(true);
      
      let creditsNeeded = 2;
      if (prompt.length > 500) creditsNeeded = 3;
      if (prompt.length > 1000) creditsNeeded = 5;
      
      console.log("💰 Credits needed:", creditsNeeded);
      console.log("💰 Calling checkAndDeductCredits...");
      
      const hasCredits = await checkAndDeductCredits(creditsNeeded, "AI Generation");
      
      setIsCheckingCredits(false);
      
      console.log("💰 Has credits:", hasCredits);
      
      if (hasCredits) {
        console.log("🚀 Starting build...");
        startBuild(prompt);
      } else {
        console.log("❌ No credits, build cancelled");
      }
    } else {
      console.log("⚠️ loadedFiles is true, skipping generation");
    }
  }}
  disabled={isBuilding || !!loadedFiles || isCheckingCredits}
  className="absolute right-1.5 top-1.5 h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg p-0 transition-all active:scale-90 shadow-lg shadow-purple-500/25"
>
  {isBuilding || isCheckingCredits ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={16} />}
</Button>









        </div>
      )}
    </div>

    {/* Header Buttons - All visible with names */}
    <div className="flex items-center gap-3 flex-shrink-0">












{/* Credits Display - Clickable */}
{user && (
  <button
    onClick={() => setShowUpgradeModal(true)}
    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full border border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all duration-200 cursor-pointer group"
  >
    {/* "C" Credit Icon instead of Zap */}
    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
      <span className="text-[10px] font-bold text-black">C</span>
    </div>
    
    {credits.isLoading ? (
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-300">Loading</span>
        </div>
        <span className="text-[9px] text-slate-400">credits</span>
      </div>
    ) : (
      <div className="flex flex-col">
        <span className="text-xs font-medium text-white">
          {credits.dailyRemaining}/{credits.dailyLimit}
        </span>
        <span className="text-[9px] text-slate-400 capitalize">{credits.plan}</span>
      </div>
    )}
    


  </button>
)}












      {(loadedFiles || Object.keys(buildFiles).length > 1) && !isEditMode && (
        <Button
          onClick={() => setIsEditMode(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 shadow-lg shadow-amber-500/30 whitespace-nowrap"
        >
          <Bot size={20} strokeWidth={2.5} />
          <span>AI Edit</span>
        </Button>
      )}
      
      {loadedFiles && (
        <Button 
          onClick={clearLoadedProject} 
          className="relative group overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border-0 whitespace-nowrap"
        >
          <RefreshCw size={14} className="mr-2 inline-block group-hover:rotate-180 transition-transform duration-500" />
          <span>New Build</span>
        </Button>
      )}
      
      {/* Export Button */}
      <Button 
        onClick={downloadZip} 
        disabled={Object.keys(files).length <= 1}
        className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <Download size={14} className="mr-2 inline-block group-hover:-translate-y-0.5 transition-transform" />
        <span>Export</span>
      </Button>
      
      {/* Fullscreen Button - Hide on mobile */}
      <Button 
        onClick={toggleFullscreen} 
        className="hidden md:flex group bg-white/5 backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border border-white/10 hover:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-300 hover:text-white transition-all duration-300 whitespace-nowrap"
      >
        {isFullscreen ? (
          <>
            <Minimize2 size={12} className="mr-2 group-hover:scale-90 transition-transform" />
            <span>Exit</span>
          </>
        ) : (
          <>
            <Maximize2 size={12} className="mr-2 group-hover:scale-110 transition-transform" />
            <span>Fullscreen</span>
          </>
        )}
      </Button>
      
      {/* View Mode Toggle */}
      <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
        <button 
          onClick={() => setViewMode("preview")} 
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
            viewMode === "preview" 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25" 
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Globe size={12} /> <span>Preview</span>
        </button>
        <button 
          onClick={() => setViewMode("code")} 
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
            viewMode === "code" 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25" 
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Code2 size={12} /> <span>Source</span>
        </button>
      </div>
      
      {/* Deploy Button */}
      <Button 
        onClick={() => setIsDeployModalOpen(true)}
        disabled={Object.keys(files).length <= 1}
        className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <Rocket size={14} className="mr-2 inline-block group-hover:-translate-y-0.5 transition-transform" />
        <span>Deploy</span>
      </Button>
    </div>
  </div>
</header>













  {/* Deploy Modal */}
  <DeployModal
    isOpen={isDeployModalOpen}
    onClose={() => setIsDeployModalOpen(false)}
    files={files}
    projectName={currentProjectName || prompt?.slice(0, 35) || "scorpio-project"}
    onDeploy={handleDeployWithOptions}
  />

  {/* Main Content - Horizontal scroll on mobile */}
  <main className={`flex-1 flex ${isMobile ? 'mobile-horizontal-scroll' : 'overflow-hidden'}`}>
    























    {/* Sidebar - Always visible, scroll-snapped on mobile */}
    <aside className={`${showFileTree ? 'w-80' : 'w-12'} border-r border-white/5 bg-[#020617] flex flex-col z-40 transition-all duration-300 shrink-0 ${isMobile ? (showFileTree ? 'mobile-sidebar' : 'mobile-sidebar-collapsed') : ''}`}>
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
        {showFileTree ? (
          <>
            <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <FolderTree size={14} className="text-blue-500" /> 
              <span className={isMobile ? 'text-xs' : ''}>Filesystem</span>
              {loadedFiles && (
                <span className="ml-2 text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Loaded</span>
              )}
              {isEditMode && (
                <span className="ml-2 text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full animate-pulse">
                  AI Edit Mode
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowFileTree(false)} className="h-6 w-6 p-0 hover:bg-white/5">
              <X size={12} />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowFileTree(true)} className="h-8 w-8 p-0 hover:bg-white/5 mx-auto">
            <FolderTree size={16} className="text-blue-500" />
          </Button>
        )}
      </div>

      {showFileTree && (
        <>
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-8 h-8 text-xs bg-slate-900/40 border-white/5 rounded-lg"
              />
              {searchTerm && <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={12} /></button>}
            </div>
          </div>

          {/* AI Edit Mode Hint */}
          {isEditMode && (
            <div className="mx-3 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="text-xs text-yellow-400">
                  <p className="font-medium mb-1.5">AI-Powered Editing</p>
                  <p className="text-yellow-300/80 text-[11px] mb-2">Just describe what you want to change:</p>
                  <ul className="text-[10px] text-yellow-300/70 space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <span className="text-yellow-500">•</span>
                      <span>"Change the title to 'My Dashboard'"</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-yellow-500">•</span>
                      <span>"Add a dark mode toggle button"</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-yellow-500">•</span>
                      <span>"Make the header background blue"</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-yellow-500">•</span>
                      <span>"Add a contact form with name and email"</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar px-3">
            <FileTree
              files={files}
              searchTerm={searchTerm}
              activeFile={activeFile}
              generatingFile={generatingFile}
              generationLog={generationLog}
              onFileSelect={(path) => {
                setActiveFile(path);
                setViewMode("code");
              }}
              onQuickEdit={(loadedFiles || Object.keys(buildFiles).length > 1) && !isEditMode ? (path) => {
                setIsEditMode(true);
                toast.info(`AI will intelligently edit: ${path}`, { duration: 1500 });
              } : undefined}
              isEditMode={isEditMode}
            />
          </div>
        </>
      )}

      {/* Terminal Display */}
      <div className="mx-4 mb-4 p-3 bg-black/60 border border-blue-500/20 rounded-xl font-mono text-[11px] leading-relaxed shadow-2xl">
        <div className="flex items-center justify-between mb-3 text-slate-500 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Terminal size={11} className="text-blue-400" />
            <span className="text-[10px] font-bold tracking-widest">BUILD TERMINAL</span>
          </div>
          <span className="text-[9px] text-blue-500 animate-pulse">
            {isEditMode ? 'AI EDIT MODE' : (loadedFiles ? 'LOADED' : 'LIVE')}
          </span>
        </div>
        
        <div className="min-h-[60px] flex items-center">
          {isEditMode ? (
            <div className="text-yellow-500 flex items-center gap-9 w-full">
              <span className="text-[10px]">AI will automatically find and edit the right file(s)</span>
            </div>
          ) : loadedFiles ? (
            <div className="text-green-500 flex items-center gap-2 w-full">
              <CheckCircle2 size={12} />
              <span className="text-[10px]">Project loaded. Click "AI Edit" to make changes</span>
            </div>
          ) : isBuilding && !currentTerminalMessage ? (
            <div className="text-blue-400/80 flex items-center gap-2 w-full">
              <Activity size={10} className="animate-spin" />
              <span className="text-[10px]">Initializing Scorpio engine...</span>
            </div>
          ) : currentTerminalMessage ? (
            <div className={`animate-in fade-in slide-in-from-left-2 duration-300 flex items-start gap-2 w-full ${
              currentTerminalMessage.status === 'generating' ? 'text-blue-400' : 'text-slate-300'
            }`}>
              {currentTerminalMessage.status === 'generating' ? (
                <>
                  <Loader2 size={10} className="animate-spin mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-slate-400 text-[10px]">generating</span>
                    <span className="text-blue-400/90 ml-2 font-mono break-all">{currentTerminalMessage.file}</span>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 size={10} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-green-500 font-bold mr-2">✓</span>
                    <span className="text-slate-400 text-[10px]">created</span>
                    <span className="text-slate-300 ml-2 font-mono break-all">{currentTerminalMessage.file}</span>
                  </div>
                </>
              )}
            </div>
          ) : !isBuilding && Object.keys(buildFiles).length > 1 && !loadedFiles ? (
            <div className="text-slate-400 text-[10px]">Build complete. Ready for next prompt or AI edit.</div>
          ) : null}
        </div>
      </div>

      {/* Status Footer */}
      <div className="p-5 bg-blue-600/5 border-t border-blue-500/10 backdrop-blur-md mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">
            {isEditMode ? 'AI Edit Mode' : (loadedFiles ? 'Loaded Project' : (isBuilding ? 'Build Progress' : 'Build Complete'))}
          </span>
          <span className="text-xs font-mono text-blue-300">{loadedFiles ? '100' : progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
          <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${loadedFiles ? 100 : progress}%` }} />
        </div>
        {isEditMode && (
          <div className="mt-3 text-[10px] text-yellow-500 text-center animate-pulse">
          </div>
        )}
        {!isBuilding && !loadedFiles && Object.keys(buildFiles).length > 1 && (
          <div className="mt-3 text-[10px] text-slate-500 text-center">
            ✓ {Object.keys(buildFiles).length - 1} files generated successfully
          </div>
        )}
        {loadedFiles && !isEditMode && (
          <div className="mt-3 text-[10px] text-green-500 text-center">
            ✓ {Object.keys(files).length - 1} files loaded. Click "AI Edit" to make changes
          </div>
        )}
        {buildError && <div className="mt-3 text-[10px] text-red-400 text-center">⚠️ {buildError}</div>}
      </div>
    </aside>



    


    {/* Main Stage */}
    <section className={`flex-1 bg-black/40 flex flex-col relative ${isMobile ? (viewMode === "code" ? 'mobile-code-view' : 'mobile-preview') : ''}`}>
      {viewMode === "code" ? (
        <div className="flex-1 flex flex-col animate-in fade-in duration-300 min-h-0">
          <div className="h-12 px-6 bg-slate-950 border-b border-white/5 flex items-center justify-between shadow-xl shrink-0">
            <div className="flex items-center gap-3 text-xs font-mono">
              <Code2 size={14} className="text-blue-500" />
              <span className="text-slate-600">src/</span>
              <span className="text-blue-400 font-semibold truncate max-w-[420px]">{activeFile || "Select a file"}</span>
              {generatingFile === activeFile && !loadedFiles && (
                <div className="flex items-center gap-1 text-[10px] text-blue-500">
                  <Loader2 size={10} className="animate-spin" />
                  <span>generating...</span>
                </div>
              )}
              {isEditMode && (
                <div className="flex items-center gap-1 text-[10px] text-yellow-500">
                  <Sparkles size={10} />
                  <span>AI edit mode active</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={downloadCurrentFile} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white" disabled={!activeFile}>
                <Download size={16} />
              </button>
              <button onClick={copyCode} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white" disabled={!activeFile}>
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div ref={codeContainerRef} className="flex-1 overflow-auto bg-[#0d1117] custom-scrollbar min-h-0 w-full">
            {activeFile && currentFileContent ? (
              <SyntaxHighlighter
                language={getFileLanguage(activeFile)}
                style={vscDarkPlus}
                showLineNumbers
                wrapLines={false}
                customStyle={{
                  margin: 0,
                  padding: '2rem 2.5rem',
                  background: '#0d1117',
                  fontSize: '14px',
                  lineHeight: '1.65',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  minHeight: '100%',
                  overflow: 'initial' 
                }}
                lineNumberStyle={{ color: '#4b5563', paddingRight: '2.5rem', textAlign: 'right', userSelect: 'none' }}
              >
                {currentFileContent}
              </SyntaxHighlighter>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <Code2 size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Select a file from the sidebar to view its source code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="flex-1 flex flex-col bg-white min-h-0">
          <div className="h-12 px-4 bg-gradient-to-r from-slate-950/95 via-purple-950/90 to-slate-950/95 border-b border-white/10 flex items-center gap-3 shadow-lg backdrop-blur-sm shrink-0">
            {/* Navigation Buttons Group */}
            <div className="flex items-center gap-1.5 bg-black/40 rounded-xl p-1 border border-white/10">
              {/* Back Button */}
              <div className="relative group">
                <button 
                  onClick={goBack} 
                  className="group relative overflow-hidden p-2 rounded-lg transition-all duration-300 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20"
                  title="Go back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
              </div>
              
              {/* Forward Button */}
              <button 
                onClick={goForward} 
                disabled={currentPathIndex === navigationHistory.length - 1}
                className={`group relative overflow-hidden p-2 rounded-lg transition-all duration-300 ${
                  currentPathIndex === navigationHistory.length - 1 
                    ? 'text-slate-600 cursor-not-allowed opacity-50' 
                    : 'text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-1" />
              
              {/* Refresh Button */}
              <button 
                onClick={refreshPreview} 
                className="group relative overflow-hidden p-2 rounded-lg transition-all duration-300 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
              </button>
            </div>
            
            {/* URL Display */}
            <div className="flex-1 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full text-[13px] text-slate-400 flex items-center gap-2 border border-white/10 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
              <span className="text-[11px] font-mono text-slate-500">localhost:3000</span>
              <span className="text-blue-400 font-mono text-sm font-medium tracking-wide truncate">{virtualPath}</span>
            </div>
            
            {/* Preview Info Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Live Preview</span>
            </div>
          </div>







<div className="flex-1 relative overflow-hidden bg-[#020617]">
  {/* Preview Generation Loading */}
  {isGeneratingPreview && (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-purple-900/20 to-[#020617] z-50">
      <div className="relative z-20 flex flex-col items-center">
        <div className="mb-4 flex items-end justify-center gap-1.5 h-16">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-pulse" 
              style={{ 
                height: '30px', 
                animation: `wave 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }} 
            />
          ))}
        </div>
        <h3 className="text-white font-bold text-xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Generating Preview
        </h3>
        <p className="text-slate-400 text-sm">Creating interactive preview...</p>
      </div>
    </div>
  )}

  {/* Loading State for Build */}
  {(isBuilding || (!rawPreviewHtml && !loadedFiles) || (loadedFiles && !showPreviewDelayed)) && !isGeneratingPreview && (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-purple-900/20 to-[#020617] z-40 overflow-hidden">
      <div className="relative z-20 flex flex-col items-center">
        {isBuilding ? (
          <>
            <div className="mb-8 flex items-end justify-center gap-1.5 h-20">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full" style={{ height: '40px', animation: `wave 1.2s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <h3 className="text-white font-bold text-2xl mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Generating your website
            </h3>
          </>
        ) : loadedFiles && !showPreviewDelayed ? (
          <>
            <div className="mb-8 flex items-end justify-center gap-1.5 h-20">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full" style={{ height: '40px', animation: `wave 1.2s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <h3 className="text-white font-bold text-2xl mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Loading Your Project
            </h3>
            <p className="text-slate-400 text-sm">Preparing your preview...</p>
          </>
        ) : null}
      </div>
    </div>
  )}

  {/* Preview iframe */}
  {previewUrl && !isBuilding && showPreviewDelayed && !isGeneratingPreview && (
    <iframe
      key={previewKey}
      ref={iframeRef}
      src={previewUrl}
      className="w-full h-full border-0 bg-[#020617] animate-in fade-in duration-700"
      loading="eager"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
      title="Preview"
      onLoad={() => {
        setPreviewError(null);
        try {
          const iframeWindow = iframeRef.current?.contentWindow;
          if (iframeWindow) {
            setTimeout(() => {
              iframeWindow.postMessage({ type: 'PREVIEW_READY', path: window.location.pathname }, '*');
            }, 100);
          }
        } catch (err) {
          console.warn("Could not notify parent:", err);
        }
      }}
      onError={() => setPreviewError("Failed to load preview")}
    />
  )}
</div>














        </div>
      )}
    </section>
  </main>

  {/* Save indicator */}
  {isAutoSaving && (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-purple-400 border border-purple-500/30 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Loader2 size={12} className="animate-spin" />
      <span>Saving...</span>
    </div>
  )}

  {/* Last saved time indicator */}
  {lastSaveTime && !isAutoSaving && (
    <div className="fixed bottom-4 right-4 z-50 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 text-[10px] text-slate-500 border border-white/10">
      Saved {(() => {
        const seconds = Math.floor((new Date().getTime() - lastSaveTime.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        return `${Math.floor(minutes / 60)}h ago`;
      })()}
    </div>
  )}





  {/* Wave animation keyframes */}
  <style jsx>{`
    @keyframes wave {
      0%, 100% { height: 20px; }
      50% { height: 60px; }
    }
  `}</style>

  {/* Upgrade Modal */}
  <UpgradeModal />

</div>







  );
}