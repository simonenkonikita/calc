// frontend/src/types/auth.types.ts

export type UserRole =
  | "admin"
  | "developer_admin"
  | "developer_manager"
  | "agent";

// ============================================================
// 🔥 БАЗОВЫЙ ИНТЕРФЕЙС ДЛЯ АВТОРИЗАЦИИ
// ============================================================
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  company?: string; // ⚠️ Для обратной совместимости (название компании)
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// 🔥 ПОЛНЫЙ ИНТЕРФЕЙС ДЛЯ ПОЛЬЗОВАТЕЛЯ (с расширенной информацией)
// ============================================================
export interface User extends Omit<AuthUser, "company"> {
  password?: string;
  // Переопределяем company как объект
  company?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  // Или можно использовать companyId и companyName из AuthUser
  createdById?: string;
  createdBy?: User;
  createdUsers?: User[];
  lastLoginAt?: string;
}

// ============================================================
// 🔥 КОМПАНИЯ
// ============================================================
export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  phone?: string;
  address?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  adminId?: string;
  admin?: User;
  users?: User[];
  createdById?: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 🔥 КОНТЕКСТ АВТОРИЗАЦИИ
// ============================================================
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: Partial<RegisterData>) => Promise<boolean>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  isAgent: boolean;
  refreshUser: () => Promise<void>;
  getUserCompany: () => Company | null;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  companyId?: string;
  position?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ============================================================
// 🔥 DTO ДЛЯ СОЗДАНИЯ ПОЛЬЗОВАТЕЛЕЙ
// ============================================================
export interface CreateUserByAdminDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyId?: string;
  company?: string;
  position?: string;
  role: UserRole;
}

export interface CreateCompanyAdminDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company: string;
  companyId?: string;
}

export interface CreateCompanyManagerDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyId?: string;
  company?: string;
  position?: string;
}

export interface CreateCompanyWithAdminDto {
  companyName: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminPhone?: string;
  companyDescription?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyWebsite?: string;
}

// ============================================================
// 🔥 Единый формат ответа
// ============================================================
export interface AuthResponse {
  success: boolean;
  data: AuthUser;
  token?: string;
  message?: string;
}
