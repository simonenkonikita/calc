// backend/src/middleware/auth.middleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest, AuthUser, JwtPayload } from "../types/auth.types";
import { AuthService } from "../services/AuthService";
import { AppDataSource } from "../data-source";
import { Company } from "../entities/Company";

const authService = new AuthService();

// ============================================================
// ОСНОВНЫЕ МИДЛВАРЫ
// ============================================================

/**
 * Проверка авторизации через cookie или Bearer token
 */
export const authMiddleware = async (
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
      res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
      return;
    }

    const decoded = await authService.verifyToken(token);
    const user = await authService.getUserById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
      companyName: user.company?.name || undefined,
      company: user.company?.name || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      position: user.position || undefined,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified, // 🔥 ДОБАВЛЯЕМ
      emailVerifiedAt: user.emailVerifiedAt || undefined, // 🔥 ДОБАВЛЯЕМ
      lastLoginAt: user.lastLoginAt || undefined, // 🔥 ДОБАВЛЯЕМ
      createdAt: user.createdAt, // 🔥 ДОБАВЛЯЕМ
      updatedAt: user.updatedAt, // 🔥 ДОБАВЛЯЕМ
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
        companyId: user.companyId || undefined,
        companyName: user.company?.name || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phone: user.phone || undefined,
        position: user.position || undefined,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified, // 🔥 ДОБАВЛЯЕМ
        emailVerifiedAt: user.emailVerifiedAt || undefined, // 🔥 ДОБАВЛЯЕМ
        lastLoginAt: user.lastLoginAt || undefined, // 🔥 ДОБАВЛЯЕМ
        createdAt: user.createdAt, // 🔥 ДОБАВЛЯЕМ
        updatedAt: user.updatedAt, // 🔥 ДОБАВЛЯЕМ
      };
    }

    next();
  } catch {
    next();
  }
};

// ============================================================
// ПРОВЕРКИ РОЛЕЙ
// ============================================================

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
      error: "Доступ запрещен. Требуются права администратора проекта",
    });
    return;
  }

  next();
};

/**
 * Только администратор компании
 */
export const adminOrDeveloperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Не авторизован" });
    return;
  }

  // ✅ ТО ЖЕ САМОЕ: пропускает admin И developer_admin
  if (req.user.role !== "admin" && req.user.role !== "developer_admin") {
    res.status(403).json({
      success: false,
      error:
        "Доступ запрещен. Требуются права администратора проекта или компании",
    });
    return;
  }

  next();
};

/**
 * Только застройщик (admin, developer_admin, developer_manager)
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

// ============================================================
// 🔥 ПРОВЕРКИ ДОСТУПА К КОМПАНИИ (НОВЫЕ)
// ============================================================

/**
 * Проверка доступа к компании
 * Используется для маршрутов с параметром :companyId
 */
export const checkCompanyAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
      return;
    }

    // Администратор проекта имеет доступ ко всему
    if (user.role === "admin") {
      next();
      return;
    }

    // Получаем companyId из параметров, тела или query
    const companyId =
      req.params.companyId || req.body.companyId || req.query.companyId;

    // Если companyId не указан, используем компанию пользователя
    const targetCompanyId = companyId || user.companyId;

    if (!targetCompanyId) {
      res.status(403).json({
        success: false,
        error: "Компания не найдена",
      });
      return;
    }

    // Проверяем, что пользователь принадлежит этой компании
    if (user.companyId !== targetCompanyId) {
      res.status(403).json({
        success: false,
        error: "Доступ запрещен. Вы не принадлежите этой компании",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error in checkCompanyAccess:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка проверки доступа к компании",
    });
  }
};

/**
 * Проверка прав на запись (создание/редактирование)
 */
export const checkWriteAccess = (
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

  // Только admin и developer_admin могут создавать/редактировать
  if (req.user.role === "admin" || req.user.role === "developer_admin") {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    error: "Доступ запрещен. Недостаточно прав для изменения данных",
  });
};

/**
 * Проверка прав на чтение
 */
export const checkReadAccess = (
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

  // Все роли, кроме агента, могут читать
  if (req.user.role !== "agent") {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    error: "Доступ запрещен. Агенты не имеют доступа к этой информации",
  });
};

/**
 * Проверка, что пользователь является администратором своей компании
 */
export const isCompanyAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
      return;
    }

    // Admin имеет доступ ко всем компаниям
    if (user.role === "admin") {
      next();
      return;
    }

    // Проверяем, что пользователь - администратор компании
    if (user.role !== "developer_admin") {
      res.status(403).json({
        success: false,
        error: "Доступ запрещен. Требуются права администратора компании",
      });
      return;
    }

    // Проверяем, что у пользователя есть компания
    if (!user.companyId) {
      res.status(403).json({
        success: false,
        error: "У вас нет компании",
      });
      return;
    }

    // Получаем companyId из параметров
    const companyId = req.params.companyId || req.body.companyId;

    // Если передан companyId, проверяем, что это компания пользователя
    if (companyId && companyId !== user.companyId) {
      res.status(403).json({
        success: false,
        error: "Доступ запрещен. Вы можете управлять только своей компанией",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error in isCompanyAdmin:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка проверки прав администратора компании",
    });
  }
};

/**
 * Проверка, что пользователь может управлять пользователями в компании
 */
export const canManageUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
      return;
    }

    // Admin может управлять всеми пользователями
    if (user.role === "admin") {
      next();
      return;
    }

    // Developer Admin может управлять только пользователями своей компании
    if (user.role === "developer_admin") {
      // Проверяем, что есть компания
      if (!user.companyId) {
        res.status(403).json({
          success: false,
          error: "У вас нет компании",
        });
        return;
      }

      // Получаем ID пользователя, которым управляем
      const targetUserId = req.params.id || req.body.id;

      if (targetUserId) {
        // Проверяем, что целевой пользователь из этой же компании
        const targetUser = await authService.getUserById(targetUserId);
        if (targetUser && targetUser.companyId !== user.companyId) {
          res.status(403).json({
            success: false,
            error:
              "Доступ запрещен. Вы можете управлять только пользователями своей компании",
          });
          return;
        }
      }

      next();
      return;
    }

    // Остальные роли не могут управлять пользователями
    res.status(403).json({
      success: false,
      error: "Доступ запрещен. Недостаточно прав для управления пользователями",
    });
  } catch (error) {
    console.error("Error in canManageUsers:", error);
    res.status(500).json({
      success: false,
      error: "Ошибка проверки прав управления пользователями",
    });
  }
};

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

/**
 * Получить права пользователя
 */
export const getUserPermissions = (user?: AuthUser) => {
  if (!user) {
    return {
      canViewAll: false,
      canEditAll: false,
      canManageUsers: false,
      canManageCompany: false,
      allowedCompanies: [],
    };
  }

  switch (user.role) {
    case "admin":
      return {
        canViewAll: true,
        canEditAll: true,
        canManageUsers: true,
        canManageCompany: true,
        allowedCompanies: [],
      };

    case "developer_admin":
      return {
        canViewAll: false,
        canEditAll: false,
        canManageUsers: true,
        canManageCompany: false, // Не может изменять данные о компании
        allowedCompanies: [user.companyId || ""],
      };

    case "developer_manager":
      return {
        canViewAll: false,
        canEditAll: false,
        canManageUsers: false,
        canManageCompany: false,
        allowedCompanies: [user.companyId || ""],
      };

    case "agent":
      return {
        canViewAll: true,
        canEditAll: false,
        canManageUsers: false,
        canManageCompany: false,
        allowedCompanies: [],
      };

    default:
      return {
        canViewAll: false,
        canEditAll: false,
        canManageUsers: false,
        canManageCompany: false,
        allowedCompanies: [],
      };
  }
};

/**
 * Проверка, что пользователь имеет доступ к сущности
 */
export const hasAccessToEntity = (
  user: AuthUser,
  entityCompanyId: string | null | undefined,
): boolean => {
  if (!user) return false;

  // Admin имеет доступ ко всему
  if (user.role === "admin") return true;

  // Если у сущности нет компании, доступ запрещен для не-админов
  if (!entityCompanyId) return false;

  // Проверяем, что компания пользователя совпадает с компанией сущности
  return user.companyId === entityCompanyId;
};

/**
 * Фильтр для запросов, чтобы показывать только данные компании пользователя
 */
export const getCompanyFilter = (user: AuthUser): any => {
  if (!user) {
    return { companyId: null }; // Не показываем ничего
  }

  // Admin видит все
  if (user.role === "admin") {
    return {};
  }

  // Остальные видят только свою компанию
  if (user.companyId) {
    return { companyId: user.companyId };
  }

  // Если у пользователя нет компании, показываем только его собственные записи
  return { companyId: null };
};
