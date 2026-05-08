"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Menu, X, ChevronRight, ChevronDown, BookOpen, Terminal,
  Rocket, Zap, Shield, Cpu, Layout, Sparkles, Code, Globe,
  Database, Server, Cloud, GitBranch, Smartphone, Lock,
  Users, Settings, HelpCircle, MessageCircle, Mail, ArrowRight,
  CheckCircle, AlertCircle, ExternalLink, Copy, Check, Play,
  FolderTree, FileCode, Layers, Box, Package, Wrench, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientMotionDiv from "@/components/ClientMotionDiv";

export default function DocsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["getting-started"]));
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const navigation = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Rocket className="w-4 h-4" />,
      items: [
        { id: "introduction", title: "Introduction", href: "#introduction" },
        { id: "quick-start", title: "Quick Start", href: "#quick-start" },
        { id: "first-project", title: "Your First Project", href: "#first-project" },
        { id: "key-concepts", title: "Key Concepts", href: "#key-concepts" },
      ]
    },
    {
      id: "core-features",
      title: "Core Features",
      icon: <Zap className="w-4 h-4" />,
      items: [
        { id: "ai-generation", title: "AI Generation", href: "#ai-generation" },
        { id: "real-time-editing", title: "Real-Time Editing", href: "#real-time-editing" },
        { id: "template-system", title: "Template System", href: "#template-system" },
        { id: "project-management", title: "Project Management", href: "#project-management" },
      ]
    },
    {
      id: "builder",
      title: "Builder Guide",
      icon: <Code className="w-4 h-4" />,
      items: [
        { id: "interface", title: "Interface Overview", href: "#interface" },
        { id: "code-editor", title: "Code Editor", href: "#code-editor" },
        { id: "preview", title: "Live Preview", href: "#preview" },
        { id: "file-management", title: "File Management", href: "#file-management" },
      ]
    },
    {
      id: "prompt-engineering",
      title: "Prompt Engineering",
      icon: <Sparkles className="w-4 h-4" />,
      items: [
        { id: "best-practices", title: "Best Practices", href: "#best-practices" },
        { id: "examples", title: "Examples", href: "#examples" },
        { id: "advanced-techniques", title: "Advanced Techniques", href: "#advanced-techniques" },
        { id: "common-patterns", title: "Common Patterns", href: "#common-patterns" },
      ]
    },
    {
      id: "technologies",
      title: "Technologies",
      icon: <Layers className="w-4 h-4" />,
      items: [
        { id: "nextjs", title: "Next.js 14", href: "#nextjs" },
        { id: "react", title: "React 18", href: "#react" },
        { id: "typescript", title: "TypeScript", href: "#typescript" },
        { id: "tailwind", title: "Tailwind CSS", href: "#tailwind" },
      ]
    },
    {
      id: "deployment",
      title: "Deployment",
      icon: <Cloud className="w-4 h-4" />,
      items: [
        { id: "vercel", title: "Vercel Deployment", href: "#vercel" },
        { id: "netlify", title: "Netlify Deployment", href: "#netlify" },
        { id: "custom-domain", title: "Custom Domain", href: "#custom-domain" },
        { id: "environment-variables", title: "Environment Variables", href: "#environment-variables" },
      ]
    },
    {
      id: "api",
      title: "API Reference",
      icon: <Database className="w-4 h-4" />,
      items: [
        { id: "authentication", title: "Authentication", href: "#authentication" },
        { id: "projects", title: "Projects API", href: "#projects-api" },
        { id: "generation", title: "Generation API", href: "#generation-api" },
        { id: "webhooks", title: "Webhooks", href: "#webhooks" },
      ]
    },
    {
      id: "faq",
      title: "FAQ",
      icon: <HelpCircle className="w-4 h-4" />,
      items: [
        { id: "general", title: "General Questions", href: "#general" },
        { id: "technical", title: "Technical Issues", href: "#technical" },
        { id: "billing", title: "Billing & Pricing", href: "#billing" },
        { id: "support", title: "Support", href: "#support" },
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const codeExamples = {
    quickStart: `npx create-next-app@latest my-app --typescript --tailwind --eslint
cd my-app
npm run dev`,
    
    generatePrompt: `// Example prompt for a landing page
"Build a modern SaaS landing page with:
- Hero section with headline and CTA
- Features grid with icons
- Pricing table with 3 tiers
- Testimonial carousel
- Footer with links

Use Tailwind CSS for styling, make it responsive, and use a dark theme with gradient accents."`,
    
    apiExample: `// Fetch user projects
const response = await fetch('https://api.eaglecode.com/v1/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.projects);`,
    
    vercelDeploy: `// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}`,
    
    componentExample: `// Generated React Component
import { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white',
    secondary: 'bg-white/10 text-white border border-white/20'
  };
  
  return (
    <button
      className={\`px-6 py-3 rounded-lg font-semibold transition-all duration-300 \${variants[variant]}\`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {label}
    </button>
  );
};`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0f0f1a] to-[#1a1429] text-white selection:bg-violet-400/30">
      {/* Grid Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => router.push('/')}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl text-white text-base transform group-hover:scale-110 transition-all duration-500">
                  🦅
                </div>
              </div>
              <span className="font-bold text-base tracking-tight">
                Eagle<span className="text-amber-500">Code</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-1 ml-4 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-slate-300">Documentation</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => router.push('/signin')} 
              size="sm" 
              className="h-9 px-5 bg-transparent text-slate-300 hover:text-white hover:bg-white/10 rounded-full text-sm border border-white/10 transition-all duration-300"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => router.push('/signup')} 
              size="sm" 
              className="h-9 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-purple-500/30 rounded-full text-sm font-semibold transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex">
          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-16 left-0 bottom-0 w-72 bg-black/60 backdrop-blur-xl border-r border-white/10
            transform transition-transform duration-300 overflow-y-auto z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documentation..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
              
              {/* Navigation */}
              <nav className="space-y-4">
                {filteredNavigation.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-cyan-400">{section.icon}</div>
                        <span className="text-sm font-medium text-white">{section.title}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedSections.has(section.id) ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {expandedSections.has(section.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {section.items.map((item) => (
                          <a
                            key={item.id}
                            href={item.href}
                            onClick={() => setActiveSection(item.id)}
                            className={`block px-2 py-1.5 text-sm rounded-lg transition-colors ${
                              activeSection === item.id
                                ? 'text-cyan-400 bg-cyan-500/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {item.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-72 py-8 px-4 lg:px-8 max-w-4xl">
            {/* Introduction */}
            <section id="introduction" className="mb-12 scroll-mt-20">
              <ClientMotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-4">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-medium text-cyan-400">Documentation</span>
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      EagleCode
                    </span>
                  </h1>
                  
                  <p className="text-base text-slate-400 leading-relaxed">
                    EagleCode is an AI-powered platform that transforms natural language descriptions 
                    into production-ready Next.js applications. This documentation will guide you through 
                    everything you need to know to build amazing websites faster than ever.
                  </p>
                </div>
              </ClientMotionDiv>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-cyan-400" />
                Quick Start
              </h2>
              <p className="text-slate-400 mb-4">
                Get started with EagleCode in minutes. Follow these simple steps to create your first project.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Sign Up for Free</h3>
                    <p className="text-sm text-slate-400">
                      Create your free account at <a href="/signup" className="text-cyan-400 hover:underline">app.eaglecode.com/signup</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Describe Your Project</h3>
                    <p className="text-sm text-slate-400 mb-2">
                      Enter a prompt describing what you want to build. Be specific about features, design, and functionality.
                    </p>
                    <div className="relative">
                      <pre className="bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto">
                        <code>{codeExamples.generatePrompt}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(codeExamples.generatePrompt, "generate-prompt")}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {copiedCode === "generate-prompt" ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Generate & Edit</h3>
                    <p className="text-sm text-slate-400">
                      Click Generate and watch EagleCode create your project. Use the built-in editor to make real-time changes.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Deploy</h3>
                    <p className="text-sm text-slate-400">
                      Deploy your project to production with one click. Connect your GitHub or deploy directly to Vercel.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Code Example */}
            <section id="first-project" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">Your First Project</h2>
              <p className="text-slate-400 mb-4">
                Here's an example of what EagleCode can generate. This component was created from a simple prompt.
              </p>
              
              <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/30">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-white">Button.tsx</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(codeExamples.componentExample, "component-example")}
                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  >
                    {copiedCode === "component-example" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
                <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                  <code>{codeExamples.componentExample}</code>
                </pre>
              </div>
            </section>

            {/* Features Grid */}
            <section id="key-concepts" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">Key Concepts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <Zap />, title: "AI Generation", desc: "Natural language to production code" },
                  { icon: <Layout />, title: "Real-time Preview", desc: "See changes instantly" },
                  { icon: <Terminal />, title: "Code Editor", desc: "Full IDE experience" },
                  { icon: <GitBranch />, title: "Version Control", desc: "Save and track changes" },
                ].map((feature, i) => (
                  <div key={i} className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400 mb-3">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* API Example */}
            <section id="api" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">API Reference</h2>
              <p className="text-slate-400 mb-4">
                Use our REST API to programmatically manage your projects.
              </p>
              
              <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/30">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-mono">GET</div>
                    <span className="text-sm font-mono text-slate-300">/v1/projects</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(codeExamples.apiExample, "api-example")}
                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  >
                    {copiedCode === "api-example" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
                <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                  <code>{codeExamples.apiExample}</code>
                </pre>
              </div>
            </section>

            {/* Deployment */}
            <section id="deployment" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">Deployment</h2>
              <p className="text-slate-400 mb-4">
                Deploy your EagleCode projects to production with these simple configurations.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-cyan-400" />
                    Vercel Deployment
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">
                    Create a <code className="text-cyan-400">vercel.json</code> file in your project root:
                  </p>
                  <div className="relative">
                    <pre className="bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-slate-300 overflow-x-auto">
                      <code>{codeExamples.vercelDeploy}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(codeExamples.vercelDeploy, "vercel-deploy")}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedCode === "vercel-deploy" ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Support Section */}
            <section id="support" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
              <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Join our Community</h3>
                      <p className="text-sm text-slate-400">Get help from other developers</p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                    Join Discord
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="border-t border-white/10 my-4" />
                
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Email Support</h3>
                      <p className="text-sm text-slate-400">24/7 response within 24 hours</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    support@eaglecode.com
                  </Button>
                </div>
              </div>
            </section>

            {/* Feedback */}
            <div className="border-t border-white/10 pt-8 mt-8 text-center">
              <p className="text-sm text-slate-400">
                Was this documentation helpful?{" "}
                <button className="text-cyan-400 hover:underline">Give feedback</button>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}