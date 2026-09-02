// backend/src/middleware/auth.middleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest, AuthUser, JwtPayload } from "../types/auth.types";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

/**
 * Проверка авторизации через cookie или Bearer token
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Проверяем cookie
    let token = req.cookies?.token;

    // 2. Если нет в cookie, проверяем Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
      return;
    }

    // 3. Верифицируем токен
    const decoded = await authService.verifyToken(token);

    // 4. Получаем пользователя
    const user = await authService.getUserById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
      return;
    }

    // 5. Добавляем пользователя в req
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      company: user.company || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      position: user.position || undefined,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Неверный токен",
    });
  }
};

/**
 * Опциональная авторизация
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      next();
      return;
    }

    const decoded = await authService.verifyToken(token);
    const user = await authService.getUserById(decoded.id);

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        company: user.company || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phone: user.phone || undefined,
        position: user.position || undefined,
        isActive: user.isActive,
      };
    }

    next();
  } catch {
    next();
  }
};

/**
 * Только администратор
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
 * Только застройщик
 */
export const developerOnly = (
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

  const role = req.user.role;
  if (
    role !== "admin" &&
    role !== "developer_admin" &&
    role !== "developer_manager"
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
