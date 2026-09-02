// frontend/src/providers/AuthProvider.tsx
import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { AuthUser, RegisterData } from "../types/auth.types";
import { authApi } from "../services/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking auth...");
        const response = await authApi.me();
        console.log("📥 Auth response:", response);

        // 🔥 response.data — это сам пользователь
        if (response.success && response.data) {
          setUser(response.data);
          console.log("✅ User set:", response.data);
        } else {
          console.log("❌ No user");
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        setUser(response.data);
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return true;
      }
      setError(response.message || "Ошибка входа");
      return false;
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        setUser(response.data);
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return true;
      }
      setError(response.message || "Ошибка регистрации");
      return false;
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const updateProfile = async (data: Partial<RegisterData>): Promise<boolean> => {
    setError(null);
    try {
      const response = await authApi.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
      setError(response.message || "Ошибка обновления профиля");
      return false;
    } catch (err: any) {
      setError(err.message || "Ошибка обновления профиля");
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    setError(null);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      return true;
    } catch (err: any) {
      setError(err.message || "Ошибка смены пароля");
      return false;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isDeveloper =
    user?.role === "developer_admin" || user?.role === "developer_manager";
  const isAgent = user?.role === "agent";

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    isAuthenticated,
    isAdmin,
    isDeveloper,
    isAgent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};