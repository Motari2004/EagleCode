"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { autoscale } from "@codesandbox/sandpack-react";

interface PreviewProps {
  files: Record<string, string>;
}

export function ScorpioPreview({ files }: PreviewProps) {
  // If no files generated yet, show a placeholder
  if (Object.keys(files).length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
        <p className="text-muted-foreground">Waiting for Architect to generate code...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border shadow-2xl">
      <Sandpack
        template="nextjs"
        theme="dark"
        files={files}
        options={{
          showNavigator: true,
          showTabs: true,
          externalResources: ["https://cdn.tailwindcss.com"],
          editorHeight: 600,
        }}
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
            "clsx": "latest",
            "tailwind-merge": "latest",
            "class-variance-authority": "latest",
          },
        }}
      />
    </div>
  );
}