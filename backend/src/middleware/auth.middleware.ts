// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

/**
 * Проверка авторизации через cookie
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
    }

    const decoded = await authService.verifyToken(token);
    const user = await authService.getUserById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Не авторизован",
      });
    }

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
    return res.status(401).json({
      success: false,
      error: "Неверный токен",
    });
  }
};

/**
 * Опциональная авторизация (если есть токен - хорошо, нет - тоже)
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next();
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
