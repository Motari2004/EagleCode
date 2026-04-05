"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("user_info");

      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_info");
          }
        } catch (error) {
          console.error("Auth verification failed:", error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_info", JSON.stringify(data.user));
        setUser(data.user);
        
        // Redirect to dashboard or return to previous page
        const returnUrl = sessionStorage.getItem("returnUrl") || "/dashboard";
        sessionStorage.removeItem("returnUrl");
        router.push(returnUrl);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_info", JSON.stringify(data.user));
        setUser(data.user);
        router.push("/dashboard");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    setUser(null);
    router.push("/login");
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("user_info", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}