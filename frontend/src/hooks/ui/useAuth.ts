// frontend/src/hooks/useAuth.ts

import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { AuthContextType } from "../../types/auth.types";

/**
 * Основной хук для работы с авторизацией
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ============================================================
// 🔥 РАСШИРЕННЫЙ ХУК С ДОПОЛНИТЕЛЬНЫМИ МЕТОДАМИ
// ============================================================

/**
 * Расширенная версия useAuth с дополнительными методами
 */
export const useAuthExtended = () => {
  const auth = useAuth();

  // Проверка, является ли пользователь администратором компании
  const isDeveloperAdmin = auth.user?.role === "developer_admin";

  // Проверка, является ли пользователь менеджером компании
  const isDeveloperManager = auth.user?.role === "developer_manager";

  // Проверка, может ли пользователь управлять пользователями
  const canManageUsers =
    auth.user?.role === "admin" || auth.user?.role === "developer_admin";

  // Проверка, может ли пользователь управлять компанией
  const canManageCompany =
    auth.user?.role === "admin" || auth.user?.role === "developer_admin";

  // Проверка, может ли пользователь редактировать данные
  const canEdit =
    auth.user?.role === "admin" || auth.user?.role === "developer_admin";

  // Получение ID компании
  const getCompanyId = (): string | undefined => {
    return auth.user?.companyId;
  };

  // Получение названия компании
  const getCompanyName = (): string | undefined => {
    return auth.user?.companyName || auth.user?.company;
  };

  // Получение полной компании
  const getCompany = () => {
    return auth.getUserCompany();
  };

  // Получение метки роли
  const getRoleLabel = (role?: string): string => {
    const labels: Record<string, string> = {
      admin: "👑 Администратор проекта",
      developer_admin: "🏢 Администратор компании",
      developer_manager: "📋 Менеджер компании",
      agent: "🤝 Агент",
    };
    return role ? labels[role] || role : "👤 Пользователь";
  };

  // Получение цвета роли
  const getRoleColor = (role?: string): string => {
    const colors: Record<string, string> = {
      admin: "#4f46e5",
      developer_admin: "#f59e0b",
      developer_manager: "#10b981",
      agent: "#8b5cf6",
    };
    return role ? colors[role] || "#6b7280" : "#6b7280";
  };

  // Проверка доступа к сущности
  const hasAccessToEntity = (
    entityCompanyId: string | null | undefined,
  ): boolean => {
    if (!auth.user) return false;
    if (auth.user.role === "admin") return true;
    if (!entityCompanyId) return false;
    return auth.user.companyId === entityCompanyId;
  };

  return {
    ...auth,
    // Дополнительные проверки
    isDeveloperAdmin,
    isDeveloperManager,
    canManageUsers,
    canManageCompany,
    canEdit,
    // Компания
    getCompanyId,
    getCompanyName,
    getCompany,
    // Вспомогательные
    getRoleLabel,
    getRoleColor,
    hasAccessToEntity,
  };
};

export default useAuth;
