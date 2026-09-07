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

import { adminApi } from "../services/adminApi";
import { authApi } from "../services/auth";

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

      // 🔥 ОБРАБОТКА ОШИБКИ "Email не подтвержден"
      if (
        response.message &&
        response.message.includes("Email не подтвержден")
      ) {
        setError(
          "Email не подтвержден. Проверьте вашу почту или запросите повторную отправку.",
        );
        return false;
      }

      setError(response.message || "Ошибка входа");
      return false;
    } catch (err: any) {
      // 🔥 ОБРАБОТКА ОШИБКИ "Email не подтвержден" из catch
      if (err.message && err.message.includes("Email не подтвержден")) {
        setError(
          "Email не подтвержден. Проверьте вашу почту или запросите повторную отправку.",
        );
        return false;
      }
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
  // 🔥 НОВЫЕ МЕТОДЫ ДЛЯ EMAIL
  // ============================================================

  /**
   * Подтверждение email
   */
  const verifyEmail = async (
    token: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await authApi.verifyEmail(token);
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Ошибка подтверждения email",
      };
    }
  };

  /**
   * Повторная отправка письма подтверждения
   */
  const resendVerification = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const result = await authApi.resendVerification();
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Ошибка отправки письма",
      };
    }
  };

  /**
   * Запрос на сброс пароля
   */
  const forgotPassword = async (
    email: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await authApi.forgotPassword(email);
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Ошибка отправки письма",
      };
    }
  };

  /**
   * Сброс пароля
   */
  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await authApi.resetPassword(token, newPassword);
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Ошибка сброса пароля",
      };
    }
  };

  // ============================================================
  // 🔥 ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
  // ============================================================

  const getUserCompany = useCallback((): Company | null => {
    return userCompany;
  }, [userCompany]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    [user],
  );

  const hasAccessToEntity = useCallback(
    (entityCompanyId: string | null | undefined): boolean => {
      if (!user) return false;
      if (user.role === "admin") return true;
      if (!entityCompanyId) return false;
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

    // 🔥 НОВЫЕ МЕТОДЫ
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,

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
