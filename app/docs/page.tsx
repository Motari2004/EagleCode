// app/docs/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, Code, Terminal, Rocket, Zap, Shield, Cpu, Layout,
  ChevronRight, Search, Menu, X, CheckCircle, ArrowRight,
  Sparkles, Globe, Smartphone, Database, Cloud, GitBranch,
  Layers, Palette, Star, Award, Users, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientMotionDiv from "@/components/ClientMotionDiv";
import { useUser } from "@/contexts/UserContext";
import UserProfile from "@/components/UserProfile";

// Documentation sections
const docsSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    items: [
      { id: "introduction", title: "Introduction" },
      { id: "quick-start", title: "Quick Start" },
      { id: "first-project", title: "Your First Project" },
      { id: "key-concepts", title: "Key Concepts" },
    ]
  },
  {
    id: "features",
    title: "Features",
    icon: Sparkles,
    items: [
      { id: "ai-generation", title: "AI Code Generation" },
      { id: "templates", title: "Templates" },
      { id: "real-time", title: "Real-time Preview" },
      { id: "version-control", title: "Version Control" },
      { id: "export", title: "Export Options" },
    ]
  },
  {
    id: "builder",
    title: "Builder Guide",
    icon: Layout,
    items: [
      { id: "editor", title: "Code Editor" },
      { id: "preview", title: "Live Preview" },
      { id: "file-management", title: "File Management" },
      { id: "customization", title: "Customization" },
    ]
  },
  {
    id: "technical",
    title: "Technical",
    icon: Code,
    items: [
      { id: "stack", title: "Technology Stack" },
      { id: "api", title: "API Reference" },
      { id: "deployment", title: "Deployment" },
      { id: "performance", title: "Performance Tips" },
    ]
  },
  {
    id: "faq",
    title: "FAQ",
    icon: MessageCircle,
    items: [
      { id: "common", title: "Common Questions" },
      { id: "troubleshooting", title: "Troubleshooting" },
      { id: "support", title: "Support" },
    ]
  }
];

// Content for each doc section
const docContent: Record<string, React.ReactNode> = {
  introduction: (
    <div>
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Welcome to EagleCode
      </h1>
      <p className="text-slate-300 mb-6 leading-relaxed">
        EagleCode is an AI-powered platform that converts natural language descriptions into production-ready Next.js applications. 
        Stop writing boilerplate and start building amazing web applications faster than ever.
      </p>
      
      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Why EagleCode?
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "⚡ Generate full-stack apps in seconds",
            "🎨 Production-ready Tailwind CSS styling",
            "🔄 Real-time preview and editing",
            "📱 Mobile-responsive by default",
            "🚀 One-click deployment ready",
            "💎 TypeScript support out of the box"
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  "quick-start": (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">Quick Start Guide</h1>
      <p className="text-slate-300 mb-6">Get up and running with EagleCode in 5 minutes.</p>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">1</div>
            <h3 className="text-lg font-semibold text-white">Create an Account</h3>
          </div>
          <p className="text-slate-400 ml-11">Sign up for free at <Link href="/signup" className="text-cyan-400 hover:underline">app.eaglecode.com/signup</Link>. No credit card required for the free tier.</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">2</div>
            <h3 className="text-lg font-semibold text-white">Describe Your Project</h3>
          </div>
          <p className="text-slate-400 ml-11">On the homepage, type a description of what you want to build. For example:</p>
          <pre className="ml-11 mt-3 bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-cyan-400 overflow-x-auto">
            {`"Create a dashboard for a fintech startup with user analytics, transaction history, and a settings page"`}
          </pre>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">3</div>
            <h3 className="text-lg font-semibold text-white">Generate & Edit</h3>
          </div>
          <p className="text-slate-400 ml-11">Click Generate and watch EagleCode build your application. Use the built-in editor to make any changes.</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">4</div>
            <h3 className="text-lg font-semibold text-white">Save & Deploy</h3>
          </div>
          <p className="text-slate-400 ml-11">Save your project instantly. Export as ZIP or deploy directly to Vercel with one click.</p>
        </div>
      </div>
    </div>
  ),

  "first-project": (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">Your First Project</h1>
      <p className="text-slate-300 mb-6">Learn how to create your first AI-generated application.</p>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Tips for Better Results</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Be specific:</strong> Instead of "build a website", try "build a portfolio website with a hero section, about me, projects grid, and contact form"</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Include tech stack:</strong> Mention if you prefer certain libraries or UI patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Start simple:</strong> Build a landing page first, then iterate with more features</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-emerald-400" />
            Example Project Ideas
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Personal blog with markdown support",
              "E-commerce product gallery",
              "Task management dashboard",
              "Weather app with API integration",
              "Recipe collection with search",
              "Fitness tracker"
            ].map((idea, i) => (
              <div key={i} className="text-slate-300 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {idea}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  "ai-generation": (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">AI Code Generation</h1>
      <p className="text-slate-300 mb-6">How EagleCode's AI transforms your ideas into code.</p>
      
      <div className="grid gap-6">
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">🧠 How It Works</h3>
          <p className="text-slate-300 mb-3">EagleCode uses advanced language models trained on millions of Next.js components and patterns. When you describe your project:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300 ml-4">
            <li>Our AI analyzes your requirements and breaks them down into components</li>
            <li>It generates appropriate file structure and routing</li>
            <li>Tailwind CSS classes are applied for styling</li>
            <li>TypeScript types and interfaces are created automatically</li>
            <li>The code is optimized for performance and best practices</li>
          </ol>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">🎯 What Gets Generated</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "React components with proper hooks",
              "Next.js pages and routing",
              "Tailwind CSS styling",
              "TypeScript type definitions",
              "API route handlers",
              "Form validation logic",
              "State management setup",
              "Responsive layouts"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  templates: (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">Templates</h1>
      <p className="text-slate-300 mb-6">Start faster with pre-designed templates.</p>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { name: "SaaS Landing Page", desc: "Conversion-focused with pricing and features" },
          { name: "E-Commerce Store", desc: "Product grid, cart, and checkout flow" },
          { name: "Developer Portfolio", desc: "Showcase projects and skills" },
          { name: "Restaurant Website", desc: "Menu, reservations, and location" },
          { name: "Gym & Fitness", desc: "Classes, trainers, and schedules" },
          { name: "Digital Agency", desc: "Services, portfolio, and contact" },
        ].map((template, i) => (
          <div key={i} className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
            <h3 className="font-semibold text-white mb-1">{template.name}</h3>
            <p className="text-xs text-slate-400">{template.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),

  editor: (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">Code Editor</h1>
      <p className="text-slate-300 mb-6">Powerful editing features to customize your code.</p>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">✨ Editor Features</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Syntax highlighting for TypeScript, JavaScript, HTML, CSS</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Auto-completion and IntelliSense</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Real-time error detection</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Split view for side-by-side editing</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> File tree navigation</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Search and replace across files</li>
          </ul>
        </div>
      </div>
    </div>
  ),

  deployment: (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">Deployment</h1>
      <p className="text-slate-300 mb-6">Deploy your EagleCode projects to production.</p>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">🚀 One-Click Deploy to Vercel</h3>
          <p className="text-slate-300 mb-3">EagleCode integrates seamlessly with Vercel for instant deployments:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300 ml-4">
            <li>Click the "Deploy" button in your project</li>
            <li>Authorize Vercel connection</li>
            <li>Your project is live in seconds</li>
          </ol>
        </div>
        
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">📦 Manual Export</h3>
          <p className="text-slate-300">Export your project as a ZIP file containing all source code. Deploy to any platform that supports Next.js:</p>
          <ul className="mt-3 space-y-1 text-slate-400 text-sm">
            <li>• Vercel (recommended)</li>
            <li>• Netlify</li>
            <li>• AWS Amplify</li>
            <li>• Self-hosted (Node.js server)</li>
          </ul>
        </div>
      </div>
    </div>
  ),

  "common": (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h1>
      
      <div className="space-y-4">
        {[
          { q: "Is EagleCode free?", a: "Yes! EagleCode offers a generous free tier with unlimited project creation and 5 free credits per day for AI generation." },
          { q: "What technologies does it support?", a: "Currently, EagleCode specializes in Next.js 14 with React 18, TypeScript, and Tailwind CSS. More frameworks coming soon." },
          { q: "Can I edit the generated code?", a: "Absolutely! All code is fully editable in our built-in editor. Your changes are saved to the project." },
          { q: "How accurate is the AI?", a: "The AI produces production-ready code with modern best practices. However, for complex business logic, you may need to make adjustments." },
          { q: "Can I use my own API keys?", a: "Yes, you can configure your own API keys for OpenAI, Stripe, and other services in the project settings." },
          { q: "Is there team collaboration?", a: "Team features are coming in Q2 2024. Currently, you can share projects via export or deployment links." }
        ].map((faq, i) => (
          <div key={i} className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
            <p className="text-slate-400">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  ),

  support: (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-white">Support</h1>
      
      <div className="grid gap-4">
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 text-center">
          <MessageCircle className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-white mb-2">Need Help?</h3>
          <p className="text-slate-300 mb-4">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
              Email Support
            </Button>
            <Button variant="outline" className="border-white/20 text-white">
              Discord Community
            </Button>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">📚 Additional Resources</h3>
          <div className="space-y-2">
            <Link href="#" className="flex items-center gap-2 text-cyan-400 hover:underline text-sm">GitHub Repository →</Link>
            <Link href="#" className="flex items-center gap-2 text-cyan-400 hover:underline text-sm">Video Tutorials →</Link>
            <Link href="#" className="flex items-center gap-2 text-cyan-400 hover:underline text-sm">API Documentation →</Link>
          </div>
        </div>
      </div>
    </div>
  )
};

export default function DocsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");

  const currentContent = docContent[activeSection] || docContent.introduction;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#050507] via-[#0f0f1a] to-[#1a1429] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                🦅
              </div>
            </div>
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Eagle<span className="text-amber-500">Code</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <UserProfile />
            ) : (
              <>
                <Button onClick={() => router.push('/signin')} size="sm" variant="ghost">
                  Sign In
                </Button>
                <Button onClick={() => router.push('/signup')} size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-6">
                {docsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id}>
                      <div className="flex items-center gap-2 mb-2 px-3">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {section.title}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              activeSection === item.id
                                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border-l-2 border-cyan-400"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile menu button */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="text-sm">Menu</span>
            </button>
          </div>

          {/* Mobile sidebar */}
          {mobileMenuOpen && (
            <div className="lg:hidden mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <nav className="space-y-6">
                {docsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {section.title}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveSection(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                              activeSection === item.id
                                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-6 md:p-8">
              <ClientMotionDiv
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentContent}
              </ClientMotionDiv>

              {/* Navigation between pages */}
              <div className="mt-12 pt-6 border-t border-white/10 flex justify-between">
                <button
                  onClick={() => {
                    const sections = docsSections.flatMap(s => s.items);
                    const currentIndex = sections.findIndex(i => i.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1].id);
                    }
                  }}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </button>
                <button
                  onClick={() => {
                    const sections = docsSections.flatMap(s => s.items);
                    const currentIndex = sections.findIndex(i => i.id === activeSection);
                    if (currentIndex < sections.length - 1) {
                      setActiveSection(sections[currentIndex + 1].id);
                    }
                  }}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}