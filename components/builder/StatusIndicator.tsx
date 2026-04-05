"use client";

import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "idle" | "building" | "complete" | "error";
  progress?: number;
}

export function StatusIndicator({ status, progress }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "building":
        return {
          icon: Loader2,
          text: "Building...",
          className: "text-primary animate-spin"
        };
      case "complete":
        return {
          icon: CheckCircle,
          text: "Ready",
          className: "text-green-500"
        };
      case "error":
        return {
          icon: XCircle,
          text: "Error",
          className: "text-red-500"
        };
      default:
        return {
          icon: Clock,
          text: "Idle",
          className: "text-muted-foreground"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className={cn("w-4 h-4", config.className)} />}
      <span className="text-sm">{config.text}</span>
      {status === "building" && progress !== undefined && progress > 0 && (
        <span className="text-xs text-muted-foreground">{progress}%</span>
      )}
    </div>
  );
}