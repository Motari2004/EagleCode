"use client";

import { useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  initialPrompt?: string;
}

const examplePrompts = [
  "Create a modern SaaS landing page with pricing plans, testimonials, and a dark mode toggle",
  "Build a personal portfolio with projects, about section, and contact form",
  "Make an e-commerce product page with image gallery, reviews, and add to cart",
  "Create a blog homepage with featured posts, categories, and search",
];

export function PromptInput({ onGenerate, isLoading, initialPrompt = "" }: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Describe the website you want to build..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="w-full mt-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          disabled={!prompt.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Building...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Website
            </>
          )}
        </Button>
      </form>
      
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Try these examples:</p>
        <div className="space-y-1">
          {examplePrompts.map((example, i) => (
            <button
              key={i}
              onClick={() => setPrompt(example)}
              className="text-xs text-left text-muted-foreground hover:text-primary block w-full p-1.5 rounded hover:bg-muted/50 transition-colors"
              disabled={isLoading}
              type="button"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}