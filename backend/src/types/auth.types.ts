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
  companyId?: string; // 🔥 НОВОЕ ПОЛЕ - ID компании
  companyName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  isActive?: boolean;
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
