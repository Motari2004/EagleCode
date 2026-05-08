// app/tips/page.jsx or pages/tips.jsx depending on your setup
import { Lightbulb, Sparkles, Zap, Bookmark, ChevronRight, TrendingUp, Clock, Users, Star, ArrowRight } from 'lucide-react';

export default function TipsPage() {
  const tipCategories = [
    {
      title: "Getting Started",
      icon: Sparkles,
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
      tips: [
        "Set up your workspace in under 5 minutes",
        "Keyboard shortcuts that save 2+ hours weekly",
        "First 3 features you should master",
        "Common pitfalls and how to avoid them"
      ]
    },
    {
      title: "Advanced Strategies",
      icon: TrendingUp,
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      tips: [
        "Leverage AI for 10x faster results",
        "Automation workflows pros don't share",
        "Data-driven decisions that boost ROI",
        "Integration patterns that scale"
      ]
    },
    {
      title: "Team Collaboration",
      icon: Users,
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      tips: [
        "Real-time collaboration best practices",
        "Permission settings for different roles",
        "Efficient review workflows",
        "Cross-team communication hacks"
      ]
    }
  ];

  const featuredTips = [
    {
      title: "Increase productivity by 40% with this simple workflow",
      description: "Learn how top performers structure their daily tasks using our platform's hidden features.",
      readTime: "5 min read",
      savesTime: "2.5 hours/week",
      difficulty: "Beginner",
      popular: true
    },
    {
      title: "The automation trick that saves 10+ hours monthly",
      description: "One simple setup that eliminates repetitive tasks and lets you focus on what matters.",
      readTime: "3 min read",
      savesTime: "10+ hours/month",
      difficulty: "Intermediate",
      popular: false
    },
    {
      title: "Master real-time collaboration like a pro",
      description: "Team sync strategies that top agencies use to deliver projects 2x faster.",
      readTime: "7 min read",
      savesTime: "8 hours/week",
      difficulty: "Advanced",
      popular: true
    }
  ];

  const quickTips = [
    { tip: "Use ⌘ + K to quickly access any feature", emoji: "⌘K" },
    { tip: "Drag and drop files directly from your desktop", emoji: "📁" },
    { tip: "Right-click anywhere for context menu", emoji: "🖱️" },
    { tip: "Double click to edit any element inline", emoji: "✏️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-purple-500/10" />
        <div className="absolute top-0 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 backdrop-blur-sm">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-amber-300">Pro Insights</span>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent mb-6">
              Expert Tips & Tricks
            </h1>
            
            {/* Description */}
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Actionable insights to help you work smarter, not harder. 
              Discover hidden features and workflows that top performers use.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Search for tips..."
                  className="w-full px-5 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 text-white placeholder:text-slate-500 transition-all duration-300"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Quick Tips Carousel */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Quick Pro Tips
            </h2>
            <button className="text-sm text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTips.map((item, index) => (
              <div key={index} className="group p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{item.emoji}</div>
                  <p className="text-sm text-slate-300 group-hover:text-white transition-colors flex-1">
                    {item.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Tips */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-8">
            <Star className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Featured Tips</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTips.map((tip, index) => (
              <div key={index} className="group relative rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Popular Badge */}
                {tip.popular && (
                  <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
                    <span className="text-xs font-medium text-amber-300">🔥 Popular</span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {tip.title}
                  </h3>
                  <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{tip.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>Saves {tip.savesTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      {tip.difficulty}
                    </span>
                    <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                      Read tip <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Browse by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tipCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div key={idx} className="group rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="p-6">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} mb-4`}>
                      <Icon className={`w-6 h-6 ${category.iconColor}`} />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {category.title}
                    </h3>
                    
                    <ul className="space-y-3 mb-6">
                      {category.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="flex items-start gap-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                          <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-white transition-all duration-300 text-sm font-medium">
                      Explore {category.title}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent border border-white/10 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            Get weekly tips in your inbox
          </h3>
          <p className="text-slate-400 mb-6">
            Join 10,000+ professionals who level up their skills every Tuesday
          </p>
          <div className="flex max-w-md mx-auto gap-3">
            <input 
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 text-white placeholder:text-slate-500"
            />
            <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}