// frontend/src/types/auth.types.ts
export type UserRole =
  | "admin"
  | "developer_admin"
  | "developer_manager"
  | "agent";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  company?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  isActive?: boolean;
}

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
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  position?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// 🔥 Единый формат ответа
export interface AuthResponse {
  success: boolean;
  data: AuthUser;
  token?: string;
  message?: string;
}
