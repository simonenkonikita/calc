// frontend/src/services/programService.ts

import { api } from "./api";

export interface ProgramConfig {
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface ProgramsResponse {
  success: boolean;
  data?: {
    programs: ProgramConfig[];
    categories: Array<{
      key: string;
      label: string;
      types: string[];
    }>;
  };
  error?: string;
}

export const programService = {
  // 🔥 Получить все программы
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

  // 🔥 Получить программы для ЖК
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
};
