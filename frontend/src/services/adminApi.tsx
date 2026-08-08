// frontend/src/services/adminApi.ts

import {
  AdminBank,
  AdminComplex,
  AdminProgram,
  AdminRate,
  AdminSubsidy,
  AdminConfig,
} from "../pages/Admin/types/admin.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const adminApi = {
  // ============================================================
  // БАНКИ
  // ============================================================
  async getBanks(): Promise<AdminBank[]> {
    const response = await fetch(`${API_URL}/admin/banks`);
    return response.json();
  },

  async createBank(data: Partial<AdminBank>): Promise<AdminBank> {
    const response = await fetch(`${API_URL}/admin/banks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateBank(id: string, data: Partial<AdminBank>): Promise<AdminBank> {
    const response = await fetch(`${API_URL}/admin/banks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteBank(id: string): Promise<void> {
    await fetch(`${API_URL}/admin/banks/${id}`, { method: "DELETE" });
  },

  // ============================================================
  // ЖК (КОМПЛЕКСЫ)
  // ============================================================
  async getComplexes(): Promise<AdminComplex[]> {
    const response = await fetch(`${API_URL}/admin/complexes`);
    return response.json();
  },

  async createComplex(data: Partial<AdminComplex>): Promise<AdminComplex> {
    const response = await fetch(`${API_URL}/admin/complexes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
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
    return response.json();
  },

  async deleteComplex(id: string): Promise<void> {
    await fetch(`${API_URL}/admin/complexes/${id}`, { method: "DELETE" });
  },

  // ============================================================
  // ПРОГРАММЫ
  // ============================================================
  async getPrograms(): Promise<AdminProgram[]> {
    const response = await fetch(`${API_URL}/admin/programs`);
    return response.json();
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
    return response.json();
  },

  // ============================================================
  // СТАВКИ
  // ============================================================
  async getRates(): Promise<AdminRate[]> {
    const response = await fetch(`${API_URL}/admin/rates`);
    return response.json();
  },

  async createRate(data: Partial<AdminRate>): Promise<AdminRate> {
    const response = await fetch(`${API_URL}/admin/rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateRate(id: string, data: Partial<AdminRate>): Promise<AdminRate> {
    const response = await fetch(`${API_URL}/admin/rates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteRate(id: string): Promise<void> {
    await fetch(`${API_URL}/admin/rates/${id}`, { method: "DELETE" });
  },

  // ============================================================
  // СУБСИДИИ
  // ============================================================
  async getSubsidies(): Promise<AdminSubsidy[]> {
    const response = await fetch(`${API_URL}/admin/subsidies`);
    return response.json();
  },

  async createSubsidy(data: Partial<AdminSubsidy>): Promise<AdminSubsidy> {
    const response = await fetch(`${API_URL}/admin/subsidies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
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
    return response.json();
  },

  async deleteSubsidy(id: string): Promise<void> {
    await fetch(`${API_URL}/admin/subsidies/${id}`, { method: "DELETE" });
  },

  // ============================================================
  // КОНФИГУРАЦИЯ
  // ============================================================
  async getConfig(): Promise<AdminConfig> {
    const response = await fetch(`${API_URL}/admin/config`);
    return response.json();
  },

  async updateConfig(data: Partial<AdminConfig>): Promise<AdminConfig> {
    const response = await fetch(`${API_URL}/admin/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
