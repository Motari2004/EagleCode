"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Sparkles, ArrowRight, Zap, Shield, Code, Star, Rocket, Cpu, Loader2,
  FolderOpen, Trash2, Clock, Layout, ShoppingBag, Briefcase, Coffee, Grid3X3, Terminal,
  ChevronDown, Check, Home, Utensils, Dumbbell, Palette, GraduationCap, Hotel,
  Store, PenTool, Music, Film, Heart, Globe, Layers  // 👈 ADD Layers HERE
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ClientMotionDiv from "@/components/ClientMotionDiv";

interface SavedProject {
  id: string;
  name: string;
  prompt: string;
  files: Record<string, string>;
  preview_html: string;
  timestamp: string;
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
  const [prompt, setPrompt] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m`;
    return `${Math.floor(seconds)}s`;
  };




  




// ========== ADD THE STORAGE HELPER FUNCTIONS HERE ==========
const getStorageSize = () => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += localStorage.getItem(key)?.length || 0;
    }
  }
  return total;
}














  const templateProjects: TemplateProject[] = [
  {
    id: "template-1",
    name: "SaaS Landing Page",
    description: "Conversion-focused with pricing",
    icon: <Rocket className="w-4 h-4" />,
    prompt: "Create a modern SaaS landing page with hero section, features grid, pricing plans, testimonials, and a CTA footer. Use Tailwind CSS with a deep indigo theme.",
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
    prompt: "Build an e-commerce store with product grid, product details page, and shopping cart. Use a minimalist aesthetic.",
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
    prompt: "Create a high-end developer portfolio with dark mode, project cards, skills section, and contact form. Use neon accents.",
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
    prompt: "Build a restaurant website with hero section, menu grid, reservation form, gallery, location map, and contact info. Use a warm dark theme.",
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
    prompt: "Create a gym and fitness website with class schedule, trainer profiles, membership plans, BMI calculator, and testimonial section. Use an energetic dark theme with orange accents.",
    category: "Health",
    color: "from-red-600 to-orange-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    hoverBorder: "hover:border-red-500/50",
    iconColor: "text-red-400"
  },
  {
    id: "template-6",
    name: "Coffee Shop",
    description: "Menu & story",
    icon: <Coffee className="w-4 h-4" />,
    prompt: "Build a coffee shop website with hero section, product showcase, about story, brewing guide, and contact information. Use a rustic dark theme with warm brown accents.",
    category: "Restaurant",
    color: "from-amber-600 to-yellow-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    hoverBorder: "hover:border-amber-500/50",
    iconColor: "text-amber-400"
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
    { id: "faq-1", question: "How does Nova Engine generate code?", answer: "Nova Engine uses advanced AI models to analyze your natural language description and generate optimized Next.js code with Tailwind CSS styling, TypeScript types, and modern React patterns." },
    { id: "faq-2", question: "Can I customize generated code?", answer: "Absolutely! All generated code is fully editable. You can modify components, styles, and logic directly in the builder. Your changes are saved to your project repository." },
    { id: "faq-3", question: "What frameworks are supported?", answer: "Currently, Nova Engine specializes in Next.js with React, TypeScript, and Tailwind CSS. Support for additional frameworks is coming soon." },
    { id: "faq-4", question: "How are my projects saved?", answer: "Projects are saved in your browser's local storage and can be exported. We're working on cloud sync for cross-device access." },
    { id: "faq-5", question: "Is there a free tier?", answer: "Yes! Nova Engine offers a free tier with unlimited project creation and basic features." }
  ];



useEffect(() => {
  setMounted(true);
  loadSavedProjects();
}, []);

// 👇 ADD THIS NEW useEffect RIGHT HERE - FOR REAL-TIME PROJECT SYNC
useEffect(() => {
  if (!mounted) return;
  
  // Listen for storage changes (cross-tab)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "scorpioSavedProjects") {
      console.log("🔄 Cross-tab storage change detected");
      loadSavedProjects();
    }
  };
  
  window.addEventListener("storage", handleStorageChange);
  
  // Poll for changes (same-tab) - checks every second
  let lastProjectsString = JSON.stringify(savedProjects);
  const interval = setInterval(() => {
    const saved = localStorage.getItem("scorpioSavedProjects");
    if (saved) {
      const currentProjectsString = saved;
      if (currentProjectsString !== lastProjectsString) {
        console.log("🔄 Same-tab project change detected, reloading...");
        try {
          const parsed = JSON.parse(saved);
          const sorted = parsed.sort((a: SavedProject, b: SavedProject) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setSavedProjects(sorted);
          lastProjectsString = currentProjectsString;
        } catch (e) {
          console.error("Failed to parse saved projects", e);
        }
      }
    }
  }, 1000);
  
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    clearInterval(interval);
  };
}, [mounted, savedProjects]);



const loadSavedProjects = () => {
  const saved = localStorage.getItem("scorpioSavedProjects");
  console.log("📂 Loading saved projects from localStorage:", saved ? "found" : "none");
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const sorted = parsed.sort((a: SavedProject, b: SavedProject) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      console.log(`✅ Loaded ${sorted.length} projects`);
      setSavedProjects(sorted);
    } catch (e) {
      console.error("Failed to parse saved projects", e);
    }
  } else {
    console.log("No saved projects found");
    setSavedProjects([]);
  }
};




  const handleGenerate = () => {
    if (prompt.trim() && !isNavigating) {
      setIsNavigating(true);
      router.push(`/builder?prompt=${encodeURIComponent(prompt)}`);
    }
  };





  const handleGetStarted = () => {
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
      // Smooth scroll to the input
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };





  const loadProject = (project: SavedProject) => {
    sessionStorage.setItem("projectToLoad", JSON.stringify(project));
    router.push("/builder");
  };

  const loadTemplate = (template: TemplateProject) => {
    if (!isNavigating) {
      setIsNavigating(true);
      router.push(`/builder?prompt=${encodeURIComponent(template.prompt)}`);
    }
  };





const deleteProject = (projectId: string) => {
  setShowDeleteConfirm(null);
  const allProjects = JSON.parse(localStorage.getItem("scorpioSavedProjects") || "[]");
  const updatedAll = allProjects.filter((p: SavedProject) => p.id !== projectId);
  localStorage.setItem("scorpioSavedProjects", JSON.stringify(updatedAll));
  const sorted = updatedAll.sort((a: SavedProject, b: SavedProject) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  setSavedProjects(sorted);
  
  // 👇 ADD THIS LINE - Forces other tabs to update
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'scorpioSavedProjects',
    newValue: localStorage.getItem('scorpioSavedProjects')
  }));
};





  if (!mounted) return null;

  return (




<div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0f0f1a] to-[#1a1429] text-white selection:bg-violet-400/30">


      
     {/* Subtle Grid Pattern */}
<div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
</div>










{/* Header */}
<header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
  <div className="container mx-auto px-6 h-14 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2.5">
          <path d="M7 17.5V6.5L17 17.5V6.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      </div>
      <span className="font-bold text-sm tracking-tight">Nova <span className="text-cyan-400">Engine</span></span>
    </div>
    
    <div className="flex items-center gap-3">
      <Link href="/docs" className="text-xs text-slate-400 hover:text-white transition">Docs</Link>
      
      {/* Sign In Button */}
      <Button 
        onClick={() => router.push('/signin')} 
        size="sm" 
        className="h-8 px-3 bg-transparent text-slate-300 hover:text-white hover:bg-white/10 rounded-lg text-xs border border-white/10 transition-all duration-200"
      >
        Sign In
      </Button>
      
      {/* Sign Up Button */}
      <Button 
        onClick={() => router.push('/signup')} 
        size="sm" 
        className="h-8 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 rounded-lg text-xs font-medium shadow-lg shadow-cyan-500/20"
      >
        Sign Up
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </div>
  </div>
</header>













      {/* Main Content */}
      <main className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <div className="py-16 text-center">
          <ClientMotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
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


















            {/* Recent Projects - Horizontal Scroll */}
            {savedProjects.length > 0 && (
              <ClientMotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-16 text-left">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-cyan-500 rounded-full" />
                    <h2 className="text-sm font-semibold text-slate-300">Recent Projects</h2>
                    <span className="text-xs text-slate-500">({savedProjects.length})</span>
                  </div>
                  {savedProjects.length > 4 && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          const container = document.getElementById('projects-scroll');
                          if (container) container.scrollBy({ left: -280, behavior: 'smooth' });
                        }}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center"
                      >
                        ←
                      </button>
                      <button 
                        onClick={() => {
                          const container = document.getElementById('projects-scroll');
                          if (container) container.scrollBy({ left: 280, behavior: 'smooth' });
                        }}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
                









{/* Horizontal Scroll Container */}
<div 
  id="projects-scroll"
  className="flex overflow-x-auto gap-3 pb-4 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
  style={{ 
    scrollbarWidth: 'thin',
    overscrollBehaviorX: 'contain',
    WebkitOverflowScrolling: 'touch'
  }}
  onWheel={(e) => {
    // Prevent browser back/forward when scrolling horizontally
    const container = e.currentTarget;
    const atLeft = container.scrollLeft === 0;
    const atRight = container.scrollLeft + container.clientWidth === container.scrollWidth;
    
    if ((atLeft && e.deltaX < 0) || (atRight && e.deltaX > 0)) {
      e.preventDefault();
    }
  }}
>
  {savedProjects.map((project, index) => (
    <ClientMotionDiv
      key={project.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => loadProject(project)}
      className="group cursor-pointer flex-shrink-0 w-64"
    >
      <div className="relative bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-200 h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="relative">
            {showDeleteConfirm === project.id && (
              <div className="absolute right-0 top-full mt-1 bg-red-950/95 border border-red-500/30 rounded-lg p-2 z-50 min-w-[130px]">
                <p className="text-[10px] text-red-200 mb-2 text-center">Delete project?</p>
                <div className="flex gap-1 justify-center">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      deleteProject(project.id); 
                    }} 
                    className="text-[10px] bg-red-500/40 hover:bg-red-500/60 text-red-200 px-2 py-1 rounded"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setShowDeleteConfirm(null); 
                    }} 
                    className="text-[10px] bg-gray-500/30 hover:bg-gray-500/50 text-gray-300 px-2 py-1 rounded"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowDeleteConfirm(project.id); 
              }} 
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition p-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        <h3 className="font-medium text-sm text-white mb-1 truncate">{project.name}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
          {project.prompt?.slice(0, 60) || "No description"}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Clock className="w-2.5 h-2.5" />
          <span>{timeAgo(project.timestamp)}</span>
        </div>
      </div>
    </ClientMotionDiv>
  ))}
</div>







                
                {/* Scroll Hint */}
                {savedProjects.length > 4 && (
                  <div className="flex justify-center mt-2">
                    <div className="text-[10px] text-slate-500 animate-pulse">
                      ← Scroll to see more →
                    </div>
                  </div>
                )}
              </ClientMotionDiv>
            )}

















{/* Templates Section */}
<div className="mt-16 text-left">
  <div className="flex items-center gap-2 mb-6">
    <div className="w-1 h-5 bg-cyan-500 rounded-full" />
    <h2 className="text-sm font-semibold text-slate-300">Templates</h2>
  </div>
  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {templateProjects.map((template) => (
      <div
        key={template.id}
        onClick={() => loadTemplate(template)}
        className={`group bg-gradient-to-br ${template.bgColor} border ${template.borderColor} rounded-xl p-4 hover:${template.hoverBorder} hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm`}
      >
        <div className={`mb-3 w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {template.icon}
        </div>
        <h3 className="font-semibold text-sm text-white mb-1">{template.name}</h3>
        <p className="text-xs text-slate-400 mb-3">{template.description}</p>
        <div className={`flex items-center gap-1 text-[10px] ${template.iconColor} opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1`}>
          Use Template <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    ))}
  </div>
</div>




















{/* Features Section - Dark Mode */}
<div className="mt-16">
  <div className="flex items-center gap-2 mb-6">
    <div className="w-1 h-5 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
    <h2 className="text-sm font-semibold text-slate-300">Features</h2>
  </div>
  
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
    {features.map((feature, i) => (
      <ClientMotionDiv
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="group bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-6 text-center hover:border-violet-500/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center text-violet-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl group-hover:shadow-violet-500/20">
          {feature.icon}
        </div>
        
        <h3 className="font-semibold text-base text-white mb-2 group-hover:text-violet-400 transition-colors">
          {feature.title}
        </h3>
        
        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
          {feature.description}
        </p>
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
          {/* Animated gradient border on hover */}
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
    <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
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
        <div className={`bg-gradient-to-br from-white/5 to-white/0 border ${expandedFAQ === item.id ? 'border-cyan-500/50' : 'border-white/10'} rounded-xl overflow-hidden transition-all duration-300`}>
          <button 
            onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)} 
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center transition-all duration-300 ${expandedFAQ === item.id ? 'scale-110' : ''}`}>
                <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform duration-300 ${expandedFAQ === item.id ? "rotate-180" : ""}`} />
              </div>
              <span className="text-sm font-medium text-white">{item.question}</span>
            </div>
            <div className={`w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center transition-all duration-300 ${expandedFAQ === item.id ? 'bg-cyan-500/20' : ''}`}>
              <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform duration-300 ${expandedFAQ === item.id ? "rotate-180" : ""}`} />
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
















          {/* CTA Footer */}
          <div className="mt-8 mb-16">
            <ClientMotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border border-cyan-500/20 rounded-xl p-8 text-center">
              <h2 className="text-xl font-bold mb-2">Ready to build something amazing?</h2>
              <p className="text-sm text-slate-400 mb-4">Start generating production-ready code in seconds</p>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 rounded-lg px-6 py-2 text-sm group">
  Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
</Button>
            </ClientMotionDiv>
          </div>
        </div>
      </main>
    </div>
  );
}