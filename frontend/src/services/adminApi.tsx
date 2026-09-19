// frontend/src/services/adminApi.ts

import {
  AdminBank,
  AdminComplex,
  AdminApartmentType,
  AdminProgram,
  AdminRate,
  AdminSubsidy,
  AdminConfig,
  AdminOffer,
  AdminUser,
  AdminCompany,
  CreateComplexDTO,
  UpdateComplexDTO,
} from "../pages/Admin/types/admin.types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// 🔥 Получение токена из localStorage
const getToken = (): string | null => {
  return localStorage.getItem("token");
};
// ============================================================
// 🔥 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

// Вспомогательная функция для обработки ответов
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }

    // Специальная обработка для 409 Conflict (каскадное удаление)
    if (response.status === 409 && errorData.canCascade) {
      throw {
        status: 409,
        message: errorData.error || "Entity has associated records",
        offersCount: errorData.offersCount || 0,
        canCascade: errorData.canCascade || false,
      };
    }

    throw new Error(
      errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`,
    );
  }

  const data = await response.json();

  // Если ответ имеет структуру { success: true, data: ... }
  if (data && typeof data === "object" && "success" in data) {
    if (data.success) {
      return data.data !== undefined ? data.data : data;
    }
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

// 🔥 ЕДИНАЯ ФУНКЦИЯ ДЛЯ FETCH С АВТОРИЗАЦИЕЙ
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    credentials: "include", // 🔥 Передаем cookies
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  return handleResponse<T>(response);
}

// ============================================================
// 🔥 ADMIN API
// ============================================================

export const adminApi = {
  // ============================================================
  // БАНКИ
  // ============================================================
  async getBanks(): Promise<AdminBank[]> {
    return fetchWithAuth<AdminBank[]>(`${API_URL}/admin/banks`);
  },

  async getBank(id: string): Promise<AdminBank> {
    return fetchWithAuth<AdminBank>(`${API_URL}/admin/banks/${id}`);
  },

  async createBank(data: Partial<AdminBank>): Promise<AdminBank> {
    return fetchWithAuth<AdminBank>(`${API_URL}/admin/banks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateBank(id: string, data: Partial<AdminBank>): Promise<AdminBank> {
    return fetchWithAuth<AdminBank>(`${API_URL}/admin/banks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteBank(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/banks/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
  // ============================================================

  async getUsers(): Promise<AdminUser[]> {
    return fetchWithAuth<AdminUser[]>(`${API_URL}/auth/users`);
  },

  async getUser(id: string): Promise<AdminUser> {
    return fetchWithAuth<AdminUser>(`${API_URL}/auth/users/${id}`);
  },

  async createUserByAdmin(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    companyId?: string;
    position?: string;
    role: string;
  }): Promise<AdminUser> {
    return fetchWithAuth<AdminUser>(`${API_URL}/auth/admin/users`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    return fetchWithAuth<AdminUser>(`${API_URL}/auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/auth/users/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (АДМИНКА)
  // ============================================================

  /**
   * Сбросить пароль пользователя (только admin или developer_admin)
   */
  async resetUserPassword(
    id: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth<{ success: boolean; message: string }>(
      `${API_URL}/auth/admin/users/${id}/reset-password`,
      {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      },
    );
  },

  /**
   * Отправить ссылку для сброса пароля (только admin или developer_admin)
   */
  async sendPasswordResetLink(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth<{ success: boolean; message: string }>(
      `${API_URL}/auth/admin/users/${id}/send-reset-link`,
      {
        method: "POST",
      },
    );
  },

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ КОМПАНИЯМИ
  // ============================================================

  /**
   * Получить все компании (только для admin)
   */
  async getCompanies(): Promise<AdminCompany[]> {
    // 🔥 ИСПРАВЛЯЕМ URL: /auth/admin/companies -> /admin/companies
    return fetchWithAuth<AdminCompany[]>(`${API_URL}/admin/companies`);
  },

  /**
   * Получить компанию по ID
   */
  async getCompany(id: string): Promise<AdminCompany> {
    // 🔥 ИСПРАВЛЯЕМ URL: /auth/admin/companies -> /admin/companies
    return fetchWithAuth<AdminCompany>(`${API_URL}/admin/companies/${id}`);
  },

  /**
   * Создать компанию с администратором (только для admin)
   */
  // frontend/src/services/adminApi.ts

  /**
   * Создать компанию с администратором (только для admin)
   */
  async createCompany(data: {
    name: string;
    phone?: string;
    address?: string;
    website?: string;
    deposit?: number | null;
  }): Promise<AdminCompany> {
    return fetchWithAuth<AdminCompany>(`${API_URL}/admin/companies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Обновить компанию (только для admin)
   */
  async updateCompany(
    id: string,
    data: Partial<AdminCompany>,
  ): Promise<AdminCompany> {
    // 🔥 ИСПРАВЛЯЕМ URL: /auth/admin/companies -> /admin/companies
    return fetchWithAuth<AdminCompany>(`${API_URL}/admin/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Удалить компанию (только для admin)
   */
  async deleteCompany(id: string): Promise<void> {
    // 🔥 ИСПРАВЛЯЕМ URL: /auth/admin/companies -> /admin/companies
    await fetchWithAuth<void>(`${API_URL}/admin/companies/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // 🔥 СОЗДАНИЕ МЕНЕДЖЕРА
  // ============================================================

  async createCompanyManager(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    position?: string;
    companyId?: string;
  }): Promise<AdminUser> {
    return fetchWithAuth<AdminUser>(`${API_URL}/auth/admin/company-managers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ СВОИМ ПРОФИЛЕМ
  // ============================================================

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    position?: string;
  }): Promise<AdminUser> {
    return fetchWithAuth<AdminUser>(`${API_URL}/auth/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/auth/change-password`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ============================================================
  // ЖК (КОМПЛЕКСЫ)
  // ============================================================
  async getComplexes(): Promise<AdminComplex[]> {
    return fetchWithAuth<AdminComplex[]>(`${API_URL}/admin/complexes`);
  },

  async getComplex(id: string): Promise<AdminComplex> {
    return fetchWithAuth<AdminComplex>(`${API_URL}/admin/complexes/${id}`);
  },

  async createComplex(data: CreateComplexDTO): Promise<AdminComplex> {
    return fetchWithAuth<AdminComplex>(`${API_URL}/admin/complexes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateComplex(
    id: string,
    data: UpdateComplexDTO,
  ): Promise<AdminComplex> {
    return fetchWithAuth<AdminComplex>(`${API_URL}/admin/complexes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteComplex(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/complexes/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // ТИПЫ КВАРТИР
  // ============================================================
  async getApartmentTypes(complexId: string): Promise<AdminApartmentType[]> {
    return fetchWithAuth<AdminApartmentType[]>(
      `${API_URL}/admin/complexes/${complexId}/apartment-types`,
    );
  },

  async createApartmentType(
    complexId: string,
    data: Partial<AdminApartmentType>,
  ): Promise<AdminApartmentType> {
    return fetchWithAuth<AdminApartmentType>(
      `${API_URL}/admin/complexes/${complexId}/apartment-types`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateApartmentType(
    id: string,
    data: Partial<AdminApartmentType>,
  ): Promise<AdminApartmentType> {
    return fetchWithAuth<AdminApartmentType>(
      `${API_URL}/admin/apartment-types/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async deleteApartmentType(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/apartment-types/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // ПРОГРАММЫ
  // ============================================================
  async getPrograms(): Promise<AdminProgram[]> {
    return fetchWithAuth<AdminProgram[]>(`${API_URL}/admin/programs`);
  },

  async getProgram(id: string): Promise<AdminProgram> {
    return fetchWithAuth<AdminProgram>(`${API_URL}/admin/programs/${id}`);
  },

  async createProgram(data: Partial<AdminProgram>): Promise<AdminProgram> {
    return fetchWithAuth<AdminProgram>(`${API_URL}/admin/programs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateProgram(
    id: string,
    data: Partial<AdminProgram>,
  ): Promise<AdminProgram> {
    return fetchWithAuth<AdminProgram>(`${API_URL}/admin/programs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteProgram(
    id: string,
    cascade?: boolean,
  ): Promise<{ offersDeleted?: number }> {
    const url = cascade
      ? `${API_URL}/admin/programs/${id}?cascade=true`
      : `${API_URL}/admin/programs/${id}`;

    return fetchWithAuth<{ offersDeleted?: number }>(url, {
      method: "DELETE",
    });
  },

  // ============================================================
  // СТАВКИ (старые, для обратной совместимости)
  // ============================================================
  async getRates(): Promise<AdminRate[]> {
    return fetchWithAuth<AdminRate[]>(`${API_URL}/admin/rates`);
  },

  async createRate(data: Partial<AdminRate>): Promise<AdminRate> {
    return fetchWithAuth<AdminRate>(`${API_URL}/admin/rates`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateRate(id: string, data: Partial<AdminRate>): Promise<AdminRate> {
    return fetchWithAuth<AdminRate>(`${API_URL}/admin/rates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteRate(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/rates/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // СУБСИДИИ (старые, для обратной совместимости)
  // ============================================================
  async getSubsidies(): Promise<AdminSubsidy[]> {
    return fetchWithAuth<AdminSubsidy[]>(`${API_URL}/admin/subsidies`);
  },

  async createSubsidy(data: Partial<AdminSubsidy>): Promise<AdminSubsidy> {
    return fetchWithAuth<AdminSubsidy>(`${API_URL}/admin/subsidies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSubsidy(
    id: string,
    data: Partial<AdminSubsidy>,
  ): Promise<AdminSubsidy> {
    return fetchWithAuth<AdminSubsidy>(`${API_URL}/admin/subsidies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSubsidy(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/subsidies/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // КОНФИГУРАЦИЯ
  // ============================================================
  async getConfig(): Promise<AdminConfig> {
    return fetchWithAuth<AdminConfig>(`${API_URL}/admin/config`);
  },

  async checkConfig(): Promise<{ exists: boolean }> {
    return fetchWithAuth<{ exists: boolean }>(`${API_URL}/admin/config/check`);
  },

  async createConfig(data: Partial<AdminConfig>): Promise<AdminConfig> {
    return fetchWithAuth<AdminConfig>(`${API_URL}/admin/config`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateConfig(data: Partial<AdminConfig>): Promise<AdminConfig> {
    return fetchWithAuth<AdminConfig>(`${API_URL}/admin/config`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // ============================================================
  // ОФФЕРЫ
  // ============================================================
  async getOffers(): Promise<AdminOffer[]> {
    return fetchWithAuth<AdminOffer[]>(`${API_URL}/admin/offers`);
  },

  async getActiveOffers(): Promise<AdminOffer[]> {
    return fetchWithAuth<AdminOffer[]>(`${API_URL}/admin/offers/active`);
  },

  async getOffer(id: string): Promise<AdminOffer> {
    return fetchWithAuth<AdminOffer>(`${API_URL}/admin/offers/${id}`);
  },

  async createOffer(data: Partial<AdminOffer>): Promise<AdminOffer> {
    return fetchWithAuth<AdminOffer>(`${API_URL}/admin/offers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateOffer(
    id: string,
    data: Partial<AdminOffer>,
  ): Promise<AdminOffer> {
    return fetchWithAuth<AdminOffer>(`${API_URL}/admin/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteOffer(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/offers/${id}`, {
      method: "DELETE",
    });
  },

  async restoreOffer(id: string): Promise<AdminOffer> {
    return fetchWithAuth<AdminOffer>(`${API_URL}/admin/offers/${id}/restore`, {
      method: "POST",
    });
  },

  async hardDeleteOffer(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/offers/${id}/hard`, {
      method: "DELETE",
    });
  },

  async copyOffer(id: string): Promise<AdminOffer> {
    return fetchWithAuth<AdminOffer>(`${API_URL}/admin/offers/${id}/copy`, {
      method: "POST",
    });
  },

  async getOffersFiltered(filters: any): Promise<AdminOffer[]> {
    const params = new URLSearchParams(filters).toString();
    return fetchWithAuth<AdminOffer[]>(
      `${API_URL}/admin/offers/filter?${params}`,
    );
  },

  async getRateRange(filters?: {
    bankId?: string;
    programId?: string;
    complexName?: string;
  }): Promise<{ minRate: number; maxRate: number }> {
    const params = new URLSearchParams(filters || {}).toString();
    return fetchWithAuth<{ minRate: number; maxRate: number }>(
      `${API_URL}/admin/offers/rate-range?${params}`,
    );
  },

  // ============================================================
  // ДИНАМИЧЕСКИЕ СТАВКИ ДЛЯ ОФФЕРОВ
  // ============================================================
  async getOfferRates(offerId: string): Promise<any[]> {
    return fetchWithAuth<any[]>(`${API_URL}/admin/offers/${offerId}/rates`);
  },

  async createOfferRate(offerId: string, data: any): Promise<any> {
    return fetchWithAuth<any>(`${API_URL}/admin/offers/${offerId}/rates`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateOfferRate(id: string, data: any): Promise<any> {
    return fetchWithAuth<any>(`${API_URL}/admin/rates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteOfferRate(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/rates/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // ДИНАМИЧЕСКИЕ СУБСИДИИ ДЛЯ ОФФЕРОВ
  // ============================================================
  async getOfferSubsidies(offerId: string): Promise<any[]> {
    return fetchWithAuth<any[]>(`${API_URL}/admin/offers/${offerId}/subsidies`);
  },

  async createOfferSubsidy(offerId: string, data: any): Promise<any> {
    return fetchWithAuth<any>(`${API_URL}/admin/offers/${offerId}/subsidies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateOfferSubsidy(id: string, data: any): Promise<any> {
    return fetchWithAuth<any>(`${API_URL}/admin/subsidies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteOfferSubsidy(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/subsidies/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // НОВЫЕ ДИНАМИЧЕСКИЕ СТАВКИ
  // ============================================================
  async getDynamicRates(): Promise<any[]> {
    return fetchWithAuth<any[]>(`${API_URL}/admin/dynamic-rates`);
  },

  async getDynamicRate(id: string): Promise<any> {
    return fetchWithAuth<any>(`${API_URL}/admin/dynamic-rates/${id}`);
  },

  async createDynamicRate(offerId: string, data: any): Promise<any> {
    return fetchWithAuth<any>(
      `${API_URL}/admin/offers/${offerId}/dynamic-rates`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateDynamicRate(id: string, data: any): Promise<any> {
    return fetchWithAuth<any>(`${API_URL}/admin/dynamic-rates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteDynamicRate(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/dynamic-rates/${id}`, {
      method: "DELETE",
    });
  },

  async updateDynamicRatesPriorities(
    rates: { id: string; priority: number }[],
  ): Promise<any[]> {
    return fetchWithAuth<any[]>(`${API_URL}/admin/dynamic-rates/priorities`, {
      method: "PUT",
      body: JSON.stringify({ rates }),
    });
  },

  // ============================================================
  // ДИНАМИЧЕСКИЕ СТАВКИ - HARD DELETE
  // ============================================================
  async hardDeleteDynamicRate(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/dynamic-rates/${id}/hard`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // НОВЫЕ ДИНАМИЧЕСКИЕ СУБСИДИИ
  // ============================================================
  async getDynamicSubsidies(): Promise<any[]> {
    return fetchWithAuth<any[]>(`${API_URL}/admin/dynamic-subsidies`);
  },

  async getDynamicSubsidy(id: string): Promise<any> {
    return fetchWithAuth<any>(`${API_URL}/admin/dynamic-subsidies/${id}`);
  },

  async createDynamicSubsidy(offerId: string, data: any): Promise<any> {
    return fetchWithAuth<any>(
      `${API_URL}/admin/offers/${offerId}/dynamic-subsidies`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateDynamicSubsidy(id: string, data: any): Promise<any> {
    return fetchWithAuth<any>(`${API_URL}/admin/dynamic-subsidies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteDynamicSubsidy(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/dynamic-subsidies/${id}`, {
      method: "DELETE",
    });
  },

  async updateDynamicSubsidiesPriorities(
    subsidies: { id: string; priority: number }[],
  ): Promise<any[]> {
    return fetchWithAuth<any[]>(
      `${API_URL}/admin/dynamic-subsidies/priorities`,
      {
        method: "PUT",
        body: JSON.stringify({ subsidies }),
      },
    );
  },

  // ============================================================
  // ДИНАМИЧЕСКИЕ СУБСИДИИ - HARD DELETE
  // ============================================================
  async hardDeleteDynamicSubsidy(id: string): Promise<void> {
    await fetchWithAuth<void>(`${API_URL}/admin/dynamic-subsidies/${id}/hard`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // ПОЛУЧЕНИЕ ДИНАМИЧЕСКИХ ДАННЫХ ДЛЯ ОФФЕРА
  // ============================================================
  async getOfferDynamicRates(offerId: string): Promise<any[]> {
    return fetchWithAuth<any[]>(
      `${API_URL}/admin/offers/${offerId}/dynamic-rates`,
    );
  },

  async getOfferDynamicSubsidies(offerId: string): Promise<any[]> {
    return fetchWithAuth<any[]>(
      `${API_URL}/admin/offers/${offerId}/dynamic-subsidies`,
    );
  },

  // ============================================================
  // ПРОЧИЕ ДИНАМИЧЕСКИЕ СУБСИДИИ
  // ============================================================
  async copyDynamicSubsidies(
    sourceOfferId: string,
    targetOfferId: string,
  ): Promise<any[]> {
    return fetchWithAuth<any[]>(`${API_URL}/admin/dynamic-subsidies/copy`, {
      method: "POST",
      body: JSON.stringify({ sourceOfferId, targetOfferId }),
    });
  },

  async deleteDynamicSubsidiesByOffer(
    offerId: string,
  ): Promise<{ affected: number }> {
    return fetchWithAuth<{ affected: number }>(
      `${API_URL}/admin/offers/${offerId}/dynamic-subsidies`,
      { method: "DELETE" },
    );
  },

  async getDynamicSubsidiesStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byOffer: { offerId: string; count: string }[];
  }> {
    return fetchWithAuth<any>(`${API_URL}/admin/dynamic-subsidies/stats`);
  },

  // ============================================================
  // 🔥 ПОВТОРНАЯ ОТПРАВКА ПИСЬМА ПОДТВЕРЖДЕНИЯ (для админа - по ID пользователя)
  // ============================================================
  resendVerificationByAdmin: async (
    userId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_URL}/auth/admin/users/${userId}/resend-verification`,
      {
        method: "POST",
        headers,
        credentials: "include",
      },
    );
    return handleResponse(response);
  },

  // ============================================================
  // УПРАВЛЕНИЕ УСЛОВИЯМИ ОПЛАТЫ ДЛЯ ЖК
  // ============================================================

  // Добавить условие оплаты
  async addPaymentTerm(
    complexId: string,
    term: string,
  ): Promise<{ success: boolean; data: string[]; message: string }> {
    return fetchWithAuth<{ success: boolean; data: string[]; message: string }>(
      `${API_URL}/admin/complexes/${complexId}/payment-terms`,
      {
        method: "POST",
        body: JSON.stringify({ term }),
      },
    );
  },

  // Удалить условие оплаты
  async removePaymentTerm(
    complexId: string,
    term: string,
  ): Promise<{ success: boolean; data: string[]; message: string }> {
    return fetchWithAuth<{ success: boolean; data: string[]; message: string }>(
      `${API_URL}/admin/complexes/${complexId}/payment-terms`,
      {
        method: "DELETE",
        body: JSON.stringify({ term }),
      },
    );
  },

  // Обновить все условия оплаты
  async updatePaymentTerms(
    complexId: string,
    terms: string[],
  ): Promise<{ success: boolean; data: string[]; message: string }> {
    return fetchWithAuth<{ success: boolean; data: string[]; message: string }>(
      `${API_URL}/admin/complexes/${complexId}/payment-terms`,
      {
        method: "PUT",
        body: JSON.stringify({ terms }),
      },
    );
  },
};

export default adminApi;
