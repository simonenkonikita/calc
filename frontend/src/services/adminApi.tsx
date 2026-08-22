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
} from "../pages/Admin/types/admin.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

export const adminApi = {
  // ============================================================
  // БАНКИ
  // ============================================================
  async getBanks(): Promise<AdminBank[]> {
    const response = await fetch(`${API_URL}/admin/banks`);
    return handleResponse<AdminBank[]>(response);
  },

  async getBank(id: string): Promise<AdminBank> {
    const response = await fetch(`${API_URL}/admin/banks/${id}`);
    return handleResponse<AdminBank>(response);
  },

  async createBank(data: Partial<AdminBank>): Promise<AdminBank> {
    const response = await fetch(`${API_URL}/admin/banks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminBank>(response);
  },

  async updateBank(id: string, data: Partial<AdminBank>): Promise<AdminBank> {
    const response = await fetch(`${API_URL}/admin/banks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminBank>(response);
  },

  async deleteBank(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/banks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete bank");
  },

  // ============================================================
  // ЖК (КОМПЛЕКСЫ)
  // ============================================================
  async getComplexes(): Promise<AdminComplex[]> {
    const response = await fetch(`${API_URL}/admin/complexes`);
    return handleResponse<AdminComplex[]>(response);
  },

  async getComplex(id: string): Promise<AdminComplex> {
    const response = await fetch(`${API_URL}/admin/complexes/${id}`);
    return handleResponse<AdminComplex>(response);
  },

  async createComplex(data: Partial<AdminComplex>): Promise<AdminComplex> {
    const response = await fetch(`${API_URL}/admin/complexes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminComplex>(response);
  },

  async updateComplex(
    id: string,
    data: Partial<AdminComplex>,
  ): Promise<AdminComplex> {
    const response = await fetch(`${API_URL}/admin/complexes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminComplex>(response);
  },

  async deleteComplex(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/complexes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete complex");
  },

  // ============================================================
  // ТИПЫ КВАРТИР
  // ============================================================
  async getApartmentTypes(complexId: string): Promise<AdminApartmentType[]> {
    const response = await fetch(
      `${API_URL}/admin/complexes/${complexId}/apartment-types`,
    );
    return handleResponse<AdminApartmentType[]>(response);
  },

  async createApartmentType(
    complexId: string,
    data: Partial<AdminApartmentType>,
  ): Promise<AdminApartmentType> {
    const response = await fetch(
      `${API_URL}/admin/complexes/${complexId}/apartment-types`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    return handleResponse<AdminApartmentType>(response);
  },

  async updateApartmentType(
    id: string,
    data: Partial<AdminApartmentType>,
  ): Promise<AdminApartmentType> {
    const response = await fetch(`${API_URL}/admin/apartment-types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminApartmentType>(response);
  },

  async deleteApartmentType(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/apartment-types/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete apartment type");
  },

  // ============================================================
  // ПРОГРАММЫ
  // ============================================================
  async getPrograms(): Promise<AdminProgram[]> {
    const response = await fetch(`${API_URL}/admin/programs`);
    return handleResponse<AdminProgram[]>(response);
  },

  async getProgram(id: string): Promise<AdminProgram> {
    const response = await fetch(`${API_URL}/admin/programs/${id}`);
    return handleResponse<AdminProgram>(response);
  },

  async createProgram(data: Partial<AdminProgram>): Promise<AdminProgram> {
    const response = await fetch(`${API_URL}/admin/programs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminProgram>(response);
  },

  async updateProgram(
    id: string,
    data: Partial<AdminProgram>,
  ): Promise<AdminProgram> {
    const response = await fetch(`${API_URL}/admin/programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminProgram>(response);
  },

  async deleteProgram(
    id: string,
    cascade?: boolean,
  ): Promise<{ offersDeleted?: number }> {
    const url = cascade
      ? `${API_URL}/admin/programs/${id}?cascade=true`
      : `${API_URL}/admin/programs/${id}`;

    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }

      if (response.status === 409) {
        throw {
          status: 409,
          message: errorData.error || "Program has associated offers",
          offersCount: errorData.offersCount || 0,
          canCascade: errorData.canCascade || false,
        };
      }

      throw new Error(
        errorData.error || errorData.message || "Failed to delete program",
      );
    }

    const data = await response.json();
    return data;
  },

  // ============================================================
  // СТАВКИ (старые, для обратной совместимости)
  // ============================================================
  async getRates(): Promise<AdminRate[]> {
    const response = await fetch(`${API_URL}/admin/rates`);
    return handleResponse<AdminRate[]>(response);
  },

  async createRate(data: Partial<AdminRate>): Promise<AdminRate> {
    const response = await fetch(`${API_URL}/admin/rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminRate>(response);
  },

  async updateRate(id: string, data: Partial<AdminRate>): Promise<AdminRate> {
    const response = await fetch(`${API_URL}/admin/rates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminRate>(response);
  },

  async deleteRate(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/rates/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete rate");
  },

  // ============================================================
  // СУБСИДИИ (старые, для обратной совместимости)
  // ============================================================
  async getSubsidies(): Promise<AdminSubsidy[]> {
    const response = await fetch(`${API_URL}/admin/subsidies`);
    return handleResponse<AdminSubsidy[]>(response);
  },

  async createSubsidy(data: Partial<AdminSubsidy>): Promise<AdminSubsidy> {
    const response = await fetch(`${API_URL}/admin/subsidies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminSubsidy>(response);
  },

  async updateSubsidy(
    id: string,
    data: Partial<AdminSubsidy>,
  ): Promise<AdminSubsidy> {
    const response = await fetch(`${API_URL}/admin/subsidies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminSubsidy>(response);
  },

  async deleteSubsidy(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/subsidies/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete subsidy");
  },

  // ============================================================
  // КОНФИГУРАЦИЯ
  // ============================================================
  async getConfig(): Promise<AdminConfig> {
    const response = await fetch(`${API_URL}/admin/config`);
    return handleResponse<AdminConfig>(response);
  },

  async updateConfig(data: Partial<AdminConfig>): Promise<AdminConfig> {
    const response = await fetch(`${API_URL}/admin/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminConfig>(response);
  },

  // ============================================================
  // ОФФЕРЫ
  // ============================================================
  async getOffers(): Promise<AdminOffer[]> {
    const response = await fetch(`${API_URL}/admin/offers`);
    return handleResponse<AdminOffer[]>(response);
  },

  async getActiveOffers(): Promise<AdminOffer[]> {
    const response = await fetch(`${API_URL}/admin/offers/active`);
    return handleResponse<AdminOffer[]>(response);
  },

  async getOffer(id: string): Promise<AdminOffer> {
    const response = await fetch(`${API_URL}/admin/offers/${id}`);
    return handleResponse<AdminOffer>(response);
  },

  async createOffer(data: Partial<AdminOffer>): Promise<AdminOffer> {
    const response = await fetch(`${API_URL}/admin/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminOffer>(response);
  },

  async updateOffer(
    id: string,
    data: Partial<AdminOffer>,
  ): Promise<AdminOffer> {
    const response = await fetch(`${API_URL}/admin/offers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AdminOffer>(response);
  },

  async deleteOffer(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/offers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete offer");
  },

  async restoreOffer(id: string): Promise<AdminOffer> {
    const response = await fetch(`${API_URL}/admin/offers/${id}/restore`, {
      method: "POST",
    });
    return handleResponse<AdminOffer>(response);
  },

  async hardDeleteOffer(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/offers/${id}/hard`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to hard delete offer");
  },

  async copyOffer(id: string): Promise<AdminOffer> {
    const response = await fetch(`${API_URL}/admin/offers/${id}/copy`, {
      method: "POST",
    });
    return handleResponse<AdminOffer>(response);
  },

  async getOffersFiltered(filters: any): Promise<AdminOffer[]> {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/admin/offers/filter?${params}`);
    return handleResponse<AdminOffer[]>(response);
  },

  async getRateRange(filters?: {
    bankId?: string;
    programId?: string;
    complexName?: string;
  }): Promise<{ minRate: number; maxRate: number }> {
    const params = new URLSearchParams(filters || {}).toString();
    const response = await fetch(
      `${API_URL}/admin/offers/rate-range?${params}`,
    );
    return handleResponse<{ minRate: number; maxRate: number }>(response);
  },

  // ============================================================
  // ДИНАМИЧЕСКИЕ СТАВКИ ДЛЯ ОФФЕРОВ
  // ============================================================
  async getOfferRates(offerId: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/admin/offers/${offerId}/rates`);
    return handleResponse<any[]>(response);
  },

  async createOfferRate(offerId: string, data: any): Promise<any> {
    const response = await fetch(`${API_URL}/admin/offers/${offerId}/rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async updateOfferRate(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_URL}/admin/rates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async deleteOfferRate(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/rates/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete rate");
  },

  // ============================================================
  // ДИНАМИЧЕСКИЕ СУБСИДИИ ДЛЯ ОФФЕРОВ
  // ============================================================
  async getOfferSubsidies(offerId: string): Promise<any[]> {
    const response = await fetch(
      `${API_URL}/admin/offers/${offerId}/subsidies`,
    );
    return handleResponse<any[]>(response);
  },

  async createOfferSubsidy(offerId: string, data: any): Promise<any> {
    const response = await fetch(
      `${API_URL}/admin/offers/${offerId}/subsidies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    return handleResponse<any>(response);
  },

  async updateOfferSubsidy(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_URL}/admin/subsidies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async deleteOfferSubsidy(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/subsidies/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete subsidy");
  },

  // ============================================================
  // НОВЫЕ ДИНАМИЧЕСКИЕ СТАВКИ (через отдельные эндпоинты)
  // ============================================================
  async getDynamicRates(): Promise<any[]> {
    const response = await fetch(`${API_URL}/admin/dynamic-rates`);
    return handleResponse<any[]>(response);
  },

  async getDynamicRate(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/admin/dynamic-rates/${id}`);
    return handleResponse<any>(response);
  },

  async createDynamicRate(offerId: string, data: any): Promise<any> {
    const response = await fetch(
      `${API_URL}/admin/offers/${offerId}/dynamic-rates`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    return handleResponse<any>(response);
  },

  async updateDynamicRate(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_URL}/admin/dynamic-rates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async deleteDynamicRate(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/dynamic-rates/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete rate");
  },

  async hardDeleteDynamicRate(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/dynamic-rates/${id}/hard`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to hard delete rate");
  },

  async updateDynamicRatesPriorities(
    rates: { id: string; priority: number }[],
  ): Promise<any[]> {
    const response = await fetch(`${API_URL}/admin/dynamic-rates/priorities`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rates }),
    });
    return handleResponse<any[]>(response);
  },

  // ============================================================
  // НОВЫЕ ДИНАМИЧЕСКИЕ СУБСИДИИ (через отдельные эндпоинты)
  // ============================================================
  async getDynamicSubsidies(): Promise<any[]> {
    const response = await fetch(`${API_URL}/admin/dynamic-subsidies`);
    return handleResponse<any[]>(response);
  },

  async getDynamicSubsidy(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/admin/dynamic-subsidies/${id}`);
    return handleResponse<any>(response);
  },

  async createDynamicSubsidy(offerId: string, data: any): Promise<any> {
    const response = await fetch(
      `${API_URL}/admin/offers/${offerId}/dynamic-subsidies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    return handleResponse<any>(response);
  },

  async updateDynamicSubsidy(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_URL}/admin/dynamic-subsidies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async deleteDynamicSubsidy(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/dynamic-subsidies/${id}`, {
      method: "DELETE",
    });

    // 🔥 Проверяем статус ответа
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(
        errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`,
      );
    }

    // 🔥 Для DELETE запросов не нужно парсить тело (или оно может быть пустым)
    // Просто проверяем, что ответ успешный
    try {
      const data = await response.json();
      // Если ответ имеет структуру { success: true, ... }
      if (data && typeof data === "object" && "success" in data) {
        if (!data.success) {
          throw new Error(data.error || "Delete failed");
        }
      }
    } catch (e) {
      // Если тело ответа пустое или невалидный JSON - игнорируем
      // Это нормально для DELETE запросов
    }
  },

  async updateDynamicSubsidiesPriorities(
    subsidies: { id: string; priority: number }[],
  ): Promise<any[]> {
    const response = await fetch(
      `${API_URL}/admin/dynamic-subsidies/priorities`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subsidies }),
      },
    );
    return handleResponse<any[]>(response);
  },

  async copyDynamicSubsidies(
    sourceOfferId: string,
    targetOfferId: string,
  ): Promise<any[]> {
    const response = await fetch(`${API_URL}/admin/dynamic-subsidies/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceOfferId, targetOfferId }),
    });
    return handleResponse<any[]>(response);
  },

  async deleteDynamicSubsidiesByOffer(
    offerId: string,
  ): Promise<{ affected: number }> {
    const response = await fetch(
      `${API_URL}/admin/offers/${offerId}/dynamic-subsidies`,
      {
        method: "DELETE",
      },
    );
    return handleResponse<{ affected: number }>(response);
  },

  async getDynamicSubsidiesStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byOffer: { offerId: string; count: string }[];
  }> {
    const response = await fetch(`${API_URL}/admin/dynamic-subsidies/stats`);
    return handleResponse<any>(response);
  },

  // ============================================================
  // ПОЛУЧЕНИЕ ДИНАМИЧЕСКИХ ДАННЫХ ДЛЯ ОФФЕРА (для калькулятора)
  // ============================================================
  async getOfferDynamicRates(offerId: string): Promise<any[]> {
    const response = await fetch(
      `${API_URL}/admin/offers/${offerId}/dynamic-rates`,
    );
    return handleResponse<any[]>(response);
  },

  async getOfferDynamicSubsidies(offerId: string): Promise<any[]> {
    const response = await fetch(
      `${API_URL}/admin/offers/${offerId}/dynamic-subsidies`,
    );
    return handleResponse<any[]>(response);
  },

  // frontend/src/services/adminApi.ts

  // Добавьте эти методы в раздел "ДИНАМИЧЕСКИЕ СТАВКИ ДЛЯ ОФФЕРОВ" или создайте новый раздел

  // ============================================================
  // ДИНАМИЧЕСКИЕ СТАВКИ - HARD DELETE
  // ============================================================
  async hardDeleteDynamicRate(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/dynamic-rates/${id}/hard`, {
      method: "DELETE",
    });
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(
        errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`,
      );
    }
  },

  // ============================================================
  // ДИНАМИЧЕСКИЕ СУБСИДИИ - HARD DELETE
  // ============================================================
  async hardDeleteDynamicSubsidy(id: string): Promise<void> {
    const response = await fetch(
      `${API_URL}/admin/dynamic-subsidies/${id}/hard`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(
        errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`,
      );
    }
  },
};

export default adminApi;
