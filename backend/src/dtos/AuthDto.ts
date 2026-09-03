// backend/src/dtos/AuthDto.ts
import { UserRole } from "../entities/User";

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole; // Игнорируется, всегда agent
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string; // Для обратной совместимости (строка)
  companyId?: string; // 🔥 НОВОЕ ПОЛЕ - ID компании
  position?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateUserByAdminDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  companyId?: string; // 🔥 НОВОЕ ПОЛЕ
  position?: string;
  role: UserRole;
}

export interface CreateCompanyAdminDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company: string;
  companyId?: string; // 🔥 НОВОЕ ПОЛЕ
}

export interface CreateCompanyManagerDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  companyId?: string; // 🔥 НОВОЕ ПОЛЕ
  position?: string;
}
