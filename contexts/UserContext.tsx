"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  token: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    const storedToken = localStorage.getItem("eaglecode_token");
    const storedUser = localStorage.getItem("eaglecode_user");
    
    console.log("🔐 UserContext init - storedToken:", !!storedToken);
    console.log("🔐 UserContext init - storedUser:", !!storedUser);
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        console.log("✅ User restored from localStorage");
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: User, authToken: string) => {
    console.log("🔐 Login called with user:", userData.email);
    console.log("🔐 Token received:", !!authToken);
    
    // Save token to localStorage
    if (authToken) {
      localStorage.setItem("eaglecode_token", authToken);
      setToken(authToken);
    }
    
    // Save user data
    localStorage.setItem("eaglecode_user", JSON.stringify(userData));
    setUser(userData);
    
    console.log("✅ User logged in and stored");
  }, []);

  // ✅ UPDATED logout function - clears ALL project cache
  const logout = useCallback(() => {
    console.log("🔐 Logout called - clearing all cache...");
    
    // Clear user state
    setUser(null);
    setToken(null);
    
    // Clear auth items
    localStorage.removeItem("eaglecode_token");
    localStorage.removeItem("eaglecode_user");
    
    // ========== CLEAR PROJECT CACHE ==========
    localStorage.removeItem("projectsCache");
    localStorage.removeItem("projectToLoad");
    localStorage.removeItem("projectsNeedRefresh");
    localStorage.removeItem("user_plan");
    
    // Clear any other project-related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('project') || key.includes('cache') || key.includes('preview'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage completely
    sessionStorage.clear();
    
    // Clear IndexedDB (async - don't await)
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        indexedDB.databases().then(dbs => {
          dbs.forEach(db => {
            if (db.name && (db.name.includes('project') || db.name.includes('cache') || db.name.includes('eaglecode'))) {
              console.log(`🗑️ Deleting IndexedDB: ${db.name}`);
              indexedDB.deleteDatabase(db.name);
            }
          });
        }).catch(err => console.error("Failed to clear IndexedDB:", err));
      } catch (err) {
        console.error("IndexedDB not available:", err);
      }
    }
    
    // Clear service worker caches
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('project') || name.includes('cache') || name.includes('preview')) {
            console.log(`🗑️ Deleting cache: ${name}`);
            caches.delete(name);
          }
        });
      }).catch(err => console.error("Failed to clear caches:", err));
    }
    
    console.log("✅ All cache cleared, redirecting to home...");
    
    // Redirect to home page (not signin, since your button goes to "/")
    window.location.href = "/";
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, token }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}