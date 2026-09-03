// frontend/src/providers/AuthProvider.tsx

import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  AuthUser,
  RegisterData,
  Company,
  UserRole,
  AuthContextType,
} from "../types/auth.types";
import { authApi } from "../services/auth";
import { adminApi } from "../services/adminApi";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCompany, setUserCompany] = useState<Company | null>(null);

  // ============================================================
  // ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ
  // ============================================================

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking auth...");
        const response = await authApi.me();
        console.log("📥 Auth response:", response);

        if (response.success && response.data) {
          setUser(response.data);
          console.log("✅ User set:", response.data);

          // 🔥 Если у пользователя есть компания, загружаем её данные
          if (response.data.companyId) {
            try {
              const company = await adminApi.getCompany(
                response.data.companyId,
              );
              setUserCompany(company);
              console.log("🏢 Company loaded:", company);
            } catch (companyError) {
              console.warn("⚠️ Could not load company:", companyError);
            }
          }
        } else {
          console.log("❌ No user");
          setUser(null);
          setUserCompany(null);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        setUser(null);
        setUserCompany(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ============================================================
  // ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await authApi.me();
      if (response.success && response.data) {
        setUser(response.data);
        console.log("🔄 User refreshed:", response.data);

        // Обновляем компанию
        if (response.data.companyId) {
          try {
            const company = await adminApi.getCompany(response.data.companyId);
            setUserCompany(company);
          } catch (companyError) {
            console.warn("⚠️ Could not load company:", companyError);
          }
        } else {
          setUserCompany(null);
        }
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
    }
  }, []);

  // ============================================================
  // ВХОД
  // ============================================================

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        setUser(response.data);
        if (response.token) {
          localStorage.setItem("token", response.token);
        }

        // Загружаем компанию
        if (response.data.companyId) {
          try {
            const company = await adminApi.getCompany(response.data.companyId);
            setUserCompany(company);
          } catch (companyError) {
            console.warn("⚠️ Could not load company:", companyError);
          }
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

  // ============================================================
  // РЕГИСТРАЦИЯ (ТОЛЬКО ДЛЯ АГЕНТОВ)
  // ============================================================

  const register = async (data: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        setUser(response.data);
        if (response.token) {
          localStorage.setItem("token", response.token);
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

  // ============================================================
  // ВЫХОД
  // ============================================================

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setUserCompany(null);
      localStorage.removeItem("token");
    }
  };

  // ============================================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ============================================================

  const updateProfile = async (
    data: Partial<RegisterData>,
  ): Promise<boolean> => {
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

  // ============================================================
  // СМЕНА ПАРОЛЯ
  // ============================================================

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    setError(null);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      return true;
    } catch (err: any) {
      setError(err.message || "Ошибка смены пароля");
      return false;
    }
  };

  // ============================================================
  // 🔥 ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
  // ============================================================

  /**
   * Получить компанию пользователя
   */
  const getUserCompany = useCallback((): Company | null => {
    return userCompany;
  }, [userCompany]);

  /**
   * Проверка наличия роли
   */
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    [user],
  );

  /**
   * Проверка доступа к сущности по companyId
   */
  const hasAccessToEntity = useCallback(
    (entityCompanyId: string | null | undefined): boolean => {
      if (!user) return false;
      // Admin имеет доступ ко всему
      if (user.role === "admin") return true;
      // Если у сущности нет компании, доступ запрещен для не-админов
      if (!entityCompanyId) return false;
      // Проверяем, что компания пользователя совпадает с компанией сущности
      return user.companyId === entityCompanyId;
    },
    [user],
  );

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ ПРОВЕРКИ
  // ============================================================

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isDeveloper =
    user?.role === "developer_admin" || user?.role === "developer_manager";
  const isAgent = user?.role === "agent";

  // ============================================================
  // ЗНАЧЕНИЕ КОНТЕКСТА
  // ============================================================

  const value: AuthContextType = {
    // Основные данные
    user,
    loading,
    error,

    // Основные методы
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    refreshUser,

    // Проверки
    isAuthenticated,
    isAdmin,
    isDeveloper,
    isAgent,

    // Вспомогательные методы
    getUserCompany,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
