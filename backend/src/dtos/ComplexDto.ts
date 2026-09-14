// backend/src/dtos/ComplexDto.ts

export interface CreateComplexDTO {
  name: string;
  status: "строится" | "сдан" | "проект";
  description?: string;
  banks?: string[];
  paymentTerms?: string[];
  promotions?: string[];
  specialOffers?: string[];
  materialsLink?: string;
  isActive?: boolean;
  companyId: string; // 🔥 ОБЯЗАТЕЛЬНОЕ ПОЛЕ
}

export interface UpdateComplexDTO {
  name?: string;
  status?: "строится" | "сдан" | "проект";
  description?: string;
  banks?: string[];
  paymentTerms?: string[];
  promotions?: string[];
  specialOffers?: string[];
  materialsLink?: string;
  isActive?: boolean;
  companyId?: string; // 🔥 Опционально при обновлении
}

export interface ComplexResponseDTO {
  id: string;
  slug: string;
  name: string;
  status: string;
  description: string;
  banks: string[];
  paymentTerms: string[];
  promotions: string[];
  specialOffers: string[];
  materialsLink: string;
  isActive: boolean;
  companyId: string; // 🔥 Добавляем в ответ
  company?: {
    id: string;
    name: string;
    slug: string;
  }; // 🔥 Опционально, если нужна информация о компании
  createdAt: Date;
  updatedAt: Date;
  apartmentTypes?: Array<{
    id: string;
    type: string;
    pricePerSquareMeter: number;
    surcharges?: {
      withoutDownPayment: number;
      partialDownPayment: number;
    };
  }>;
}

// 🔥 DTO для создания типа квартиры
export interface CreateApartmentTypeDTO {
  type: string;
  pricePerSquareMeter: number;
  surcharges?: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
}

export interface UpdateApartmentTypeDTO {
  type?: string;
  pricePerSquareMeter?: number;
  surcharges?: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
  isActive?: boolean;
}
