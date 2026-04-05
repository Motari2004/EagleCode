"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useBuild } from "@/hooks/useBuild";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeployModal } from "@/components/DeployModal";
import {
  Send, Loader2, FileCode, FolderTree, Download,
  Terminal, Copy, Check, Globe, RefreshCw,
  Sparkles, Layers, Search, Code2, Activity, CheckCircle2,
  Maximize2, Minimize2, X, AlertCircle, Folder, FolderOpen,  Rocket, Save, Trash2, Edit3, Target, Zap
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
  timestamp: string;
}

// FIXED & IMPROVED Preview HTML Wrapper
const getPreviewHTML = (htmlContent: string) => {
  if (!htmlContent || htmlContent.trim() === "") {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Scorpio Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: linear-gradient(135deg, #020617 0%, #0a0f2a 100%);
              min-height: 100vh;
              font-family: system-ui, sans-serif;
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
            <p>Your beautiful multi-page website will appear here once generated.</p>
          </div>
        </body>
      </html>
    `;
  }

  // FIXED: Properly inject AI-generated content into <body>
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Scorpio Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        
        <script>
          (function() {
            function notifyNavigation(url) {
              window.parent.postMessage({ type: "NAVIGATE", path: url }, "*");
            }

            const originalPushState = history.pushState;
            history.pushState = function(state, title, url) {
              originalPushState.call(this, state, title, url);
              if (url) notifyNavigation(url);
              return true;
            };

            const originalReplaceState = history.replaceState;
            history.replaceState = function(state, title, url) {
              originalReplaceState.call(this, state, title, url);
              if (url) notifyNavigation(url);
              return true;
            };

            document.addEventListener('click', function(e) {
              let target = e.target;
              while (target && target.tagName !== 'A') target = target.parentElement;
              if (target && target.tagName === 'A') {
                const href = target.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
                  e.preventDefault(); 
                  e.stopPropagation();
                  const newPath = href.startsWith('/') ? href : '/' + href;
                  history.pushState(null, '', newPath);
                  notifyNavigation(newPath);
                }
              }
            }, true);

            window.addEventListener('popstate', () => notifyNavigation(window.location.pathname));
          })();
        </script>

        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Inter', system-ui, sans-serif; 
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;
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
  const [prompt, setPrompt] = useState("");
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "preview">("preview");
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
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
  const [showPreviewDelayed, setShowPreviewDelayed] = useState(false); // ADD THIS LINE
 




  







  const hasAutoStarted = useRef(false);
  const lastSavedBuildId = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const terminalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncePreviewRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

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










  // Restore last project on startup
  useEffect(() => {
    if (mounted && savedProjects.length > 0 && !loadedFiles && Object.keys(buildFiles).length <= 1 && !isBuilding && !isLoadingProject) {
      const lastProject = savedProjects[0];
      if (lastProject && Object.keys(lastProject.files).length > 0) {
        toast.info(`Last project: "${lastProject.name}"`, {
          duration: 5000,
          action: {
            label: "Restore",
            onClick: () => loadProjectDirectly(lastProject)
          }
        });
      }
    }
  }, [mounted, savedProjects, loadedFiles, buildFiles, isBuilding, isLoadingProject]);








  // Restore last project on startup
  useEffect(() => {
    if (mounted && savedProjects.length > 0 && !loadedFiles && Object.keys(buildFiles).length <= 1 && !isBuilding && !isLoadingProject) {
      const lastProject = savedProjects[0];
      if (lastProject && Object.keys(lastProject.files).length > 0) {
        toast.info(`Last project: "${lastProject.name}"`, {
          duration: 5000,
          action: {
            label: "Restore",
            onClick: () => loadProjectDirectly(lastProject)
          }
        });
      }
    }
  }, [mounted, savedProjects, loadedFiles, buildFiles, isBuilding, isLoadingProject]);















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
        setShowPreviewDelayed(false); // Reset delayed preview state
        
        const fileKeys = Object.keys(project.files);
        if (fileKeys.length > 0) {
          const firstFile = fileKeys.find(f => f !== "preview_html") || fileKeys[0];
          setActiveFile(firstFile);
        }
        
        // Auto-switch to preview mode
        setViewMode("preview");
        
        // Show loading waves for 5 seconds before showing preview
        setTimeout(() => {
          setShowPreviewDelayed(true);
          setPreviewKey(Date.now());
          console.log("✅ 5-second delay complete, showing preview now");
        }, 5000);
        
        // Clear sessionStorage after loading
        sessionStorage.removeItem("projectToLoad");
        
        toast.success(`"${project.name}" loaded - Preview in 5 seconds`, { duration: 3000 });
      } catch (e) {
        console.error("Failed to load project from sessionStorage", e);
        sessionStorage.removeItem("projectToLoad");
      }
    }
  }
}, [mounted, loadedFiles, isBuilding]);













  // Load project directly WITHOUT calling AI
const loadProjectDirectly = useCallback((project: SavedProject) => {
  setIsLoadingProject(true);
  setShowPreviewDelayed(false); // Reset delayed preview state
  
  setLoadedFiles(project.files);
  setPrompt(project.prompt || "");
  setCurrentProjectName(project.name);
  
  const fileKeys = Object.keys(project.files);
  if (fileKeys.length > 0) {
    const firstFile = fileKeys.find(f => f !== "preview_html") || fileKeys[0];
    setActiveFile(firstFile);
  }
  
  // Show loading waves for 5 seconds before showing preview
  setTimeout(() => {
    setShowPreviewDelayed(true);
    setPreviewKey(Date.now());
    console.log("✅ 5-second delay complete, showing preview now");
  }, 5000);
  
  setTimeout(() => {
    setIsLoadingProject(false);
    setIsEditMode(false);
    setEditPrompt("");
    toast.success(`Loaded "${project.name}" successfully`, { duration: 3000 });
  }, 100);
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

  const currentFiles = loadedFiles || buildFiles;
  
  if (Object.keys(currentFiles).length <= 1) {
    toast.error("No project loaded to edit");
    return;
  }

  setIsEditingProject(true);
  
  try {
    const response = await fetch('http://localhost:8000/api/edit-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },



      body: JSON.stringify({
  edit_description: editPrompt,
  all_files: currentFiles,
  existing_preview: rawPreviewHtml || currentFiles.preview_html || "",
  regenerate_preview: true
})



    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    const result = await response.json();
    
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
              ? { ...p, files: updatedFiles, timestamp: new Date().toISOString() }
              : p
          );
          setSavedProjects(updatedProjects);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedProjects));
          console.log("✅ Updated existing project:", existingProject.name);
        } else {
          // Create new project only if no existing project found
          const newProject: SavedProject = {
            id: Date.now().toString(),
            name: currentProjectName || prompt.slice(0, 35) || "Edited Project",
            prompt: prompt || editPrompt,
            files: updatedFiles,
            timestamp: new Date().toISOString()
          };
          const updated = [newProject, ...savedProjects].slice(0, 20);
          setSavedProjects(updated);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updated));
          console.log("✅ Created new project from edit:", newProject.name);
        }
      } else {
        // Update build files directly
        setBuildFiles(updatedFiles);
        
        // Also update saved project if it exists (use prompt as identifier)
        const existingProject = savedProjects.find(p => p.prompt === prompt);
        if (existingProject) {
          const updatedProjects = savedProjects.map(p => 
            p.id === existingProject.id 
              ? { ...p, files: updatedFiles, timestamp: new Date().toISOString() }
              : p
          );
          setSavedProjects(updatedProjects);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedProjects));
          console.log("✅ Updated build project:", existingProject.name);
        } else if (prompt) {
          // Create new project from build mode edit
          const newProject: SavedProject = {
            id: Date.now().toString(),
            name: prompt.slice(0, 35) || "Build Project",
            prompt: prompt,
            files: updatedFiles,
            timestamp: new Date().toISOString()
          };
          const updated = [newProject, ...savedProjects].slice(0, 20);
          setSavedProjects(updated);
          localStorage.setItem("scorpioSavedProjects", JSON.stringify(updated));
          setCurrentProjectName(newProject.name);
          console.log("✅ Created new project from build edit:", newProject.name);
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

// In the applyIntelligentEdit function, after a successful edit:
setTimeout(() => {
  setViewMode("preview");
  setPreviewKey(Date.now()); // Force preview refresh
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
}, [editPrompt, loadedFiles, buildFiles, savedProjects, currentProjectName, setBuildFiles, prompt]);





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








  

  // Auto-save project after successful build - FIXED INFINITE LOOP
useEffect(() => {
  // Only run when build is complete and we have files
  if (!mounted || isBuilding || Object.keys(buildFiles).length <= 1 || buildError || loadedFiles) {
    return;
  }
  
  if (!prompt) return;
  
  const baseName = prompt.slice(0, 35).trim() || "Project";
  
  // Check if project with this EXACT prompt already exists
  const existingProject = savedProjects.find(p => p.prompt === prompt);
  
  // Use a ref to track if we've already saved this build
  const buildId = `${prompt}_${Object.keys(buildFiles).length}_${Date.now()}`;
  if (lastSavedBuildId.current === buildId) return;
  
  if (existingProject) {
    // Update existing project
    const updatedProjects = savedProjects.map(p => 
      p.id === existingProject.id 
        ? { ...p, files: { ...buildFiles }, timestamp: new Date().toISOString(), name: baseName }
        : p
    );
    lastSavedBuildId.current = buildId;
    setSavedProjects(updatedProjects);
    localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedProjects));
    setCurrentProjectName(existingProject.name);
    console.log("✅ Auto-updated existing project:", existingProject.name);
  } else {
    // Create new project
    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: baseName,
      prompt: prompt,
      files: { ...buildFiles },
      timestamp: new Date().toISOString()
    };
    
    lastSavedBuildId.current = buildId;
    const updated = [newProject, ...savedProjects].slice(0, 20);
    setSavedProjects(updated);
    localStorage.setItem("scorpioSavedProjects", JSON.stringify(updated));
    setCurrentProjectName(baseName);
    console.log("✅ Auto-created new project:", baseName);
  }
}, [mounted, isBuilding, buildFiles, prompt, buildError, loadedFiles]);

  // Manual save function
  const manualSave = useCallback(() => {
    const currentFiles = files;
    if (Object.keys(currentFiles).length <= 1) {
      toast.error("No project to save");
      return;
    }
    
    const baseName = prompt.slice(0, 35).trim() || "Untitled";
    const projectName = `${baseName} ${Date.now().toString().slice(-6)}`;
    
    const existingProject = savedProjects.find(p => p.prompt === prompt);
    
    if (existingProject) {
      const updatedProjects = savedProjects.map(p => 
        p.id === existingProject.id 
          ? { ...p, files: { ...currentFiles }, timestamp: new Date().toISOString() }
          : p
      );
      setSavedProjects(updatedProjects);
      localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedProjects));
      toast.success(`Project updated: "${existingProject.name}"`);
    } else {
      const newProject: SavedProject = {
        id: Date.now().toString(),
        name: projectName,
        prompt: prompt,
        files: { ...currentFiles },
        timestamp: new Date().toISOString()
      };
      
      setSavedProjects(prev => {
        const updated = [newProject, ...prev].slice(0, 20);
        localStorage.setItem("scorpioSavedProjects", JSON.stringify(updated));
        return updated;
      });
      setCurrentProjectName(projectName);
      toast.success(`Project saved: "${projectName}"`);
    }
  }, [files, prompt, savedProjects]);

  // Delete project
  const deleteProject = useCallback((projectId: string, projectName: string) => {
    const updated = savedProjects.filter(p => p.id !== projectId);
    setSavedProjects(updated);
    localStorage.setItem("scorpioSavedProjects", JSON.stringify(updated));
    toast.success(`Deleted "${projectName}"`);
    setShowDeleteConfirm(null);
    
    if (loadedFiles && currentProjectName === projectName) {
      clearLoadedProject();
    }
  }, [savedProjects, loadedFiles, currentProjectName, clearLoadedProject]);

  // In ProfessionalBuilder component, replace the auto-start useEffect with this:

// AUTO-START Logic from URL
useEffect(() => {
  const urlPrompt = searchParams.get("prompt");
  if (urlPrompt && !hasAutoStarted.current && !loadedFiles && !isBuilding) {
    console.log("🚀 Auto-starting build with prompt:", urlPrompt);
    setPrompt(urlPrompt);
    // Small delay to ensure component is ready
    setTimeout(() => {
      startBuild(urlPrompt);
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

  // Navigation listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NAVIGATE") {
        const newPath = event.data.path || "/";
        setVirtualPath(newPath);
        setNavigationHistory(prev => [...prev.slice(0, currentPathIndex + 1), newPath]);
        setCurrentPathIndex(prev => prev + 1);
      } else if (event.data?.type === "ERROR") {
        setPreviewError(event.data.error);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentPathIndex]);

  // Preview with debounce
  const rawPreviewHtml = files["preview_html"] || "";
  const previewHtml = useMemo(() => getPreviewHTML(rawPreviewHtml), [rawPreviewHtml]);

  useEffect(() => {
    if (debouncePreviewRef.current) clearTimeout(debouncePreviewRef.current);
    if (rawPreviewHtml) {
      debouncePreviewRef.current = setTimeout(() => {
        setPreviewKey(Date.now());
        setPreviewError(null);
      }, 250);
    }
    return () => { if (debouncePreviewRef.current) clearTimeout(debouncePreviewRef.current); };
  }, [rawPreviewHtml]);

  // Navigation controls
  const goBack = useCallback(() => {
    if (currentPathIndex > 0 && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.history.back();
      setCurrentPathIndex(prev => prev - 1);
      setVirtualPath(navigationHistory[currentPathIndex - 1] || "/");
    }
  }, [currentPathIndex, navigationHistory]);

  const goForward = useCallback(() => {
    if (currentPathIndex < navigationHistory.length - 1 && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.history.forward();
      setCurrentPathIndex(prev => prev + 1);
      setVirtualPath(navigationHistory[currentPathIndex + 1] || "/");
    }
  }, [currentPathIndex, navigationHistory]);

  const refreshPreview = useCallback(() => {
    setPreviewKey(Date.now());
    setPreviewError(null);
    toast.info("Refreshing preview...");
  }, []);

  const currentFileContent = activeFile && files[activeFile]
    ? (typeof files[activeFile] === 'string' ? files[activeFile] : JSON.stringify(files[activeFile], null, 2))
    : "";

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
      css: 'css', scss: 'scss', html: 'html', json: 'json',
      md: 'markdown', py: 'python'
    };
    return map[ext] || 'javascript';
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    Object.keys(files).filter(f => f !== "preview_html").forEach(path => {
      const content = typeof files[path] === 'string' ? files[path] : JSON.stringify(files[path], null, 2);
      zip.file(path, content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `scorpio-${currentProjectName || 'project'}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`);
    toast.success("Project exported successfully");
  };

  const copyCode = () => {
    if (currentFileContent) {
      navigator.clipboard.writeText(currentFileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Code copied");
    }
  };







const handleDeployWithOptions = async (options: any) => {
  console.log("Deploying with options:", options);
  
  try {
    const response = await fetch('http://localhost:8000/api/deploy-advanced', {
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
      
      // If there's a deployment URL, show it
      if (result.url) {
        toast.info(`Your project will be available at: ${result.url}`, { duration: 5000 });
      }
    } else {
      toast.error("Deployment failed: " + (result.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Deploy error:", error);
    toast.error("Failed to prepare deployment package");
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

  return (
    <div className={`flex flex-col h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>



















































{/* Header */}
<header className="h-16 border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl flex items-center justify-between px-6 z-50 shrink-0 shadow-lg shadow-purple-500/10">
  <div className="flex items-center gap-6 flex-1 max-w-3xl">
    <div className="flex items-center gap-2.5">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse-glow">
        <Layers size={20} className="text-white" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold tracking-tighter text-white text-lg leading-none uppercase">Scorpio</span>
        <span className="text-[9px] text-purple-400 font-mono tracking-[0.2em] font-bold">ORGANIZATION</span>
      </div>
    </div>
    
    {/* Dynamic Input Area - AI-Powered Editing */}
    <div className="relative flex-1 group ml-4">
      {isEditMode && (loadedFiles || Object.keys(buildFiles).length > 1) ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
              <Sparkles size={16} />
            </div>
            <Input
              className="bg-amber-500/10 border-amber-500/30 h-11 text-sm focus:ring-1 focus:ring-amber-500/50 pl-10 pr-12 rounded-xl transition-all text-white placeholder:text-gray-400"
              placeholder="Describe what you want to change... (e.g., 'change the title to Welcome', 'add a dark mode button', 'make the header blue')"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyIntelligentEdit()}
              autoFocus
            />
            <Button
              onClick={applyIntelligentEdit}
              disabled={isEditingProject}
              className="absolute right-1.5 top-1.5 h-8 w-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg p-0 transition-all active:scale-90 shadow-lg shadow-amber-500/25"
            >
              {isEditingProject ? <Loader2 className="animate-spin h-4 w-4" /> : <Zap size={16} />}
            </Button>
          </div>
          <Button
            onClick={() => {
              setIsEditMode(false);
              setEditPrompt("");
            }}
            variant="outline"
            className="h-11 border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl px-4 text-gray-300 hover:text-white transition-all duration-300"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
            <Search size={16} />
          </div>
          <Input
            className="bg-white/5 border-white/10 h-11 text-sm focus:ring-1 focus:ring-purple-500/50 pl-10 pr-12 rounded-xl transition-all text-white placeholder:text-gray-500 backdrop-blur-sm"
            placeholder={loadedFiles ? "Click 'Edit' to modify this project with AI" : "Describe your app or what to change..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loadedFiles && startBuild(prompt)}
            disabled={!!loadedFiles}
          />
          <Button
            onClick={() => !loadedFiles && startBuild(prompt)}
            disabled={isBuilding || !!loadedFiles}
            className="absolute right-1.5 top-1.5 h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg p-0 transition-all active:scale-90 shadow-lg shadow-purple-500/25"
          >
            {isBuilding ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={16} />}
          </Button>
        </>
      )}
    </div>
  </div>

  {/* Header Buttons - Deploy at far right */}
  <div className="flex items-center gap-3">
    {(loadedFiles || Object.keys(buildFiles).length > 1) && !isEditMode && (
      <Button 
        onClick={() => setIsEditMode(true)} 
        className="relative group overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 border-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <Sparkles size={15} className="mr-2 inline-block" />
        AI Edit
      </Button>
    )}
    
    {loadedFiles && (
      <Button 
        onClick={clearLoadedProject} 
        className="relative group overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <RefreshCw size={15} className="mr-2 inline-block group-hover:rotate-180 transition-transform duration-500" />
        New Build
      </Button>
    )}
    
    {/* Export Button */}
    <Button 
      onClick={downloadZip} 
      disabled={Object.keys(files).length <= 1}
      className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <Download size={15} className="mr-2 inline-block group-hover:-translate-y-0.5 transition-transform" />
      Export
    </Button>
    
    {/* Fullscreen Button */}
    <Button 
      onClick={toggleFullscreen} 
      className="group bg-white/5 backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border border-white/10 hover:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-300 hover:text-white transition-all duration-300"
    >
      {isFullscreen ? (
        <>
          <Minimize2 size={15} className="mr-2 group-hover:scale-90 transition-transform" />
          Exit
        </>
      ) : (
        <>
          <Maximize2 size={15} className="mr-2 group-hover:scale-110 transition-transform" />
          Fullscreen
        </>
      )}
    </Button>
    
    {/* View Mode Toggle */}
    <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
      <button 
        onClick={() => setViewMode("preview")} 
        className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
          viewMode === "preview" 
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25" 
            : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <Globe size={14} /> Preview
      </button>
      <button 
        onClick={() => setViewMode("code")} 
        className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-2 ${
          viewMode === "code" 
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25" 
            : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <Code2 size={14} /> Source
      </button>
    </div>
    
    {/* Deploy Button - Far Right */}
    <Button 
  onClick={() => setIsDeployModalOpen(true)}
  disabled={Object.keys(files).length <= 1}
  className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
  <Rocket size={15} className="mr-2 inline-block group-hover:-translate-y-0.5 transition-transform" />
  Deploy
</Button>
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

<main className="flex-1 flex overflow-hidden"></main>
























      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
<aside className={`${showFileTree ? 'w-80' : 'w-12'} border-r border-white/5 bg-[#020617] flex flex-col z-40 transition-all duration-300 shrink-0 h-full`}>
  {/* Header - fixed height */}
  <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/20 shrink-0">
    {showFileTree ? (
      <>
        <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <FolderTree size={14} className="text-blue-500" /> Filesystem
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
      {/* Search bar - fixed height */}
      <div className="p-3 border-b border-white/5 shrink-0">
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

      {/* AI Edit Mode Hint - fixed height */}
      {isEditMode && (
        <div className="mx-3 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl shrink-0">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-400">
              <p className="font-medium mb-1.5">✨ AI-Powered Editing</p>
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

      {/* File Tree - THIS IS THE KEY FIX - make it flex-1 and min-h-0 */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar px-3 min-h-0">
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

  {/* Terminal Display - fixed height at bottom */}
  <div className="mx-4 mb-4 p-3 bg-black/60 border border-blue-500/20 rounded-xl font-mono text-[11px] leading-relaxed shadow-2xl shrink-0">
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
      {/* Terminal content - keep as is */}
      {isEditMode ? (
        <div className="text-yellow-500 flex items-center gap-2 w-full">
          <Sparkles size={12} />
          <span className="text-[10px]">✨ AI will automatically find and edit the right file(s)</span>
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

  {/* Status Footer - fixed height at bottom */}
  <div className="p-5 bg-blue-600/5 border-t border-blue-500/10 backdrop-blur-md shrink-0">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">
        {isEditMode ? '✨ AI Edit Mode' : (loadedFiles ? 'Loaded Project' : (isBuilding ? 'Build Progress' : 'Build Complete'))}
      </span>
      <span className="text-xs font-mono text-blue-300">{loadedFiles ? '100' : progress}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${loadedFiles ? 100 : progress}%` }} />
    </div>
    {isEditMode && (
      <div className="mt-3 text-[10px] text-yellow-500 text-center animate-pulse">
        ✨ AI will automatically determine which file(s) to edit based on your description
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
        <section className="flex-1 bg-[#010409] flex flex-col relative overflow-hidden">
          {viewMode === "code" ? (
            /* FIX 1: Added min-h-0 to allow this flex child to shrink within the section */
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

              {/* FIX 2: Added min-h-0 and w-full to ensure overflow-auto works correctly */}
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
                      /* FIX 3: Set overflow to 'initial' so it doesn't fight the parent div's scrollbar */
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
            /* FIX 4: Added min-h-0 here as well for consistency in the preview layout */
            <div className="flex-1 flex flex-col bg-white min-h-0">
              <div className="h-12 px-4 bg-slate-950 border-b border-white/5 flex items-center gap-3 shadow-md shrink-0">
                <div className="flex gap-1">
                  <button onClick={goBack} disabled={currentPathIndex === 0} className={`p-1.5 rounded-lg transition-colors ${currentPathIndex === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>←</button>
                  <button onClick={goForward} disabled={currentPathIndex === navigationHistory.length - 1} className={`p-1.5 rounded-lg transition-colors ${currentPathIndex === navigationHistory.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>→</button>
                  <button onClick={refreshPreview} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"><RefreshCw size={14} /></button>
                </div>
                <div className="flex-1 bg-black/40 px-4 py-1.5 rounded-full text-[13px] text-slate-400 flex items-center gap-2 border border-white/5">
                  <Globe size={14} /> https://localhost:3000<span className="text-blue-400 ml-1">{virtualPath}</span>
                </div>
              </div>























              <div className="flex-1 relative overflow-hidden bg-[#020617]">
  {/* Loading State - Shows while building or waiting for content */}
  {/* For loaded projects: show loading waves until showPreviewDelayed is true */}
  {(isBuilding || (!rawPreviewHtml && !loadedFiles) || (loadedFiles && !showPreviewDelayed)) && (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-purple-900/20 to-[#020617] z-40 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center">
        {isBuilding ? (
          <>
            {/* Wave Loading Animation */}
            <div className="mb-8 flex items-end justify-center gap-1.5 h-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                  style={{
                    height: `${20 + Math.sin(i * 0.8) * 20}px`,
                    animation: `wave 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            <h3 className="text-white font-bold text-2xl mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Generating your website
            </h3>

            <div className="flex gap-1 mb-6 h-8 flex items-center">
              <span className="text-slate-300 text-xl font-bold animate-pulse" style={{ animationDelay: '0s' }}>.</span>
              <span className="text-slate-300 text-xl font-bold animate-pulse" style={{ animationDelay: '0.3s' }}>.</span>
              <span className="text-slate-300 text-xl font-bold animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
            </div>
            
            <div className="w-64 h-2 bg-slate-800/50 rounded-full overflow-hidden mb-4 shadow-lg shadow-blue-500/20">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            
            <p className="text-slate-300 text-sm font-mono tracking-widest">{progress}% <span className="text-blue-400">COMPLETE</span></p>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400 mb-2">
                {generatingFile ? `Creating: ${generatingFile.split('/').pop()}` : 'Initializing Scorpio Engine...'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {Object.keys(buildFiles).length - 1} files generated
              </p>
            </div>
          </>
        ) : loadedFiles && !showPreviewDelayed ? (
          <>
            {/* Special Loading Animation for Loaded Projects */}
            <div className="mb-8 flex items-end justify-center gap-1.5 h-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full"
                  style={{
                    height: `${20 + Math.sin(i * 0.8) * 20}px`,
                    animation: `wave 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            <h3 className="text-white font-bold text-2xl mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Loading Your Project
            </h3>

            <div className="flex gap-1 mb-6 h-8 flex items-center">
              <span className="text-slate-300 text-xl font-bold animate-pulse" style={{ animationDelay: '0s' }}>.</span>
              <span className="text-slate-300 text-xl font-bold animate-pulse" style={{ animationDelay: '0.3s' }}>.</span>
              <span className="text-slate-300 text-xl font-bold animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-sm font-mono mb-2">Preparing your preview...</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-300" />
              </div>
              <p className="text-[11px] text-slate-500 mt-3 font-mono">
                {currentProjectName || "Project"} will appear in a moment
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Idle state with animation */}
            <div className="relative mb-8">
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-2xl animate-pulse" />
              <Sparkles className="text-blue-400 animate-bounce relative z-10" size={56} />
            </div>

            <h3 className="text-white font-bold text-3xl mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Scorpio Engine
            </h3>

            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 shadow-lg shadow-blue-500/50" />

            <p className="text-slate-400 text-center max-w-xs">
              <span className="block text-sm mb-2">✨ Transform Your Ideas Into Reality</span>
              <span className="text-xs text-slate-500">Describe what you want to build or change</span>
            </p>

            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {['AI Powered', 'Production Ready', 'Instant Deploy'].map((feature, i) => (
                <div 
                  key={i}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-blue-300 border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm hover:border-blue-500/50 hover:bg-blue-500/20 transition-all"
                >
                  {feature}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Animated scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49%,rgba(59,130,246,0.03)_50%,transparent_51%)] bg-[size:100%_4px] animate-scanlines pointer-events-none" />
    </div>
  )}

  {/* Preview iframe - Only show when not building AND either not loaded OR delayed preview is ready */}
  {rawPreviewHtml && !isBuilding && (!loadedFiles || showPreviewDelayed) && (
    <iframe
      key={previewKey}
      ref={iframeRef}
      srcDoc={previewHtml}
      className="w-full h-full border-0 bg-[#020617] animate-in fade-in duration-700"
      loading="eager"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
      onLoad={() => setPreviewError(null)}
      onError={() => setPreviewError("Failed to load preview")}
    />
  )}

  {/* Wave animation keyframes */}
  <style jsx>{`
    @keyframes wave {
      0%, 100% {
        height: 20px;
      }
      50% {
        height: 60px;
      }
    }
  `}</style>
</div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}