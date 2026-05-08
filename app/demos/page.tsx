"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Filter, ArrowRight, Sparkles, Eye, Code, ExternalLink,
  Clock, Star, TrendingUp, Award, Heart, Play, X,
  CheckCircle, Zap, Shield, Cpu, Layout, Rocket, Terminal,
  ShoppingBag, Utensils, Dumbbell, Coffee, Globe, Music, Film,
  Palette, GraduationCap, Hotel, Store, PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientMotionDiv from "@/components/ClientMotionDiv";

interface Demo {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  prompt: string;
  previewUrl: string;
  thumbnailUrl: string;
  author: string;
  authorAvatar: string;
  likes: number;
  views: number;
  createdAt: string;
  featured?: boolean;
  complexity: "Beginner" | "Intermediate" | "Advanced";
  icon: React.ReactNode;
}

export default function DemosPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedComplexity, setSelectedComplexity] = useState("All");
  const [hoveredDemo, setHoveredDemo] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [likedDemos, setLikedDemos] = useState<Set<string>>(new Set());

  const categories = [
    "All", "E-Commerce", "Portfolio", "Business", "Restaurant", 
    "Health & Fitness", "Creative", "Education", "Travel", "Entertainment"
  ];

  const complexities = ["All", "Beginner", "Intermediate", "Advanced"];

  const demos: Demo[] = [
    {
      id: "demo-1",
      title: "Modern SaaS Dashboard",
      description: "Complete analytics dashboard with charts, user management, and billing",
      category: "Business",
      tags: ["Analytics", "Dashboard", "Subscription"],
      prompt: "Build a SaaS analytics dashboard with revenue charts, user activity, and subscription management",
      previewUrl: "https://example.com/preview/saas-dashboard",
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      author: "Sarah Chen",
      authorAvatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=6366f1&color=fff",
      likes: 1247,
      views: 8923,
      createdAt: "2024-01-15",
      featured: true,
      complexity: "Advanced",
      icon: <Rocket className="w-5 h-5" />
    },
    {
      id: "demo-2",
      title: "Luxury E-Commerce",
      description: "Premium shopping experience with product filters, cart, and checkout",
      category: "E-Commerce",
      tags: ["Shopping", "Payment", "Products"],
      prompt: "Create a luxury e-commerce website with product gallery, size selector, and shopping cart",
      previewUrl: "https://example.com/preview/ecommerce",
      thumbnailUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop",
      author: "Marcus Rivera",
      authorAvatar: "https://ui-avatars.com/api/?name=Marcus+Rivera&background=10b981&color=fff",
      likes: 892,
      views: 6541,
      createdAt: "2024-01-20",
      featured: true,
      complexity: "Intermediate",
      icon: <ShoppingBag className="w-5 h-5" />
    },
    {
      id: "demo-3",
      title: "Developer Portfolio",
      description: "Stunning portfolio with project showcase, blog, and contact form",
      category: "Portfolio",
      tags: ["Developer", "Projects", "Blog"],
      prompt: "Build a modern developer portfolio with GitHub integration, project cards, and blog",
      previewUrl: "https://example.com/preview/portfolio",
      thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&h=400&fit=crop",
      author: "Alex Morgan",
      authorAvatar: "https://ui-avatars.com/api/?name=Alex+Morgan&background=8b5cf6&color=fff",
      likes: 2156,
      views: 12478,
      createdAt: "2024-01-10",
      featured: true,
      complexity: "Intermediate",
      icon: <Terminal className="w-5 h-5" />
    },
    {
      id: "demo-4",
      title: "Gourmet Restaurant",
      description: "Elegant restaurant website with menu, reservations, and gallery",
      category: "Restaurant",
      tags: ["Menu", "Booking", "Gallery"],
      prompt: "Create a fine dining restaurant website with interactive menu, reservation system, and photo gallery",
      previewUrl: "https://example.com/preview/restaurant",
      thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
      author: "Emma Watson",
      authorAvatar: "https://ui-avatars.com/api/?name=Emma+Watson&background=ef4444&color=fff",
      likes: 634,
      views: 4321,
      createdAt: "2024-01-25",
      complexity: "Beginner",
      icon: <Utensils className="w-5 h-5" />
    },
    {
      id: "demo-5",
      title: "Fitness Studio",
      description: "Gym website with class schedules, trainer profiles, and membership",
      category: "Health & Fitness",
      tags: ["Workout", "Trainers", "Membership"],
      prompt: "Build a fitness studio website with class calendar, trainer bios, and membership plans",
      previewUrl: "https://example.com/preview/fitness",
      thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
      author: "James Wilson",
      authorAvatar: "https://ui-avatars.com/api/?name=James+Wilson&background=f59e0b&color=fff",
      likes: 1456,
      views: 9876,
      createdAt: "2024-01-18",
      complexity: "Intermediate",
      icon: <Dumbbell className="w-5 h-5" />
    },
    {
      id: "demo-6",
      title: "Coffee Shop",
      description: "Cozy coffee shop website with menu, story, and location",
      category: "Restaurant",
      tags: ["Cafe", "Menu", "Location"],
      prompt: "Create a warm coffee shop website with drink menu, about story, and Google Maps integration",
      previewUrl: "https://example.com/preview/coffee",
      thumbnailUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
      author: "Sophia Lee",
      authorAvatar: "https://ui-avatars.com/api/?name=Sophia+Lee&background=78350f&color=fff",
      likes: 2345,
      views: 15678,
      createdAt: "2024-01-05",
      featured: true,
      complexity: "Beginner",
      icon: <Coffee className="w-5 h-5" />
    },
    {
      id: "demo-7",
      title: "Digital Agency",
      description: "Creative agency with services, portfolio, and contact",
      category: "Business",
      tags: ["Agency", "Services", "Contact"],
      prompt: "Build a creative digital agency website with service cards, portfolio grid, and contact form",
      previewUrl: "https://example.com/preview/agency",
      thumbnailUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
      author: "David Kim",
      authorAvatar: "https://ui-avatars.com/api/?name=David+Kim&background=06b6d4&color=fff",
      likes: 789,
      views: 5432,
      createdAt: "2024-01-22",
      complexity: "Advanced",
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: "demo-8",
      title: "Art Gallery",
      description: "Elegant art gallery with exhibitions, artists, and virtual tour",
      category: "Creative",
      tags: ["Art", "Exhibitions", "Gallery"],
      prompt: "Create an art gallery website with exhibition listings, artist profiles, and virtual tour",
      previewUrl: "https://example.com/preview/art-gallery",
      thumbnailUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop",
      author: "Isabella Rossi",
      authorAvatar: "https://ui-avatars.com/api/?name=Isabella+Rossi&background=ec4899&color=fff",
      likes: 567,
      views: 3456,
      createdAt: "2024-01-28",
      complexity: "Intermediate",
      icon: <Palette className="w-5 h-5" />
    },
    {
      id: "demo-9",
      title: "Online Course Platform",
      description: "E-learning platform with courses, video lessons, and progress tracking",
      category: "Education",
      tags: ["Courses", "Learning", "Video"],
      prompt: "Build an online course platform with course catalog, video player, and progress tracking",
      previewUrl: "https://example.com/preview/courses",
      thumbnailUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop",
      author: "Dr. Michael Brown",
      authorAvatar: "https://ui-avatars.com/api/?name=Michael+Brown&background=3b82f6&color=fff",
      likes: 1876,
      views: 11234,
      createdAt: "2024-01-12",
      featured: true,
      complexity: "Advanced",
      icon: <GraduationCap className="w-5 h-5" />
    },
    {
      id: "demo-10",
      title: "Music Streaming",
      description: "Modern music player with playlists, albums, and search",
      category: "Entertainment",
      tags: ["Music", "Player", "Playlists"],
      prompt: "Create a music streaming app with playlist management, album art, and audio player",
      previewUrl: "https://example.com/preview/music",
      thumbnailUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop",
      author: "Chris Martin",
      authorAvatar: "https://ui-avatars.com/api/?name=Chris+Martin&background=14b8a6&color=fff",
      likes: 2341,
      views: 16789,
      createdAt: "2024-01-08",
      complexity: "Intermediate",
      icon: <Music className="w-5 h-5" />
    }
  ];

  const handleLike = (demoId: string) => {
    setLikedDemos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(demoId)) {
        newSet.delete(demoId);
      } else {
        newSet.add(demoId);
      }
      return newSet;
    });
  };

  const filteredDemos = demos.filter(demo => {
    const matchesSearch = searchQuery === "" || 
                          demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          demo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          demo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || demo.category === selectedCategory;
    const matchesComplexity = selectedComplexity === "All" || demo.complexity === selectedComplexity;
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const featuredDemos = demos.filter(demo => demo.featured && 
    (searchQuery === "" || 
     demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     demo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0f0f1a] to-[#1a1429] text-white selection:bg-violet-400/30">
      {/* Grid Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
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

      <main className="container mx-auto px-6 py-8 relative z-10">
        {/* Hero Section - Moved after search */}
        <ClientMotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            Explore Amazing{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Websites
            </span>
          </h1>
          
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Discover what you can build with EagleCode. Get inspired by these stunning examples
            and start creating your own masterpiece.
          </p>
        </ClientMotionDiv>

        {/* Search Bar - MOVED TO TOP (before featured section) */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search demos by title, description, or tags..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.slice(0, 6).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Complexity Filters */}
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            <span className="text-xs text-slate-500">Complexity:</span>
            {complexities.map(comp => (
              <button
                key={comp}
                onClick={() => setSelectedComplexity(comp)}
                className={`px-2 py-1 rounded-md text-xs transition-all duration-300 ${
                  selectedComplexity === comp
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {(searchQuery || selectedCategory !== "All" || selectedComplexity !== "All") && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Found <span className="text-cyan-400 font-semibold">{filteredDemos.length}</span> demos
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedComplexity("All");
              }}
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-white"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Featured Section - Only show when no search/filters */}
        {selectedCategory === "All" && selectedComplexity === "All" && searchQuery === "" && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
              <h2 className="text-sm font-semibold text-slate-300">Featured Creations</h2>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredDemos.slice(0, 3).map((demo, idx) => (
                <ClientMotionDiv
                  key={demo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="group relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={demo.thumbnailUrl}
                        alt={demo.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-xs font-semibold">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        Featured
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                            {demo.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">
                              {demo.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <span>{demo.author}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleLike(demo.id)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-all ${
                            likedDemos.has(demo.id) 
                              ? 'text-red-400 bg-red-400/10' 
                              : 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedDemos.has(demo.id) ? 'fill-red-400' : ''}`} />
                          <span className="text-xs">{demo.likes + (likedDemos.has(demo.id) ? 1 : 0)}</span>
                        </button>
                      </div>
                      
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                        {demo.description}
                      </p>
                      
                      <Button 
                        onClick={() => router.push(`/builder?prompt=${encodeURIComponent(demo.prompt)}`)}
                        size="sm"
                        className="w-full h-7 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 rounded-lg text-xs"
                      >
                        Use Template
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </ClientMotionDiv>
              ))}
            </div>
          </div>
        )}

        {/* Demos Grid */}
        {filteredDemos.length > 0 ? (
          <div>
            {/* Show "Search Results" title when searching */}
            {(searchQuery || selectedCategory !== "All" || selectedComplexity !== "All") && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
                <h2 className="text-sm font-semibold text-slate-300">
                  {searchQuery ? `Search Results` : `Filtered Results`}
                </h2>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDemos.map((demo, idx) => (
                <ClientMotionDiv
                  key={demo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onMouseEnter={() => setHoveredDemo(demo.id)}
                  onMouseLeave={() => setHoveredDemo(null)}
                >
                  <div className="group relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={demo.thumbnailUrl}
                        alt={demo.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        demo.complexity === 'Beginner' ? 'bg-emerald-500/90' :
                        demo.complexity === 'Intermediate' ? 'bg-amber-500/90' : 'bg-red-500/90'
                      }`}>
                        {demo.complexity}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                            {demo.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">
                              {demo.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <span>{demo.author}</span>
                              <span>•</span>
                              <Clock className="w-2.5 h-2.5" />
                              <span>{demo.createdAt}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleLike(demo.id)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-all ${
                            likedDemos.has(demo.id) 
                              ? 'text-red-400 bg-red-400/10' 
                              : 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedDemos.has(demo.id) ? 'fill-red-400' : ''}`} />
                          <span className="text-xs">{demo.likes + (likedDemos.has(demo.id) ? 1 : 0)}</span>
                        </button>
                      </div>
                      
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                        {demo.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {demo.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Eye className="w-3 h-3" />
                          <span>{demo.views.toLocaleString()}</span>
                        </div>
                        
                        <Button 
                          onClick={() => router.push(`/builder?prompt=${encodeURIComponent(demo.prompt)}`)}
                          size="sm"
                          className="h-7 px-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 rounded-lg text-xs"
                        >
                          Use Template
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </ClientMotionDiv>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No demos found</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedComplexity("All");
              }}
              className="mt-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}