"use client";

import { useEffect, useState, useRef } from "react";
import { Monitor, Smartphone, RotateCw, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PreviewProps {
  code: string;
  isBuilding: boolean;
}

export function PreviewPanel({ code, isBuilding }: PreviewProps) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [renderedCode, setRenderedCode] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Debounce the code update so the iframe doesn't "flash" white too often
  useEffect(() => {
    const handler = setTimeout(() => {
      setRenderedCode(code);
    }, 200);
    return () => clearTimeout(handler);
  }, [code]);

  const fullHtml = `
    <!DOCTYPE html>
    <html class="scroll-smooth">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; transition: all 0.3s ease; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        </style>
      </head>
      <body>
        ${renderedCode || '<div class="h-screen flex items-center justify-center text-slate-400 font-mono">Ready for input...</div>'}
        <script>
          // Ensure icons are replaced whenever content changes
          function initIcons() {
            if (window.lucide) {
              lucide.createIcons();
            }
          }
          initIcons();
          // Watch for late-arriving elements
          const observer = new MutationObserver(initIcons);
          observer.observe(document.body, { childList: true, subtree: true });
        </script>
      </body>
    </html>
  `;

  return (
    <div className="h-full flex flex-col bg-slate-100/50 p-4 gap-4">
      {/* Tool Bar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl border shadow-sm px-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isBuilding ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">
            {isBuilding ? "Live Generating" : "Stable Preview"}
          </span>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList className="h-8 bg-slate-100">
            <TabsTrigger value="desktop" className="px-3"><Monitor size={14} /></TabsTrigger>
            <TabsTrigger value="mobile" className="px-3"><Smartphone size={14} /></TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
             <RotateCw size={14} />
           </Button>
           <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-semibold">
             <ExternalLink size={12} /> Deploy
           </Button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex justify-center items-start overflow-hidden pt-2">
        <div 
          className={`bg-white shadow-2xl transition-all duration-500 border rounded-t-2xl overflow-hidden ${
            view === "desktop" ? "w-full h-full" : "w-[375px] h-[90%] border-[8px] border-slate-900 rounded-[3rem]"
          }`}
        >
          <iframe
            ref={iframeRef}
            srcDoc={fullHtml}
            className="w-full h-full border-0"
            title="Professional Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}