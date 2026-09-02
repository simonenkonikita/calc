// backend/src/dtos/AuthDto.ts
import { UserRole } from "../entities/User";

/**
 * DTO для регистрации
 */
export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  position?: string;
  role?: UserRole;
}

/**
 * DTO для входа
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * DTO для обновления профиля
 */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
}

/**
 * DTO для смены пароля
 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

/**
 * DTO для обновления пользователя (админ)
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  position?: string;
  role?: UserRole;
  isActive?: boolean;
}
