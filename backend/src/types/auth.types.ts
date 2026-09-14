// backend/src/types/auth.types.ts

import { Request } from "express";
import { UserRole } from "../entities/User";

/**
 * Тип для авторизованного пользователя
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  company?: string; // Для обратной совместимости (название компании)
  companyId?: string; // ID компании
  companyName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  isActive: boolean;
  isEmailVerified: boolean; // 🔥 ДОБАВЛЯЕМ
  emailVerifiedAt?: Date | string | null; // 🔥 ДОБАВЛЯЕМ (опционально)
  lastLoginAt?: Date | string | null; // 🔥 ДОБАВЛЯЕМ (опционально)
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Расширенный Request с пользователем
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

/**
 * Ответ авторизации
 */
export interface AuthResponse {
  user: AuthUser;
  token: string;
}
