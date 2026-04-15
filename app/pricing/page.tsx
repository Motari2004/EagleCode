"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { CheckCircle2, Zap, Rocket, Users, ArrowRight, Crown, Star, Coffee, Sparkles, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [




    {
  id: "free",
  name: "Free",
  price: 0,
  yearlyPrice: 0,
  description: "Perfect for trying out EagleCode",
  icon: <Star className="w-6 h-6" />,
color: "from-emerald-500 to-emerald-600",
textColor: "text-emerald-400",
  buttonColor: "bg-white/10 hover:bg-white/20",
  features: [
    "5 credits per day",
    "30 credits per month",
    "Basic AI editing",
    "Community support",
    "Export to ZIP"
  ]
},






    {
      id: "pro",
      name: "Pro",
      price: 19,
      yearlyPrice: 190,
      description: "For professional developers",
      icon: <Zap className="w-6 h-6" />,
      color: "from-cyan-500 to-purple-500",
      textColor: "text-cyan-400",
      buttonColor: "bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90",
      popular: true,
      features: [
        "15 credits per day",
        "120 credits per month",
        "Unlimited projects",
        "Advanced AI editing",
        "Email support (24h)",
        "Credits rollover (up to 240)",
        "One-click deployment",
        "Custom domains (3)",
        "Export to ZIP"
      ]
    },
    {
      id: "business",
      name: "Business",
      price: 49,
      yearlyPrice: 490,
      description: "For teams and agencies",
      icon: <Rocket className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-400",
      buttonColor: "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90",
      features: [
        "40 credits per day",
        "350 credits per month",
        "Unlimited projects",
        "Everything in Pro",
        "Priority support (4h)",
        "Analytics dashboard",
        "API access",
        "Credits rollover (up to 700)",
        "Team collaboration"
      ]
    },
    {
      id: "custom",
      name: "Custom",
      price: null,
      yearlyPrice: null,
      description: "For large organizations",
      icon: <Building2 className="w-6 h-6" />,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400",
      buttonColor: "bg-white/10 hover:bg-white/20",
      features: [
        "Custom credits",
        "Unlimited everything",
        "Dedicated support",
        "SSO/SAML",
        "On-premise option",
        "SLA guarantee",
        "Phone support",
        "Custom integrations",
        "Training sessions"
      ]
    }
  ];

  const handleUpgrade = (planId: string) => {
    if (!user) {
      router.push("/signup");
      return;
    }
    
    if (planId === "free") {
      router.push("/builder");
      return;
    }
    
    if (planId === "custom") {
      window.location.href = "mailto:sales@eaglecode.com?subject=Enterprise%20Plan%20Inquiry";
      return;
    }
    
    // Here you would integrate Stripe checkout
    console.log(`Upgrading to ${planId} plan`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              🦅
            </div>
            <span className="font-bold text-sm tracking-tight">Eagle<span className="text-amber-500">Code</span></span>
          </button>
          
          {user ? (
            <Button
              onClick={() => router.push("/builder")}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
            >
              Go to Builder
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/signin")}
                variant="outline"
                size="sm"
                className="border-white/20 text-slate-300 hover:text-white"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/signup")}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 mb-4">
  <span className="text-xs bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold">
    Start free, scale up
  </span>
</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose the <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Perfect Plan</span> for You
          </h1>
          <p className="text-slate-400 text-lg">
            Start free and upgrade when you need more. All plans include core features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Yearly <span className="text-xs text-green-400 ml-1">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - Grid with 4 columns on large screens */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/10 scale-105 md:scale-105"
                  : "bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
  {plan.icon}
</div>
                
                {/* Name */}
                <h3 className={`text-xl font-bold ${plan.textColor} mb-1`}>{plan.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-4">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl font-bold text-white">
                        ${billingCycle === "monthly" ? plan.price : plan.yearlyPrice}
                      </span>
                      <span className="text-slate-400 ml-1">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                      {billingCycle === "yearly" && plan.price > 0 && (
                        <p className="text-xs text-green-400 mt-1">
                          Save ${plan.price * 12 - plan.yearlyPrice}/year
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-white">Custom</span>
                      <span className="text-slate-400 ml-1">pricing</span>
                    </>
                  )}
                </div>
                
                {/* Features */}
                <div className="space-y-2 mb-6">
                  {plan.features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 6 && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>+{plan.features.length - 6} more features</span>
                    </div>
                  )}
                </div>
                
                {/* Button */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                    plan.id === "free"
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : plan.id === "custom"
                      ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      : plan.buttonColor + " text-white shadow-lg"
                  }`}
                >
                  {plan.id === "free" 
                    ? "Current Plan" 
                    : plan.id === "custom" 
                    ? "Contact Sales →" 
                    : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Plan Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            Custom plans include dedicated support, SLAs, and custom integrations.{" "}
            <button
              onClick={() => window.location.href = "mailto:sales@eaglecode.com"}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Contact our sales team →
            </button>
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-semibold text-white mb-1">What happens when I run out of credits?</h4>
              <p className="text-sm text-slate-400">You'll receive a notification and can either wait for your daily reset or upgrade to a paid plan for more credits.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-semibold text-white mb-1">Can I cancel my subscription anytime?</h4>
              <p className="text-sm text-slate-400">Yes, you can cancel anytime. Your Pro features will remain active until the end of your billing period.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-semibold text-white mb-1">Do unused credits roll over?</h4>
              <p className="text-sm text-slate-400">Pro and Business plans include rollover up to the plan limit. Free plan credits do not roll over.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-semibold text-white mb-1">Need a custom plan for your organization?</h4>
              <p className="text-sm text-slate-400">Contact our sales team for custom pricing, SSO, on-premise deployment, and dedicated support.</p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center">
          <Button
            onClick={() => router.push("/builder")}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 text-base"
          >
            Start Building for Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-slate-500 mt-4">No credit card required. Free plan included.</p>
        </div>
      </main>
    </div>
  );
}