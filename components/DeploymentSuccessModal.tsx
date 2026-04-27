// components/DeploymentSuccessModal.jsx
"use client";

import { useState, useEffect } from "react";
import { 
  Globe, ExternalLink, Copy, CheckCircle, X, Rocket, 
  Sparkles, Share2, Clock 
} from "lucide-react";

interface DeploymentData {
  deployment_url: string;
  deployment_id: string;
  project_name: string;
  images_uploaded?: number;
  timestamp: string;
}

export function DeploymentSuccessModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deploymentData, setDeploymentData] = useState<DeploymentData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleDeploymentSuccess = (event: CustomEvent<DeploymentData>) => {
      console.log("🎉 Deployment success event received:", event.detail);
      setDeploymentData(event.detail);
      setIsOpen(true);
    };

    window.addEventListener("deployment-success", handleDeploymentSuccess as EventListener);
    
    return () => {
      window.removeEventListener("deployment-success", handleDeploymentSuccess as EventListener);
    };
  }, []);

  const handleCopyLink = async () => {
    if (deploymentData?.deployment_url) {
      await navigator.clipboard.writeText(deploymentData.deployment_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenWebsite = () => {
    if (deploymentData?.deployment_url) {
      window.open(deploymentData.deployment_url, "_blank");
    }
  };

  const handleShare = async () => {
    if (deploymentData?.deployment_url && navigator.share) {
      try {
        await navigator.share({
          title: `${deploymentData.project_name} - Deployed with EagleCode`,
          text: `Check out my newly deployed website: ${deploymentData.project_name}`,
          url: deploymentData.deployment_url,
        });
      } catch (err) {
        console.log("Share cancelled or failed");
      }
    } else {
      handleCopyLink();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setDeploymentData(null);
    setCopied(false);
  };

  // Calculate time since deployment
  const getTimeElapsed = () => {
    if (!deploymentData?.timestamp) return null;
    const deployedAt = new Date(deploymentData.timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - deployedAt.getTime()) / 1000);
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    return `${Math.floor(diffSeconds / 3600)} hours ago`;
  };

  if (!isOpen || !deploymentData) return null;

  const timeElapsed = getTimeElapsed();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md">
        {/* Modal Content - No scrollbar, exactly fitted to content */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl">
          {/* Success Animation Header */}
          <div className="text-center pt-6 px-6">
            {/* Success Icon */}
            <div className="relative inline-flex mb-3">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 animate-ping" />
              </div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25 animate-bounce">
                <CheckCircle size={32} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">Deployment Successful! 🎉</h2>
            <p className="text-xs text-slate-400">
              Your project is now live on Vercel
            </p>
          </div>

          {/* Deployment Info */}
          <div className="p-5 space-y-3">
            {/* Project Name */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Rocket size={12} />
                <span>Project Name</span>
              </div>
              <p className="text-white font-medium text-sm break-all">
                {deploymentData.project_name || "Web Project"}
              </p>
            </div>

            {/* Live URL */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Globe size={12} />
                <span>Live URL</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-purple-400 text-xs font-mono break-all flex-1">
                  {deploymentData.deployment_url}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  title="Copy link"
                >
                  {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3">
              {deploymentData.images_uploaded !== undefined && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Sparkles size={12} />
                    <span>Images</span>
                  </div>
                  <p className="text-white font-medium text-sm">
                    {deploymentData.images_uploaded} uploaded
                  </p>
                </div>
              )}
              
              {timeElapsed && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock size={12} />
                    <span>Deployed</span>
                  </div>
                  <p className="text-white font-medium text-xs">
                    {timeElapsed}
                  </p>
                </div>
              )}
            </div>

            {/* Success Message */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2.5">
              <p className="text-green-400 text-xs text-center">
                🚀 Your website is live on Vercel's global edge network!
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={handleOpenWebsite}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink size={14} />
              Open Website
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>

          {/* Close button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleClose}
              className="w-full px-3 py-2 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-all duration-200"
            >
              Close
            </button>
          </div>

          {/* Close button (X) */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}