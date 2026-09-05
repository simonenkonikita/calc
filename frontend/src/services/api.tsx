// frontend/src/services/api.ts

import {
  CalculatorFormData,
  ConfigData,
  ProgramConfig,
  ProgramsResponse,
} from "../utils/types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// ==================== 🔥 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

/**
 * Получение токена из localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * Получение заголовков с авторизацией
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Fetch с авторизацией
 */
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    credentials: "include",
  });
  return response;
};

// ==================== API КЛИЕНТ ====================

export const api = {
  // ==================== КАЛЬКУЛЯТОР ====================

  /**
   * Расчет стоимости квартиры
   */
  async calculate(formData: CalculatorFormData, pricePerSquareMeter?: number) {
    const response = await fetchWithAuth(`${API_URL}/calculator/calculate`, {
      method: "POST",
      body: JSON.stringify({ formData, pricePerSquareMeter }),
    });
    return response.json();
  },

  /**
   * Получение списка всех жилых комплексов (с фильтрацией по компании)
   */
  async getComplexes() {
    // 🔥 ИСПОЛЬЗУЕМ /calculator/complexes С АВТОРИЗАЦИЕЙ
    const response = await fetchWithAuth(`${API_URL}/calculator/complexes`);
    return response.json();
  },

  /**
   * Получение типов квартир в конкретном жилом комплексе
   */
  async getComplexTypes(complexName: string) {
    const response = await fetchWithAuth(
      `${API_URL}/calculator/complexes/${encodeURIComponent(complexName)}/types`,
    );
    return response.json();
  },

  /**
   * Получение цены для конкретного комплекса и типа квартиры
   */
  async getPrice(complex: string, type: string) {
    const response = await fetchWithAuth(
      `${API_URL}/calculator/price-per-square-meter?complex=${encodeURIComponent(complex)}&type=${encodeURIComponent(type)}`,
    );
    return response.json();
  },

  /**
   * Получение списка доступных банков для конкретного комплекса и типа квартиры
   */
  async getAvailableBanks(complexName: string, apartmentType: string) {
    const response = await fetchWithAuth(
      `${API_URL}/calculator/complexes/${encodeURIComponent(complexName)}/${encodeURIComponent(apartmentType)}/banks`,
    );
    return response.json();
  },

  /**
   * Получение данных по траншам
   */
  async getTrancheData() {
    const response = await fetchWithAuth(`${API_URL}/calculator/tranche-data`);
    return response.json();
  },

  // ==================== БАНКИ ====================

  /**
   * Получение списка всех банков-партнеров
   */
  async getAllBanks() {
    const response = await fetchWithAuth(`${API_URL}/banks`);
    return response.json();
  },

  /**
   * Получение всех ипотечных предложений от банков
   */
  async getAllOffers() {
    const response = await fetchWithAuth(`${API_URL}/banks/offers`);
    return response.json();
  },

  // ==================== ЛИМИТЫ ====================

  /**
   * Получение лимитов для расчета ипотеки
   */
  async getLimits() {
    const response = await fetchWithAuth(`${API_URL}/limits`);
    return response.json();
  },

  // ==================== ПРОЕКТЫ ====================

  /**
   * Получение списка всех строительных проектов
   */
  async getProjects() {
    const response = await fetchWithAuth(`${API_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Получение детальной информации по конкретному проекту
   */
  async getProjectById(id: string) {
    const response = await fetchWithAuth(`${API_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // ==================== ПРОГРАММЫ ====================

  /**
   * Получение всех доступных ипотечных программ
   */
  getPrograms: async (): Promise<ProgramsResponse> => {
    try {
      const response = await fetchWithAuth("/api/programs/config");
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Failed to load programs",
      };
    }
  },

  /**
   * Получение доступных ипотечных программ для конкретного ЖК
   */
  getProgramsForComplex: async (
    complexName: string,
  ): Promise<{
    success: boolean;
    data?: ProgramConfig[];
    error?: string;
  }> => {
    try {
      const response = await fetchWithAuth(
        `/api/programs/complex/${encodeURIComponent(complexName)}`,
      );
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Failed to load programs for complex",
      };
    }
  },

  // ==================== КОНФИГУРАЦИЯ ====================

  /**
   * Получение конфигурации приложения
   */
  getConfig: async (): Promise<{
    success: boolean;
    data?: ConfigData;
    error?: string;
  }> => {
    try {
      const response = await fetchWithAuth("/api/config");
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Failed to load config",
      };
    }
  },
};
