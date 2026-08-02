const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const api = {
  async calculate(formData: any, pricePerSquareMeter?: number) {
    const response = await fetch(`${API_URL}/calculator/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formData, pricePerSquareMeter }),
    });
    return response.json();
  },

  async getComplexes() {
    const response = await fetch(`${API_URL}/calculator/complexes`);
    return response.json();
  },

  async getComplexTypes(complexName: string) {
    const response = await fetch(
      `${API_URL}/calculator/complexes/${encodeURIComponent(complexName)}/types`,
    );
    return response.json();
  },

  async getPrice(complex: string, type: string) {
    const response = await fetch(
      `${API_URL}/calculator/price?complex=${encodeURIComponent(complex)}&type=${encodeURIComponent(type)}`,
    );
    return response.json();
  },

  async getAvailableBanks(complexName: string, apartmentType: string) {
    const response = await fetch(
      `${API_URL}/calculator/banks/${encodeURIComponent(complexName)}/${encodeURIComponent(apartmentType)}`,
    );
    return response.json();
  },

  async getAllBanks() {
    const response = await fetch(`${API_URL}/banks`);
    return response.json();
  },

  async getAllOffers() {
    const response = await fetch(`${API_URL}/banks/offers`);
    return response.json();
  },

  async getLimits() {
    const response = await fetch(`${API_URL}/limits`);
    return response.json();
  },

  async getTrancheData() {
    const response = await fetch(`${API_URL}/calculator/tranche-data`);
    return response.json();
  },

  async getProjects() {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async getProjectById(id: string) {
    const response = await fetch(`${API_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
