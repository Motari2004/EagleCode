"use client";

import Link from "next/link";
import { Sparkles, Download, Share2, Home, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onDownload?: () => void;
  isBuilding?: boolean;
}

export function Header({ onDownload, isBuilding }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                  <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1" />
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                <span className="font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Nova AI
                </span>
              </div>
              <nav className="space-y-2">
                <Link href="/" className="block py-2 hover:text-primary transition">
                  Home
                </Link>
                <Link href="/builder" className="block py-2 hover:text-primary transition">
                  Builder
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Nova AI Builder
            </span>
            <span className="font-bold sm:hidden bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Nova
            </span>
          </Link>
          
          {isBuilding && (
            <Badge variant="secondary" className="ml-2 animate-pulse bg-primary/10 text-primary">
              Building...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {onDownload && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownload}
              className="border-primary/20 hover:border-primary hover:bg-primary/5"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Share2 className="h-4 w-4" />
          </Button>
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}