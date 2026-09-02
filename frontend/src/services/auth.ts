// frontend/src/api/auth.ts
import { RegisterData, LoginData, AuthResponse } from "../types/auth.types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// 🔥 Получение токена из localStorage
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// 🔥 Сохранение токена
const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

// 🔥 Удаление токена
const removeToken = (): void => {
  localStorage.removeItem("token");
};

export const authApi = {
  // ============================================================
  // РЕГИСТРАЦИЯ
  // ============================================================
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await handleResponse<AuthResponse>(response);

    // 🔥 Сохраняем токен (result.token, а не result.data.token)
    if (result.success && result.token) {
      setToken(result.token);
    }

    return result;
  },

  // ============================================================
  // ВХОД
  // ============================================================
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await handleResponse<AuthResponse>(response);

    // 🔥 Сохраняем токен (result.token, а не result.data.token)
    if (result.success && result.token) {
      setToken(result.token);
    }

    return result;
  },

  // ============================================================
  // ВЫХОД
  // ============================================================
  logout: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      await handleResponse(response);
    } finally {
      // 🔥 Всегда удаляем токен
      removeToken();
    }
  },

  // ============================================================
  // ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
  // ============================================================
  me: async (): Promise<AuthResponse> => {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // 🔥 Добавляем Bearer token если есть
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers,
      credentials: "include",
    });
    return handleResponse<AuthResponse>(response);
  },

  // ============================================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ============================================================
  updateProfile: async (data: Partial<RegisterData>): Promise<AuthResponse> => {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  // ============================================================
  // СМЕНА ПАРОЛЯ
  // ============================================================
  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<any> => {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};
