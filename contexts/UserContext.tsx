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
  login: (userData: User, token: string) => void;  // ✅ Added token parameter
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

  // ✅ Fixed login function - now accepts token parameter
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

  const logout = useCallback(() => {
    console.log("🔐 Logout called");
    setUser(null);
    setToken(null);
    localStorage.removeItem("eaglecode_token");
    localStorage.removeItem("eaglecode_user");
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