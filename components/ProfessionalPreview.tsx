"use client"; // Critical for Next.js 16+

import { Sandpack } from "@codesandbox/sandpack-react";

interface PreviewProps {
  files: Record<string, string>;
}

export function ProfessionalPreview({ files }: { files: Record<string, string> }) {
  // Ensure we have at least a basic app structure if files is empty
  const safeFiles = Object.keys(files).length > 0 ? files : {
    "/app/page.tsx": "export default function Home() { return <div>Initializing project...</div> }"
  };

  return (
    <div className="h-full w-full border rounded-xl overflow-hidden shadow-2xl bg-[#1e1e1e]">
      <Sandpack
        template="nextjs"
        theme="dark"
        files={safeFiles}
        options={{
          showNavigator: true,
          showTabs: true,
          editorHeight: "calc(100vh - 150px)", // Dynamic height
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
            "framer-motion": "latest",
            "clsx": "latest",
            "tailwind-merge": "latest",
            "lucide-static": "latest"
          }
        }}
      />
    </div>
  );
}