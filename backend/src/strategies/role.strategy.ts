// backend/src/strategies/role.strategy.ts
import { Request, Response, NextFunction } from "express";
import { AuthUser, AuthRequest } from "../types/auth.types";

// ============================================================
// MIDDLEWARE ДЛЯ ПРОВЕРКИ РОЛЕЙ
// ============================================================

/**
 * Проверка, что пользователь авторизован
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Не авторизован",
    });
    return;
  }
  next();
};

/**
 * Только администратор проекта
 */
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Не авторизован",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Доступ запрещен. Требуются права администратора",
    });
    return;
  }
  next();
};

/**
 * Только администратор застройщика
 */
export const developerAdminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Не авторизован",
    });
    return;
  }

  if (req.user.role !== "developer_admin" && req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Доступ запрещен. Требуются права администратора застройщика",
    });
    return;
  }
  next();
};

/**
 * Только застройщик (admin, developer_admin или developer_manager)
 */
export const developerOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Не авторизован",
    });
    return;
  }

  if (
    req.user.role !== "admin" &&
    req.user.role !== "developer_admin" &&
    req.user.role !== "developer_manager"
  ) {
    res.status(403).json({
      success: false,
      error: "Доступ запрещен. Требуются права застройщика",
    });
    return;
  }
  next();
};

/**
 * Только агент
 */
export const agentOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Не авторизован",
    });
    return;
  }

  if (req.user.role !== "agent") {
    res.status(403).json({
      success: false,
      error: "Доступ запрещен. Требуются права агента",
    });
    return;
  }
  next();
};

/**
 * Проверка доступа к компании
 */
export const companyAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Не авторизован",
    });
    return;
  }

  if (req.user.role === "admin") {
    next();
    return;
  }

  const companyId =
    req.params.companyId || req.body.companyId || req.query.companyId;
  if (companyId && req.user.company && companyId !== req.user.company) {
    res.status(403).json({
      success: false,
      error: "Доступ запрещен. Вы можете управлять только своей компанией",
    });
    return;
  }

  next();
};

/**
 * Проверка доступа к просмотру
 */
export const canView = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Не авторизован",
    });
    return;
  }
  next();
};

/**
 * Проверка доступа к редактированию
 */
export const canEdit = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Не авторизован",
    });
    return;
  }

  if (req.user.role === "admin") {
    next();
    return;
  }

  if (req.user.role === "agent") {
    res.status(403).json({
      success: false,
      error: "Доступ запрещен. Агент не может редактировать данные",
    });
    return;
  }

  if (
    req.user.role === "developer_admin" ||
    req.user.role === "developer_manager"
  ) {
    const resourceCompany =
      req.params.companyId || req.body.companyId || req.query.companyId;
    if (resourceCompany && resourceCompany !== req.user.company) {
      res.status(403).json({
        success: false,
        error: "Доступ запрещен. Вы можете редактировать только свои ресурсы",
      });
      return;
    }
    next();
    return;
  }

  res.status(403).json({
    success: false,
    error: "Доступ запрещен",
  });
};

/**
 * Получить права пользователя
 */
export const getUserPermissions = (user?: AuthUser) => {
  if (!user) {
    return {
      canViewAll: false,
      canEditAll: false,
      canManageUsers: false,
      allowedCompanies: [],
    };
  }

  switch (user.role) {
    case "admin":
      return {
        canViewAll: true,
        canEditAll: true,
        canManageUsers: true,
        allowedCompanies: [],
      };

    case "developer_admin":
      return {
        canViewAll: false,
        canEditAll: false,
        canManageUsers: false,
        allowedCompanies: [user.company || ""],
      };

    case "developer_manager":
      return {
        canViewAll: false,
        canEditAll: false,
        canManageUsers: false,
        allowedCompanies: [user.company || ""],
      };

    case "agent":
      return {
        canViewAll: true,
        canEditAll: false,
        canManageUsers: false,
        allowedCompanies: [],
      };

    default:
      return {
        canViewAll: false,
        canEditAll: false,
        canManageUsers: false,
        allowedCompanies: [],
      };
  }
};
