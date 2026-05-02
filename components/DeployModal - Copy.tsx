"use client";

import { useState } from "react";
import { 
  Rocket, Database, Cloud, Code, Server, 
  GitBranch, Globe, Zap, X, Check, Loader2,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, string>;
  projectName: string;
  onDeploy?: (options: DeployOptions) => void;
}

interface DeployOptions {
  platform: "vercel" | "netlify" | "cloudflare" | "aws";
  database: "postgresql" | "mongodb" | "supabase" | "firebase" | "none";
  envVars: Record<string, string>;
  region: string;
  buildCommand?: string;
  outputDir?: string;
  vercelToken?: string;
}

export function DeployModal({ isOpen, onClose, files, projectName, onDeploy }: DeployModalProps) {
  const [activeTab, setActiveTab] = useState<"platform" | "database" | "advanced">("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<DeployOptions["platform"]>("vercel");
  const [selectedDatabase, setSelectedDatabase] = useState<DeployOptions["database"]>("none");
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");
  const [region, setRegion] = useState("auto");
  const [isDeploying, setIsDeploying] = useState(false);
  const [showEnvInput, setShowEnvInput] = useState(false);
  const [vercelToken, setVercelToken] = useState("");
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const platforms = [
    { id: "vercel", name: "Vercel", icon: <Zap size={20} />, color: "from-black to-gray-800", bg: "bg-black/50" },
    { id: "netlify", name: "Netlify", icon: <Globe size={20} />, color: "from-teal-500 to-cyan-500", bg: "bg-teal-500/10" },
    { id: "cloudflare", name: "Cloudflare Pages", icon: <Cloud size={20} />, color: "from-orange-500 to-yellow-500", bg: "bg-orange-500/10" },
    { id: "aws", name: "AWS Amplify", icon: <Server size={20} />, color: "from-orange-600 to-orange-400", bg: "bg-orange-500/10" },
  ];

  const databases = [
    { id: "postgresql", name: "PostgreSQL", icon: <Database size={20} />, description: "Powerful relational database" },
    { id: "mongodb", name: "MongoDB", icon: <Database size={20} />, description: "NoSQL document database" },
    { id: "supabase", name: "Supabase", icon: <Database size={20} />, description: "Open source Firebase alternative" },
    { id: "firebase", name: "Firebase", icon: <Globe size={20} />, description: "Google's app development platform" },
    { id: "none", name: "No Database", icon: <X size={20} />, description: "Skip database setup" },
  ];

  const regions = [
    "auto", "us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-1", "ap-northeast-1"
  ];

  const addEnvVar = () => {
    if (newEnvKey && newEnvValue) {
      setEnvVars({ ...envVars, [newEnvKey]: newEnvValue });
      setNewEnvKey("");
      setNewEnvValue("");
      setShowEnvInput(false);
    }
  };

  const removeEnvVar = (key: string) => {
    const newVars = { ...envVars };
    delete newVars[key];
    setEnvVars(newVars);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentError(null);
    
    try {
      // Prepare files for deployment - ensure all content is string
      const deployFiles: Record<string, string> = {};
      for (const [path, content] of Object.entries(files)) {
        if (typeof content === 'string') {
          deployFiles[path] = content;
        } else if (typeof content === 'object') {
          deployFiles[path] = JSON.stringify(content);
        } else {
          deployFiles[path] = String(content);
        }
      }
      
      // Get the API URL from environment or use default
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      console.log("🚀 Deploying to Vercel...");
      console.log("📁 Files count:", Object.keys(deployFiles).length);
      console.log("📦 Project name:", projectName);
      
      // Call the backend deploy API
      const response = await fetch(`${API_URL}/api/deploy-vercel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: deployFiles,
          projectName: projectName,
          vercel_token: vercelToken,
          envVars: envVars,
        }),
      });
      
      // Check if response is OK before parsing JSON
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = `${errorMessage}: ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Close the deploy modal
        onClose();
        
        // Call onDeploy callback if provided
        if (onDeploy) {
          await onDeploy({
            platform: selectedPlatform,
            database: selectedDatabase,
            envVars: envVars,
            region: region,
            vercelToken: vercelToken,
          });
        }
        
        // Dispatch global event for the success modal
        const event = new CustomEvent("deployment-success", {
          detail: {
            deployment_url: result.deployment_url,
            deployment_id: result.deployment_id,
            project_name: result.project_name || projectName,
            images_uploaded: result.images_uploaded || 0,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(event);
        
        toast.success("Deployed successfully! Check the modal for your link.");
      } else {
        setDeploymentError(result.error || result.message || "Deployment failed");
        toast.error(result.error || "Deployment failed");
      }
    } catch (error) {
      console.error("Deployment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setDeploymentError(errorMessage);
      toast.error("Deployment failed: " + errorMessage);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25">
              <Rocket size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Deployment Center</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure and deploy your project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {deploymentError && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{deploymentError}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-5">
          {[
            { id: "platform", label: "Platform", icon: <Cloud size={14} /> },
            { id: "database", label: "Database", icon: <Database size={14} /> },
            { id: "advanced", label: "Advanced", icon: <Terminal size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium transition-all relative flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-purple-400 border-b-2 border-purple-500"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Platform Selection */}
          {activeTab === "platform" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">Choose where to deploy your application</p>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPlatform === platform.id
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                        : "border-white/10 hover:border-white/20 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${platform.color} bg-opacity-20`}>
                        {platform.icon}
                      </div>
                      <span className="font-semibold text-white">{platform.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">One-click deployment platform</p>
                  </button>
                ))}
              </div>
              
              {/* Vercel Token Input */}
              {selectedPlatform === "vercel" && (
                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Vercel API Token
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your Vercel API token"
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Get your token from{" "}
                    <a 
                      href="https://vercel.com/account/tokens" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      vercel.com/account/tokens
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Database Selection */}
          {activeTab === "database" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">Connect a database to your project</p>
              <div className="space-y-2">
                {databases.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => setSelectedDatabase(db.id as any)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      selectedDatabase === db.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedDatabase === db.id ? "bg-purple-500/20" : "bg-white/5"}`}>
                        {db.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{db.name}</div>
                        <div className="text-xs text-slate-500">{db.description}</div>
                      </div>
                    </div>
                    {selectedDatabase === db.id && <Check size={18} className="text-purple-500" />}
                  </button>
                ))}
              </div>
              
              {selectedDatabase !== "none" && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-400 mb-2">📦 Database will be provisioned automatically</p>
                  <p className="text-[11px] text-slate-400">Connection strings will be added to environment variables</p>
                </div>
              )}
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === "advanced" && (
            <div className="space-y-5">
              {/* Region Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Deployment Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {regions.map((r) => (
                    <option key={r} value={r} className="bg-slate-900">{r.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Environment Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">Environment Variables</label>
                  <button
                    onClick={() => setShowEnvInput(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    + Add Variable
                  </button>
                </div>
                
                {/* Existing env vars */}
                <div className="space-y-2 mb-3">
                  {Object.entries(envVars).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No environment variables configured</p>
                  ) : (
                    Object.entries(envVars).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                        <code className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded font-mono">{key}</code>
                        <span className="text-xs text-slate-400 flex-1">=</span>
                        <code className="text-xs text-slate-400 font-mono">••••••••</code>
                        <button
                          onClick={() => removeEnvVar(key)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <X size={12} className="text-red-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                {/* New env var input */}
                {showEnvInput && (
                  <div className="flex gap-2 items-center bg-white/5 rounded-lg p-2">
                    <Input
                      placeholder="KEY"
                      value={newEnvKey}
                      onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                      className="flex-1 h-8 text-xs font-mono bg-transparent border-white/10"
                    />
                    <span className="text-slate-500 text-xs">=</span>
                    <Input
                      placeholder="value"
                      value={newEnvValue}
                      onChange={(e) => setNewEnvValue(e.target.value)}
                      className="flex-1 h-8 text-xs bg-transparent border-white/10"
                    />
                    <button
                      onClick={addEnvVar}
                      className="p-1.5 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      <Check size={14} className="text-purple-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Ready to deploy {Object.keys(files).length} files</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || (selectedPlatform === "vercel" && !vercelToken)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}