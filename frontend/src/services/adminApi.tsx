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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`,
    );
  }

  const data = await response.json();

  // Если ответ имеет структуру { success: true, data: ... }
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return data.data as T;
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

  async deleteProgram(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/admin/programs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete program");
  },

  // ============================================================
  // СТАВКИ
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
  // СУБСИДИИ
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
};

export default adminApi;
