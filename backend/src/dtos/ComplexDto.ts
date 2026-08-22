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
  createdAt: Date;
  updatedAt: Date;
  apartmentTypes?: any[];
}
