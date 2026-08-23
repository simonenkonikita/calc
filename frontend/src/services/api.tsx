import {
  CalculatorFormData,
  ConfigData,
  ProgramConfig,
  ProgramsResponse,
} from "../utils/types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// ==================== ТИПЫ ====================

// ==================== API КЛИЕНТ ====================

export const api = {
  // ==================== КАЛЬКУЛЯТОР ====================

  /**
   * Рассчет стоимости квартиры на основе переданных данных
   * @param formData - данные формы (площадь, этаж, и т.д.)
   * @param pricePerSquareMeter - цена за квадратный метр (опционально)
   * @returns Promise с результатом рассчета
   * @endpoint POST /calculator/calculate
   */
  async calculate(formData: CalculatorFormData, pricePerSquareMeter?: number) {
    const response = await fetch(`${API_URL}/calculator/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formData, pricePerSquareMeter }),
    });
    return response.json();
  },

  /**
   * Получение списка всех жилых комплексов
   * @returns Promise с массивом комплексов
   * @endpoint GET /calculator/complexes
   */
  async getComplexes() {
    const response = await fetch(`${API_URL}/calculator/complexes`);
    return response.json();
  },

  /**
   * Получение типов квартир в конкретном жилом комплексе
   * @param complexName - название жилого комплекса
   * @returns Promise с массивом типов квартир
   * @endpoint GET /calculator/complexes/{complexName}/types
   */
  async getComplexTypes(complexName: string) {
    const response = await fetch(
      `${API_URL}/calculator/complexes/${encodeURIComponent(complexName)}/types`,
    );
    return response.json();
  },

  /**
   * Получение цены для конкретного комплекса и типа квартиры
   * @param complex - название жилого комплекса
   * @param type - тип квартиры
   * @returns Promise с информацией о цене
   * @endpoint GET /calculator/price?complex={complex}&type={type}
   */
  async getPrice(complex: string, type: string) {
    const response = await fetch(
      `${API_URL}/calculator/price-per-square-meter?complex=${encodeURIComponent(complex)}&type=${encodeURIComponent(type)}`,
    );
    return response.json();
  },

  /**
   * Получение списка доступных банков для конкретного комплекса и типа квартиры
   * @param complexName - название жилого комплекса
   * @param apartmentType - тип квартиры
   * @returns Promise с массивом банков и их условиями
   * @endpoint GET /calculator/banks/{complexName}/{apartmentType}
   */
  async getAvailableBanks(complexName: string, apartmentType: string) {
    const response = await fetch(
      `${API_URL}/calculator/banks/${encodeURIComponent(complexName)}/${encodeURIComponent(apartmentType)}`,
    );
    return response.json();
  },

  /**
   * Получение данных по траншам (этапам финансирования)
   * @returns Promise с данными о траншах
   * @endpoint GET /calculator/tranche-data
   */
  async getTrancheData() {
    const response = await fetch(`${API_URL}/calculator/tranche-data`);
    return response.json();
  },

  // ==================== БАНКИ ====================

  /**
   * Получение списка всех банков-партнеров
   * @returns Promise с массивом всех банков
   * @endpoint GET /banks
   */
  async getAllBanks() {
    const response = await fetch(`${API_URL}/banks`);
    return response.json();
  },

  /**
   * Получение всех ипотечных предложений от банков
   * @returns Promise с массивом всех предложений
   * @endpoint GET /banks/offers
   */
  async getAllOffers() {
    const response = await fetch(`${API_URL}/banks/offers`);
    return response.json();
  },

  // ==================== ЛИМИТЫ ====================

  /**
   * Получение лимитов для расчета ипотеки (максимальная сумма, процент, и т.д.)
   * @returns Promise с объектом лимитов
   * @endpoint GET /limits
   */
  async getLimits() {
    const response = await fetch(`${API_URL}/limits`);
    return response.json();
  },

  // ==================== ПРОЕКТЫ ====================

  /**
   * Получение списка всех строительных проектов
   * @returns Promise с массивом проектов
   * @throws {Error} если статус ответа не 200-299
   * @endpoint GET /projects
   */
  async getProjects() {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Получение детальной информации по конкретному проекту по его ID
   * @param id - идентификатор проекта
   * @returns Promise с деталями проекта
   * @throws {Error} если статус ответа не 200-299
   * @endpoint GET /projects/{id}
   */
  async getProjectById(id: string) {
    const response = await fetch(`${API_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // ==================== ПРОГРАММЫ ====================

  /**
   * Получение всех доступных ипотечных программ
   * @returns Promise с объектом, содержащим программы и категории
   * @endpoint GET /api/programs/config
   * @note Использует относительный путь, а не полный API_URL
   */
  getPrograms: async (): Promise<ProgramsResponse> => {
    try {
      const response = await fetch("/api/programs/config");
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
   * @param complexName - название жилого комплекса
   * @returns Promise с массивом доступных программ для ЖК
   * @endpoint GET /api/programs/complex/{complexName}
   * @note Использует относительный путь, а не полный API_URL
   */
  getProgramsForComplex: async (
    complexName: string,
  ): Promise<{
    success: boolean;
    data?: ProgramConfig[];
    error?: string;
  }> => {
    try {
      const response = await fetch(
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
   * Получение конфигурации приложения (настройки, параметры, фичи)
   * @returns Promise с объектом конфигурации
   * @endpoint GET /api/config
   * @note Использует относительный путь /api/config, а не полный API_URL
   */
  getConfig: async (): Promise<{
    success: boolean;
    data?: ConfigData;
    error?: string;
  }> => {
    try {
      const response = await fetch("/api/config");
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
