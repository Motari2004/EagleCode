"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2, CheckCircle, XCircle } from "lucide-react";

interface DeployButtonProps {
  files: Record<string, string>;
  projectName?: string;
  onDeployStart?: () => void;
  onDeployComplete?: (url: string) => void;
}

export function DeployButton({ 
  files, 
  projectName = "my-app",
  onDeployStart,
  onDeployComplete 
}: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeploy = async () => {
    if (Object.keys(files).length === 0) {
      setErrorMessage("No files to deploy. Generate a project first.");
      return;
    }

    setIsDeploying(true);
    setDeployStatus("idle");
    setErrorMessage(null);
    onDeployStart?.();

    try {
      const response = await fetch("http://localhost:8000/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files,
          project_name: projectName.replace(/\s+/g, "-").toLowerCase(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDeployStatus("success");
        setDeployUrl(`https://${result.project_name}.vercel.app`);
        onDeployComplete?.(`https://${result.project_name}.vercel.app`);
        
        // Download the zip file
        const zipData = result.zip_data;
        const binaryData = atob(zipData);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.project_name}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setDeployStatus("error");
        setErrorMessage(result.message || "Deployment failed");
      }
    } catch (error) {
      console.error("Deploy error:", error);
      setDeployStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleVercelDeploy = async () => {
    // This would require a Vercel token
    const token = prompt("Enter your Vercel API token (from vercel.com/account/tokens):");
    if (!token) return;

    setIsDeploying(true);
    try {
      const response = await fetch("http://localhost:8000/api/deploy-vercel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files,
          project_name: projectName.replace(/\s+/g, "-").toLowerCase(),
          vercel_token: token,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setDeployStatus("success");
        setDeployUrl(result.deploy_url);
        onDeployComplete?.(result.deploy_url);
      } else {
        setDeployStatus("error");
        setErrorMessage(result.message || "Deployment failed");
      }
    } catch (error) {
      setDeployStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={handleDeploy}
          disabled={isDeploying || Object.keys(files).length === 0}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Packaging...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Download Project (ZIP)
            </>
          )}
        </Button>
        
        <Button
          onClick={handleVercelDeploy}
          disabled={isDeploying || Object.keys(files).length === 0}
          variant="outline"
          className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
        >
          <Rocket className="mr-2 h-4 w-4" />
          Deploy to Vercel
        </Button>
      </div>
      
      {deployStatus === "success" && deployUrl && (
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle className="h-4 w-4" />
          <span>
            Project ready!{" "}
            <a 
              href={deployUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-green-400"
            >
              View deployment
            </a>
          </span>
        </div>
      )}
      
      {deployStatus === "error" && errorMessage && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <XCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {Object.keys(files).length === 0 && (
        <p className="text-xs text-yellow-500">
          Generate a project first to enable deployment
        </p>
      )}
    </div>
  );
}