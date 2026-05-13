"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

import {
  Sparkles, ArrowRight, Zap, Shield, Code, Star, Rocket, Cpu, Loader2,
  FolderOpen, Trash2, Clock, Layout, ShoppingBag, Briefcase, Coffee, Grid3X3, Terminal,
  ChevronDown, Check, Home, Utensils, Dumbbell, Palette, GraduationCap, Hotel,
  Store, PenTool, Music, Film, Heart, Globe, Layers,CheckCircle,CreditCard,DollarSign,Lightbulb,BarChart3,TrendingUp,Activity,Gauge,PieChart
  

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import ClientMotionDiv from "@/components/ClientMotionDiv";


import { useUser } from "@/contexts/UserContext";
import UserProfile from "@/components/UserProfile";

import { Play, BadgeDollarSign, BookOpen} from "lucide-react";





















// Skeleton loader for projects
const ProjectSkeleton = () => (
  <div className="flex-shrink-0 w-56 sm:w-64">
    <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl overflow-hidden">
      {/* Image skeleton */}
      <div className="w-full h-28 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
        </div>
        
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white/10 rounded animate-pulse" />
            <div className="h-2 w-12 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-2 w-8 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);


















interface SavedProject {
  id: string;
  name: string;
  prompt: string;
  files: Record<string, string>;
  preview_html: string;  // Deprecated - keep for backward compatibility
  preview_url?: string;   // NEW: Cloudinary URL for preview HTML
  thumbnail_url?: string; // NEW: Cloudinary URL for thumbnail
  files_url?: string;     // NEW: Cloudinary URL for ZIP download
  timestamp: string;
  project_type?: string;
}



interface TemplateProject {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  category: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
  iconColor: string;
}

export default function LandingPage() {

    const { user, isLoading: isUserLoading } = useUser();
  const [prompt, setPrompt] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const [clickedTemplateId, setClickedTemplateId] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  

 const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const projectsCache = useRef<{ data: SavedProject[]; timestamp: number } | null>(null);
  const CACHE_DURATION = 3600000; // 1 hour cache (60 minutes * 60 seconds * 1000 milliseconds)
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);








// Helper functions for cache
const saveToCache = (projects: SavedProject[]) => {
  // Only store latest 10 projects
  const latest10 = projects.slice(0, 10);
  localStorage.setItem("projectsCache", JSON.stringify({
    data: latest10,
    timestamp: Date.now()
  }));
  console.log(`💾 Cached ${latest10.length} projects (latest 10)`);
};

const getFromCache = (): { data: SavedProject[]; timestamp: number } | null => {
  const cached = localStorage.getItem("projectsCache");
  if (!cached) return null;
  
  try {
    const parsed = JSON.parse(cached);
    // Check if cache is still valid
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      // Ensure only latest 10 are returned
      const latest10 = parsed.data.slice(0, 10);
      return { ...parsed, data: latest10 };
    }
  } catch (e) {
    console.error("Failed to parse cache:", e);
  }
  return null;
};












const timeAgo = (timestamp: string) => {
  const now = new Date();
  // Parse the timestamp - ensure it's treated as UTC then convert to local
  const then = new Date(timestamp);
  
  // If the timestamp has no timezone info, assume it's UTC
  if (!timestamp.includes('Z') && !timestamp.includes('+')) {
    // Add 'Z' to treat as UTC
    const utcDate = new Date(timestamp + 'Z');
    const diffSeconds = Math.floor((now.getTime() - utcDate.getTime()) / 1000);
    
    if (diffSeconds < 0) return "just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }
  
  // Regular calculation for proper ISO strings
  const diffSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffSeconds < 0) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};










  const templateProjects: TemplateProject[] = [
    {
      id: "template-1",
      name: "SaaS Landing Page",
      description: "Conversion-focused with pricing",
      icon: <Rocket className="w-4 h-4" />,
      prompt: "Build a SaaS website.",
      category: "Business",
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      hoverBorder: "hover:border-blue-500/50",
      iconColor: "text-blue-400"
    },
    {
      id: "template-2",
      name: "E-Commerce Store",
      description: "Product grid & cart",
      icon: <ShoppingBag className="w-4 h-4" />,
      prompt: "Build a complete e-commerce website",
      category: "E-Commerce",
      color: "from-emerald-600 to-teal-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      hoverBorder: "hover:border-emerald-500/50",
      iconColor: "text-emerald-400"
    },
    {
      id: "template-3",
      name: "Dev Portfolio",
      description: "Showcase projects",
      icon: <Terminal className="w-4 h-4" />,
      prompt: "Create a high-end developer portfolio.",
      category: "Portfolio",
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      hoverBorder: "hover:border-purple-500/50",
      iconColor: "text-purple-400"
    },
    {
      id: "template-4",
      name: "Restaurant Website",
      description: "Menu & reservations",
      icon: <Utensils className="w-4 h-4" />,
      prompt: "Build a restaurant website.",
      category: "Restaurant",
      color: "from-orange-600 to-red-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      hoverBorder: "hover:border-orange-500/50",
      iconColor: "text-orange-400"
    },
    {
      id: "template-5",
      name: "Gym & Fitness",
      description: "Classes & trainers",
      icon: <Dumbbell className="w-4 h-4" />,
      prompt: "Create a gym and fitness website.",
      category: "Health",
      color: "from-red-600 to-orange-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      hoverBorder: "hover:border-red-500/50",
      iconColor: "text-red-400"
    },








{
    id: "template-6",
    name: "Analytics Dashboard",
    description: "KPI metrics, charts & reports",
    icon: <Activity className="w-4 h-4" />,
    prompt: "Build an analytics dashboard website with KPI cards, charts, and settings",
    category: "Dashboard",
    color: "from-yellow-600 to-orange-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-pink-500/30",
    hoverBorder: "hover:border-indigo-500/50",
    iconColor: "text-blue-400"
},



    {
      id: "template-7",
      name: "Digital Agency",
      description: "Services & work",
      icon: <Globe className="w-4 h-4" />,
      prompt: "Create a digital agency website with services, portfolio grid, process timeline, team section, and contact form. Use a modern dark theme with gradient accents.",
      category: "Business",
      color: "from-cyan-600 to-blue-600",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      hoverBorder: "hover:border-cyan-500/50",
      iconColor: "text-cyan-400"
    }
  ];

  const features = [
    { icon: <Zap className="w-5 h-5" />, title: "Lightning Fast", description: "Generate code in seconds" },
    { icon: <Shield className="w-5 h-5" />, title: "Type Safe", description: "Full TypeScript support" },
    { icon: <Cpu className="w-5 h-5" />, title: "AI Powered", description: "Understands complex requirements" },
    { icon: <Layout className="w-5 h-5" />, title: "Responsive", description: "Mobile-first design" },
    { icon: <Star className="w-5 h-5" />, title: "Modern Stack", description: "Next.js 14 + React 18" },
    { icon: <Sparkles className="w-5 h-5" />, title: "Tailwind CSS", description: "Utility-first styling" },
    { icon: <Rocket className="w-5 h-5" />, title: "Vercel Ready", description: "One-click deployment" }
  ];

  const stats = [
    { label: "Projects", value: "10K+" },
    { label: "Files Created", value: "500K+" },
    { label: "Developers", value: "25K+" },
    { label: "Uptime", value: "99.9%" }
  ];



const faqItems = [
  { id: "faq-1", question: "How does EagleCode generate code?", answer: "EagleCode uses advanced AI models to analyze your natural language description and generate optimized Next.js code with Tailwind CSS styling, TypeScript types, and modern React patterns." },
  { id: "faq-2", question: "Can I customize generated code?", answer: "Absolutely! All generated code is fully editable. You can modify components, styles, and logic directly in the builder. Your changes are saved to your project repository." },
  { id: "faq-3", question: "What frameworks are supported?", answer: "Currently, EagleCode specializes in Next.js with React, TypeScript, and Tailwind CSS. Support for additional frameworks is coming soon." },
  { id: "faq-5", question: "Is there a free tier?", answer: "Yes! EagleCode offers a free tier with unlimited project creation and all core features included." }
];




  

  const API_URL = 'https://eaglecode2-2.onrender.com';








const loadSavedProjects = async () => {
  console.log("🔵 Starting loadSavedProjects...");
  
  // Get the auth token
  const token = localStorage.getItem("eaglecode_token");
  
  // If no token, user is not logged in - don't fetch projects
  if (!token) {
    console.log("⚠️ No token found, user not logged in");
    setSavedProjects([]);
    setIsLoadingProjects(false);
    return;
  }
  
  // Check cache first
  const cached = getFromCache();
  if (cached) {
    console.log("📦 Loading from localStorage cache (instant)");
    const latest10 = cached.data.slice(0, 10);
    setSavedProjects(latest10);
    setIsLoadingProjects(false);
    return;
  }
  
  console.log("🔄 Fetching projects from server...");
  setIsLoadingProjects(true);
  
  try {
    // Fetch only latest 10 projects from backend
    const response = await fetch(`${API_URL}/api/get-projects?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("📡 Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📊 Response data:", data);
    
    if (data.success && data.projects && data.projects.length > 0) {
      // ✅ Updated to include all Cloudinary URLs
      const projects: SavedProject[] = data.projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        prompt: project.prompt || '',
        files: project.files || {},
        preview_html: project.preview_html || '',
        preview_url: project.preview_url || null,      // ✅ Cloudinary preview URL
        thumbnail_url: project.thumbnail_url || null,  // ✅ Cloudinary thumbnail URL
        files_url: project.files_url || null,          // ✅ Cloudinary ZIP URL
        timestamp: project.timestamp,
        project_type: project.project_type || 'general'
      }));
      
      // Sort by timestamp (newest first)
      const sortedProjects = projects.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Only keep latest 10
      const latest10 = sortedProjects.slice(0, 10);
      
      console.log(`✅ Loaded ${latest10.length} projects (latest 10 out of ${sortedProjects.length} total)`);
      console.log(`   📸 Thumbnails: ${latest10.filter(p => p.thumbnail_url).length} have thumbnails`);
      console.log(`   🖼️ Previews: ${latest10.filter(p => p.preview_url).length} have previews`);
      
      saveToCache(latest10);
      setSavedProjects(latest10);
    } else {
      console.log("No projects found");
      setSavedProjects([]);
    }
  } catch (error) {
    console.error("❌ Failed to load projects:", error);
    setSavedProjects([]);
  } finally {
    console.log("🔵 Setting isLoadingProjects to false");
    setIsLoadingProjects(false);
  }
};











useEffect(() => {
  const loadProjects = async () => {
    // First, try to load from cache instantly
    const cached = localStorage.getItem("projectsCache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSavedProjects(parsed.data);
        console.log(`📦 Loaded ${parsed.data.length} projects from cache (instant!)`);
        
        // Still refresh in background to ensure latest
        setTimeout(() => {
          loadSavedProjects();
        }, 100);
        return;
      } catch(e) {
        console.error("Failed to parse cache:", e);
      }
    }
    
    // No cache or parse error, load from API
    await loadSavedProjects();
  };
  
  if (mounted) {
    loadProjects();
  }
}, [mounted]);

























// Optional: Add a refresh button for manual refresh
const refreshProjects = () => {
  projectsCache.current = null; // Clear cache
  loadSavedProjects();
};










const deleteProject = async (projectId: string, projectName: string) => {
  // Remove from UI immediately (optimistic update)
  setSavedProjects(prev => prev.filter(project => project.id !== projectId));
  
  // Clear cache
  localStorage.removeItem("projectsCache");
  projectsCache.current = null;
  
  // Show toast
  toast.success(`"${projectName}" deleted`, {
    duration: 1500,
    position: "bottom-right",
    icon: "💔"
  });
  
  // Delete from database in background
  try {
    const token = localStorage.getItem("eaglecode_token");
    await fetch(`${API_URL}/api/delete-project/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Delete error:', error);
    loadSavedProjects(); // Re-sync if failed
  }
};








const handleGenerate = () => {
  // Add this check at the beginning
  if (!user) {
    router.push('/signup');
    return;
  }
  
  if (prompt.trim() && !isNavigating) {
    setIsNavigating(true);
    router.push(`/builder?prompt=${encodeURIComponent(prompt)}`);
  }
};










  const handleGetStarted = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };





// In LandingPage.tsx - store only references
const loadProject = async (project: SavedProject) => {
  setLoadingProjectId(project.id);
  
  try {
    console.log(`📂 Loading project: ${project.name}`);
    
    const response = await fetch(`${API_URL}/api/get-project/${project.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("eaglecode_token")}`,
      }
    });
    const data = await response.json();
    
    if (data.success) {
      // ✅ Store ONLY metadata (no file contents)
      sessionStorage.setItem("projectToLoad", JSON.stringify({
        id: data.project.id,
        name: data.project.name,
        prompt: data.project.prompt,
        files_url: data.project.files_url,      // URL to ZIP
        preview_url: data.project.preview_url,  // URL to preview
        thumbnail_url: data.project.thumbnail_url,
        timestamp: data.project.timestamp
      }));
      
      router.push("/builder");
    }
  } catch (error) {
    console.error("Error loading project:", error);
    setLoadingProjectId(null);
  }
};









const loadTemplate = (template: TemplateProject) => {
  if (isNavigating) return;

  setLoadingTemplateId(template.id);
  
  if (!user) {
    // If not logged in, show the animation for a moment then redirect
    setTimeout(() => {
      router.push('/signup');
    }, 2500); 
    return;
  }
  
  setIsNavigating(true);

  // Trigger a loading toast that matches the 3s duration
  toast.loading(`Initializing ${template.name}...`, {
    duration: 2500,
    position: "bottom-right",
  });

  // Precise 3-second delay to let the border colors "run"
  setTimeout(() => {
    router.push(`/builder?prompt=${encodeURIComponent(template.prompt)}`);
  }, 2500); 
};




























  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadSavedProjects();
  }, [mounted]);







// Listen for real-time cache updates from builder
useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "projectsCache") {
            console.log("🔄 Storage event detected - updating projects...");
            
            if (e.newValue) {
                try {
                    const newCache = JSON.parse(e.newValue);
                    const newProjects = newCache.data || [];
                    
                    // ✅ Update the projects state immediately from cache
                    setSavedProjects(newProjects);
                    console.log(`✅ Projects updated from storage: ${newProjects.length} projects`);
                    
                    // ✅ Only show notification if it's not from our own save
                    // Check if this is a cross-tab event
                    if (e.isTrusted) {
                        toast.success("New project added!", {
                            duration: 2000,
                            position: "bottom-right",
                            icon: "✨"
                        });
                    }
                } catch (err) {
                    console.error("Failed to parse storage event:", err);
                    // ❌ REMOVE this - it causes GET /api/get-projects
                    // loadSavedProjects();
                }
            } else {
                // Cache was cleared - don't auto-reload, just clear UI
                setSavedProjects([]);
                console.log("🗑️ Cache cleared, UI updated");
                // ❌ REMOVE this - it causes GET /api/get-projects
                // loadSavedProjects();
            }
        }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
}, []);






// Check for refresh flag when component mounts
useEffect(() => {
    const needRefresh = sessionStorage.getItem("projectsNeedRefresh");
    if (needRefresh === "true") {
        console.log("🔄 Refresh flag detected on mount, clearing cache...");
        sessionStorage.removeItem("projectsNeedRefresh");
        localStorage.removeItem("projectsCache");
        loadSavedProjects();
        toast.success("Projects refreshed!", {
            duration: 1500,
            position: "bottom-right",
            icon: "🔄"
        });
    }
}, []); // Empty array - runs on every mount

// Handle page restore from cache (back/forward navigation)
useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
        if (event.persisted) {
            console.log("📄 Page restored from cache, refreshing projects...");
            const needRefresh = sessionStorage.getItem("projectsNeedRefresh");
            if (needRefresh === "true") {
                sessionStorage.removeItem("projectsNeedRefresh");
                localStorage.removeItem("projectsCache");
            }
            loadSavedProjects();
        }
    };
    
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
}, []);

// Check when tab becomes visible
useEffect(() => {
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            console.log("👁️ Tab visible, checking for new projects...");
            const needRefresh = sessionStorage.getItem("projectsNeedRefresh");
            if (needRefresh === "true") {
                sessionStorage.removeItem("projectsNeedRefresh");
                localStorage.removeItem("projectsCache");
                loadSavedProjects();
                toast.success("Projects updated!", { duration: 1500 });
            }
        }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);












// WebSocket listener for real-time project updates from backend
useEffect(() => {
  let ws: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout;
  
  const connectWebSocket = () => {
    ws = new WebSocket('wss://eaglecode2-2.onrender.com/ws/projects');
    
    ws.onopen = () => {
      console.log("🔌 WebSocket connected - listening for project updates");
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "projects_updated") {
          console.log("📡 Backend says: new project saved! Refreshing...");
          localStorage.removeItem("projectsCache");
          projectsCache.current = null;
          loadSavedProjects();
          toast.success(`New project "${data.project_name || 'created'}!"`, {
            duration: 3000,
            position: "bottom-right",
            icon: "✨"
          });
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };
    
    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected, reconnecting in 3 seconds...");
      reconnectTimeout = setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = () => {
      // SILENT - no console error
      // Just close the connection
      if (ws) ws.close();
    };
  };
  
  connectWebSocket();
  
  return () => {
    if (ws) {
      ws.close();
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
  };
}, []);




  if (!mounted) return null;








return (









<div className="min-h-dvh bg-zinc-950 text-zinc-200 selection:bg-blue-500/30 relative">
  {/* Blue accent glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.08)_0%,_transparent_40%)] pointer-events-none" />
  {/* Micro Dot Pattern */}
  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />









      {/* Professional Background Elements */}
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="orb-3" />
      <div className="noise-overlay" />
      
      {/* Subtle Grid Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">







        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      </div>


















{/* Header - Stylish Version with Demos */}
<header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
  <div className="container mx-auto px-6 h-16 flex items-center justify-between">
    {/* Logo with animation */}
    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => router.push('/')}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white text-base transform group-hover:scale-110 transition-all duration-300">
          🦅
        </div>
      </div>
      <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
        Eagle<span className="text-amber-500">Code</span>
      </span>
    </div>
    





















{/* Navigation Links - Premium SaaS Style */}
<div className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">

  {[
    {
      href: "/demos",
      label: "Demos",
      icon: Play,
      glow: "from-pink-500/20 to-purple-500/20",
      iconColor: "text-pink-400"
    },
    {
      href: "/tips",  // Changed from "/pricing" to "/tips"
      label: "Tips",   // Changed from "Pricing" to "Tips"
      icon: Lightbulb, // Changed from BadgeDollarSign to Lightbulb (need to import)
      glow: "from-amber-500/20 to-yellow-500/20", // Changed to warm colors
      iconColor: "text-amber-400" // Changed to amber for tips/insights
    },
    {
      href: "/docs",
      label: "Docs",
      icon: BookOpen,
      glow: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400"
    },
  ].map((item) => {

    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className="relative group"
      >

        {/* Glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${item.glow} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500`} />

        {/* Main button */}
        <div className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/5 bg-black/20 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-0.5">

          {/* Icon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10">

            <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${item.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <Icon className={`relative w-4 h-4 ${item.iconColor} group-hover:scale-110 transition-transform duration-300`} />

          </div>

          {/* Text */}
          <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300">
            {item.label}
          </span>

          {/* Hover underline */}
          <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent group-hover:w-4/5 transition-all duration-500 -translate-x-1/2" />

        </div>
      </Link>
    );
  })}
</div>















    {/* Auth Buttons with Premium Styling */}
    <div className="flex items-center gap-3">
      {user ? (
        <div className="transform hover:scale-105 transition-transform duration-300">
          <UserProfile />
        </div>
      ) : (
        <>
          <Button 
            onClick={() => router.push('/signin')} 
            size="sm" 
            className="relative h-9 px-4 bg-transparent text-slate-300 hover:text-white hover:bg-white/10 rounded-lg text-sm border border-white/10 transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10">Sign In</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </Button>
          
          <Button 
            onClick={() => router.push('/signup')} 
            size="sm" 
            className="relative h-9 px-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-1">
              Get Started
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            
            {/* Animated shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {/* Subtle pulse animation */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </>
      )}
    </div>
  </div>
  
  {/* Optional: Mobile menu button (for responsive) */}
  <div className="md:hidden absolute right-6 top-4">
    <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="w-5 h-0.5 bg-white mb-1.5" />
      <div className="w-5 h-0.5 bg-white mb-1.5" />
      <div className="w-5 h-0.5 bg-white" />
    </button>
  </div>
</header>




















      {/* Main Content */}
      <main className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <div className="py-16 text-center">
          <ClientMotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
<h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
  Code is now <br />
  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Conversational.</span>
</h1>
            <p className="text-base text-slate-400 max-w-xl mx-auto mb-8">
              Transform natural language into production-ready Next.js architectures. Zero boilerplate, absolute precision.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe a dashboard for a fintech startup..."
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isNavigating}
                  className="h-9 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 rounded-lg text-sm"
                >
                  {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </ClientMotionDiv>




























{/* Recent Projects - REDUCED HEIGHT VERSION */}
{!isLoadingProjects && savedProjects.length > 0 && (
  <ClientMotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 text-left">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-cyan-500 rounded-full" />
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recent Projects</h2>
        <span className="text-[10px] text-slate-500">({savedProjects.length})</span>
      </div>
      {savedProjects.length > 3 && (
        <div className="flex gap-1">
          <button 
            onClick={() => {
              const container = document.getElementById('projects-scroll');
              if (container) container.scrollBy({ left: -280, behavior: 'smooth' });
            }}
            className="w-6 h-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center text-xs"
          >
            ←
          </button>
          <button 
            onClick={() => {
              const container = document.getElementById('projects-scroll');
              if (container) container.scrollBy({ left: 280, behavior: 'smooth' });
            }}
            className="w-6 h-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center text-xs"
          >
            →
          </button>
        </div>
      )}
    </div>















    {/* Horizontal Scroll Container - REDUCED HEIGHT CARDS */}
    <div 
      id="projects-scroll"
      className="flex overflow-x-auto gap-3 pb-3"
      style={{ 
        scrollbarWidth: 'thin',
        overscrollBehaviorX: 'contain',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {savedProjects.map((project, index) => (
        <ClientMotionDiv
          key={project.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className={`flex-shrink-0 w-56 sm:w-64 ${
            deletingProjectId === project.id ? 'animate-glass-break' : ''
          }`}
        >
          <div 
            onClick={() => loadProject(project)}
            className={`group cursor-pointer relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 ${
              loadingProjectId === project.id ? 'opacity-50' : ''
            }`}
          >
            {/* Loading Overlay */}
            {loadingProjectId === project.id && (
              <div className="absolute inset-0 bg-black/80 rounded-xl flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mb-1" />
                <span className="text-[10px] text-cyan-400 font-medium">Loading...</span>
              </div>
            )}
            
            {/* Thumbnail - REDUCED HEIGHT (h-28 instead of h-36) */}
            <div className="relative w-full h-28 bg-slate-900 overflow-hidden">
              {project.thumbnail_url ? (
                <img 
                  src={project.thumbnail_url}
                  alt={project.name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && project.preview_url) {
                      const iframe = document.createElement('iframe');
                      iframe.src = project.preview_url;
                      iframe.className = 'w-full h-full border-0';
                      iframe.style.transform = 'scale(0.85)';
                      iframe.style.transformOrigin = 'top left';
                      iframe.style.pointerEvents = 'none';
                      iframe.title = project.name;
                      parent.removeChild(e.currentTarget);
                      parent.appendChild(iframe);
                    }
                  }}
                />
              ) : project.preview_url ? (
                <iframe
                  src={project.preview_url}
                  className="w-full h-full border-0"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    transform: 'scale(0.85)',
                    transformOrigin: 'top left',
                    pointerEvents: 'none'
                  }}
                  sandbox="allow-same-origin allow-scripts"
                  title={project.name}
                />
              ) : project.preview_html ? (
                <>
                  <iframe
                    srcDoc={project.preview_html}
                    className="w-full h-full border-0"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      transform: 'scale(0.85)',
                      transformOrigin: 'top left',
                      pointerEvents: 'none'
                    }}
                    sandbox="allow-same-origin allow-scripts"
                    title={project.name}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-1 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-[10px] text-slate-500">No preview</p>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Project Info - REDUCED PADDING */}
            <div className="p-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-xs text-white truncate group-hover:text-cyan-400 transition-colors">
                    {project.name}
                  </h3>
                </div>
                
                {/* Delete Button */}
                <div className="relative ml-1">
                  <button 
  onClick={(e) => { 
    e.stopPropagation(); 
    setShowDeleteConfirm(project.id); 
  }} 
  className={`
    text-slate-500 hover:text-red-400 transition p-1
    /* Always visible on mobile */
    opacity-100
    /* Only show on hover for desktop */
    md:opacity-0 md:group-hover:opacity-100
  `}
>
  <Trash2 className="w-3.5 h-3.5" />
</button>
                  
                  {/* Delete Modal */}
                  {showDeleteConfirm === project.id && (
                    <>
                      <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                        onClick={() => setShowDeleteConfirm(null)}
                      />
                      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl p-4 w-64">
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                            <Trash2 className="w-5 h-5 text-red-400" />
                          </div>
                          <h3 className="text-sm font-bold text-white mb-1">Delete Project?</h3>
                          <p className="text-[11px] text-gray-300 mb-3">
                            Delete "<span className="text-red-400 font-medium">{project.name}</span>"?
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setDeletingProjectId(project.id);
                                setShowDeleteConfirm(null);
                                setTimeout(() => {
                                  deleteProject(project.id, project.name);
                                  setDeletingProjectId(null);
                                }, 500);
                              }} 
                              className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-medium transition"
                            >
                              Yes
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setShowDeleteConfirm(null); 
                              }} 
                              className="flex-1 px-2 py-1 bg-gray-500/30 hover:bg-gray-500/50 text-white text-xs rounded-lg font-medium transition"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10">
                <div className="flex items-center gap-1 text-[9px] text-slate-500">
                  <Clock className="w-2 h-2" />
                  <span>{timeAgo(project.timestamp)}</span>
                </div>
                <div className="flex items-center gap-0.5 text-[9px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open</span>
                  <ArrowRight className="w-2 h-2" />
                </div>
              </div>
            </div>
          </div>
        </ClientMotionDiv>
      ))}
    </div>
    
    {/* Scroll Hint - SMALLER */}
    {savedProjects.length > 3 && (
      <div className="flex justify-center mt-2">
        <div className="text-[9px] text-slate-500 animate-pulse flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full">
          <span className="text-cyan-400 text-[10px]">←</span>
          <span>Scroll {savedProjects.length} projects</span>
          <span className="text-cyan-400 text-[10px]">→</span>
        </div>
      </div>
    )}
  </ClientMotionDiv>
)}



















{/* Loading State with Skeletons */}
{isLoadingProjects && savedProjects.length === 0 && (
  <div className="mt-12 text-left">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-cyan-500 rounded-full" />
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recent Projects</h2>
        <div className="w-8 h-3 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
    
    {/* Horizontal scroll skeleton container */}
    <div className="flex overflow-x-auto gap-3 pb-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <ProjectSkeleton key={i} />
      ))}
    </div>
  </div>
)}














{/* Empty State */}
{!isLoadingProjects && savedProjects.length === 0 && (
  <ClientMotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16">
    <div className="text-center py-12 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
        <FolderOpen className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
        Create your first project by describing what you want to build above
      </p>
      <Button 
        onClick={handleGetStarted}
        className="bg-gradient-to-r from-indigo-500 to-green-500 text-white"
      >
        Create Your First Project
      </Button>
    </div>
  </ClientMotionDiv>
)}























{/* Templates Section - Border-only Click Animation */}
<div className="mt-12 text-left">
  <div className="flex items-center gap-2 mb-4">
    <div className="w-1 h-4 bg-cyan-500 rounded-full" />
    <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Templates</h2>
  </div>
  
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
    {templateProjects.map((template) => (
      <div
        key={template.id}
        onClick={() => loadTemplate(template)}
        className={`
          group bg-gradient-to-br ${template.bgColor} 
          border ${template.borderColor} rounded-lg p-2.5 
          hover:${template.hoverBorder} hover:bg-white/10 
          transition-all cursor-pointer backdrop-blur-sm
          relative
          ${loadingTemplateId === template.id ? 'template-card-clicked' : ''}
        `}
      >
        <div className={`
          mb-2 w-7 h-7 rounded-lg bg-gradient-to-br ${template.color} 
          flex items-center justify-center text-white shadow-lg 
          transition-all duration-300
          ${loadingTemplateId === template.id ? 'scale-110' : 'group-hover:scale-110'}
        `}>
          {template.icon}
        </div>
        <h3 className="font-semibold text-[11px] text-white mb-0.5 truncate">{template.name}</h3>
        <p className="text-[9px] text-slate-400 mb-1.5 line-clamp-1">{template.description}</p>
        <div className={`
          flex items-center gap-0.5 text-[8px] ${template.iconColor} 
          transition-all duration-300
          ${loadingTemplateId === template.id ? 'opacity-100 translate-x-1' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}
        `}>
          Use <ArrowRight className="w-2 h-2" />
        </div>
      </div>
    ))}
  </div>
</div>



















{/* Features Section - TIGHTER */}
<div className="mt-12">
  <div className="flex items-center gap-2 mb-4">
    <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
    <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Features</h2>
  </div>
  
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
    {features.map((feature, i) => (
      <ClientMotionDiv
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <div className="group bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-3 text-center hover:border-violet-500/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center text-violet-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
            {feature.icon}
          </div>
          <h3 className="font-semibold text-xs text-white mb-0.5 group-hover:text-violet-400 transition-colors">
            {feature.title}
          </h3>
          <p className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
            {feature.description}
          </p>
        </div>
      </ClientMotionDiv>
    ))}
  </div>
</div>








          {/* Stats Section */}
          <div className="mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => {
                const gradients = [
                  "from-cyan-500 to-blue-500",
                  "from-purple-500 to-pink-500", 
                  "from-emerald-500 to-teal-500",
                  "from-orange-500 to-red-500"
                ];
                return (
                  <ClientMotionDiv 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: i * 0.05 }} 
                    className="relative group bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5 text-center overflow-hidden hover:border-transparent transition-all duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradients[i]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl -z-10`} style={{ padding: '1px' }} />
                    <div className="absolute inset-[1px] bg-slate-900/90 rounded-xl -z-5" />
                    
                    <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${gradients[i]} bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</p>
                  </ClientMotionDiv>
                );
              })}
            </div>
          </div>








{/* FAQ Section */}
<div className="mt-16 max-w-3xl mx-auto pb-16">
  <div className="flex items-center gap-2 mb-6">
    <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
    <h2 className="text-sm font-semibold text-slate-300">Frequently Asked Questions</h2>
  </div>
  <div className="space-y-3">
    {faqItems.map((item, idx) => (
      <ClientMotionDiv
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
      >
        <div className={`bg-gradient-to-br from-white/5 to-white/0 border ${expandedFAQ === item.id ? 'border-amber-500/50' : 'border-white/10'} rounded-xl overflow-hidden transition-all duration-300`}>
          <button 
            onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)} 
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center transition-all duration-300 ${expandedFAQ === item.id ? 'scale-110' : ''}`}>
                <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform duration-300 ${expandedFAQ === item.id ? "rotate-180" : ""}`} />
              </div>
              <span className="text-sm font-medium text-white">{item.question}</span>
            </div>
            <div className={`w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center transition-all duration-300 ${expandedFAQ === item.id ? 'bg-amber-500/20' : ''}`}>
              <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform duration-300 ${expandedFAQ === item.id ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedFAQ === item.id && (
            <div className="px-4 pb-4 pt-2 border-t border-white/10 ml-9">
              <p className="text-xs text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      </ClientMotionDiv>
    ))}
  </div>
</div>






{/* CTA Footer - Compact Container with Content */}
<div className="mt-8 mb-4 flex justify-center">
  <ClientMotionDiv 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }}
    className="w-full max-w-2xl mx-auto bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border border-cyan-500/20 rounded-xl py-4 px-5 text-center"
  >
    {/* Heading */}
    <h2 className="text-base sm:text-lg font-bold mb-1">
      Ready to build{" "}
      <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        something amazing?
      </span>
    </h2>
    
    {/* Description */}
    <p className="text-xs text-slate-400 mb-3">
      Start generating production-ready code in seconds. No setup, no hassle.
    </p>
    
    {/* Buttons Container - Side by side on ALL devices */}
    <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 mb-3">
      <Button 
        onClick={handleGetStarted} 
        className="bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-500 hover:text-white hover:border-transparent rounded-lg px-4 sm:px-5 py-1.5 text-xs font-medium transition-all duration-300 whitespace-nowrap"
      >
        Get Started
        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
      </Button>
      
      <button
  onClick={() => router.push("/pricing")}
  className="ripple-btn group relative overflow-hidden flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 hover:border-amber-500/60 text-xs font-medium text-amber-400 hover:text-white transition-all duration-300 whitespace-nowrap active:scale-95"
>
  <span className="relative z-10 flex items-center gap-1.5">
    View Pricing
    <DollarSign className="w-3 h-3 group-hover:translate-x-0.5 group-hover:scale-110 transition-all duration-300" />
  </span>
  {/* Shine effect */}
  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
</button>
    </div>
    
    {/* Trust Badges */}
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-white/10">
      <div className="flex items-center gap-1">
        <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
        <span className="text-[10px] sm:text-xs text-slate-500">No credit card</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap className="w-2.5 h-2.5 text-cyan-400" />
        <span className="text-[10px] sm:text-xs text-slate-500">5 free credits/day</span>
      </div>
      <div className="flex items-center gap-1">
        <Rocket className="w-2.5 h-2.5 text-purple-400" />
        <span className="text-[10px] sm:text-xs text-slate-500">Instant deploy</span>
      </div>
    </div>
  </ClientMotionDiv>
</div>


        </div>
      </main>




          {/* Footer - Place it HERE, after main, before closing div */}
    <Footer />
    </div>
  );
}