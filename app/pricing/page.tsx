"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { CheckCircle2, Zap, Rocket, Users, ArrowRight, Crown, Star, Coffee, Sparkles, Building2, Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPlan, setRequestPlan] = useState<string>("");
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      yearlyPrice: 0,
      description: "Perfect for trying out EagleCode",
      icon: <Star className="w-5 h-5" />,
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-400",
      buttonColor: "bg-white/10 hover:bg-white/20",
      features: [
        "5 credits/day",
        "30 credits/month",
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
      icon: <Zap className="w-5 h-5" />,
      color: "from-cyan-500 to-purple-500",
      textColor: "text-cyan-400",
      buttonColor: "bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90",
      popular: true,
      features: [
        "15 credits/day",
        "120 credits/month",
        "Unlimited projects",
        "Advanced AI editing",
        "Email support (24h)",
        "Credits rollover",
        "One-click deployment"
      ]
    },
    {
      id: "business",
      name: "Business",
      price: 49,
      yearlyPrice: 490,
      description: "For teams and agencies",
      icon: <Rocket className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-400",
      buttonColor: "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90",
      features: [
        "40 credits/day",
        "350 credits/month",
        "Unlimited projects",
        "Everything in Pro",
        "Priority support (4h)",
        "Analytics dashboard",
        "API access"
      ]
    },
    {
      id: "custom",
      name: "Custom",
      price: null,
      yearlyPrice: null,
      description: "For large organizations",
      icon: <Building2 className="w-5 h-5" />,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400",
      buttonColor: "bg-white/10 hover:bg-white/20",
      features: [
        "Custom credits",
        "Unlimited everything",
        "Dedicated support",
        "SSO/SAML",
        "On-premise option",
        "SLA guarantee"
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
    
    setRequestPlan(planId);
    setShowRequestModal(true);
  };

  const submitUpgradeRequest = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("eaglecode_token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/request-upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          plan: requestPlan,
          message: requestMessage || `User wants to upgrade to ${requestPlan.toUpperCase()} plan.`
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowRequestModal(false);
          setShowSuccess(false);
          setRequestMessage("");
        }, 3000);
      } else {
        alert("Failed to send request. Please try again.");
      }
    } catch (error) {
      console.error("Error sending upgrade request:", error);
      alert("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(0%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              🦅
            </div>
            <span className="font-bold text-sm tracking-tight">
              <span className="text-white">Eagle</span>
              <span className="text-amber-500">Code</span>
            </span>
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
            <div className="flex items-center gap-2">
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
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        
        {/* Hero Section - Compact */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
            <span className="text-[10px] sm:text-xs bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              Start free, scale up
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            Choose the <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Perfect Plan</span>
          </h1>
          <p className="text-xs sm:text-base text-slate-400">
            Start free and upgrade when you need more.
          </p>
        </div>

        {/* Billing Toggle - Compact */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-white/5 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Yearly <span className="text-[9px] sm:text-xs text-green-400 ml-0.5 sm:ml-1">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - More Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                  : "bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-[8px] sm:text-xs font-semibold shadow-lg whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-3 sm:p-5">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
                  {plan.icon}
                </div>
                
                <h3 className={`text-base sm:text-xl font-bold ${plan.textColor} mb-0.5`}>{plan.name}</h3>
                <p className="text-[10px] sm:text-sm text-slate-400 mb-2 sm:mb-3">{plan.description}</p>
                
                <div className="mb-2 sm:mb-3">
                  {plan.price !== null ? (
                    <>
                      <span className="text-xl sm:text-3xl font-bold text-white">
                        ${billingCycle === "monthly" ? plan.price : plan.yearlyPrice}
                      </span>
                      <span className="text-[10px] sm:text-sm text-slate-400 ml-0.5">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                      {billingCycle === "yearly" && plan.price > 0 && (
                        <p className="text-[8px] sm:text-xs text-green-400 mt-0.5">
                          Save ${plan.price * 12 - plan.yearlyPrice}/yr
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-lg sm:text-2xl font-bold text-white">Custom</span>
                      <span className="text-[10px] sm:text-sm text-slate-400 ml-0.5">pricing</span>
                    </>
                  )}
                </div>
                
                <div className="space-y-1 mb-2 sm:mb-3">
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm">
                      <CheckCircle2 size={10} className="sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 5 && (
                    <div className="flex items-center gap-1 text-[9px] sm:text-xs text-slate-400">
                      <span>+{plan.features.length - 4} more</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${
                    plan.id === "free"
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : plan.id === "custom"
                      ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      : plan.buttonColor + " text-white shadow-md"
                  }`}
                >
                  {plan.id === "free" 
                    ? "Current" 
                    : plan.id === "custom" 
                    ? "Contact →" 
                    : `Request ${plan.name === "Pro" ? "Pro" : plan.name === "Business" ? "Biz" : plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Plan Note */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-[10px] sm:text-xs text-slate-500">
            Custom plans include dedicated support, SLAs, and custom integrations.{" "}
            <button
              onClick={() => handleUpgrade("custom")}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Request →
            </button>
          </p>
        </div>
      </main>

      {/* Upgrade Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRequestModal(false)} />
          
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            {showSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
                <p className="text-slate-400">
                  Your upgrade request has been sent to our team. We'll contact you within 24 hours with payment details.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Request Upgrade</h3>
                </div>
                
                <p className="text-slate-400 text-sm mb-4">
                  Requesting <span className="text-cyan-400 font-semibold">{requestPlan.toUpperCase()}</span> plan.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Tell us about your needs..."
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="bg-cyan-500/10 rounded-lg p-3 mb-4 border border-cyan-500/20">
                  <p className="text-xs text-cyan-400">
                    📧 Payment instructions to: <strong>{user?.email}</strong>
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitUpgradeRequest}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}