// frontend/src/pages/Admin/types/admin.types.ts

import { User, Company } from "../../../types/auth.types";

export interface AdminUser extends Omit<User, "company"> {
  company?: Company | null;
  createdBy?: AdminUser;
  createdUsers?: AdminUser[];
}

export interface AdminCompany extends Company {
  admin?: AdminUser;
  users?: AdminUser[];
  createdBy?: AdminUser;
}

export interface AdminBank {
  id: string;
  name: string;
  slug?: string;
  baseRate: number;
  minPVPercent: number;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminApartmentType {
  id: string;
  type: string;
  pricePerSquareMeter: number;
  surcharges: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
  isActive: boolean;
  complexId: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// ADMIN COMPLEX - С ОБЯЗАТЕЛЬНЫМ companyId
// ============================================================
export interface AdminComplex {
  id: string;
  name: string;
  slug?: string;
  status: "строится" | "сдан" | "проект";
  description: string;
  banks: string[];
  paymentTerms: string[];
  promotions: string[];
  specialOffers: string[];
  materialsLink: string;
  isActive: boolean;
  apartmentTypes: AdminApartmentType[];
  companyId: string;
  company?: AdminCompany;
  createdById?: string;
  createdBy?: AdminUser;
  updatedById?: string;
  updatedBy?: AdminUser;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// DTO ДЛЯ СОЗДАНИЯ ЖК (фронтенд -> бэкенд)
// ============================================================
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
  companyId: string;
  apartmentTypes?: Array<{
    type: string;
    pricePerSquareMeter: number;
    surcharges?: {
      withoutDownPayment: number;
      partialDownPayment: number;
    };
    isActive?: boolean;
  }>;
}

// ============================================================
// DTO ДЛЯ ОБНОВЛЕНИЯ ЖК (фронтенд -> бэкенд)
// ============================================================
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
  companyId?: string;
}

export interface AdminProgram {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// ДИНАМИЧЕСКИЕ СТАВКИ
// ============================================================
export interface AdminRate {
  id: string;
  offerId: string;
  conditionMetadata: {
    amountMin?: number | null;
    amountMax?: number | null;
    pvMin?: number | null;
    pvMax?: number | null;
    termMin?: number | null;
    termMax?: number | null;
  };
  rate: number;
  priority: number;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// ДИНАМИЧЕСКИЕ СУБСИДИИ
// ============================================================
export interface AdminSubsidy {
  id: string;
  offerId: string;
  conditionMetadata: {
    amountMin?: number | null;
    amountMax?: number | null;
    pvMin?: number | null;
    pvMax?: number | null;
    termMin?: number | null;
    termMax?: number | null;
  };
  tolerance: number;
  subsidyPercent: number;
  priority: number;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// OFFER
// ============================================================
export interface AdminOffer {
  id: string;
  program: string;
  rate: number;
  twoRate: number | null;
  shortRate: number | null;
  subsidyPercent: number;
  minPVPercent: number;
  durationMonths: number | null;
  isTwoContracts: boolean;
  isExcessLimit: boolean;
  isTranche: boolean;
  trancheFirstPercent: number | null;
  trancheSecondDate: string | null;
  complexes: string[];
  subsidyCalculationMethod: string | null;
  thresholdTolerance: number | null;
  thresholdToleranceType: string | null;
  roundingStrategy: string | null;
  minLoanTermYears: number | null;
  description: string | null;
  isActive: boolean;
  bankId: string;
  programId: string;
  bank?: AdminBank;
  programEntity?: AdminProgram;
  companyId?: string;
  company?: AdminCompany;
  createdById?: string;
  createdBy?: AdminUser;
  updatedById?: string;
  updatedBy?: AdminUser;
  dynamicRates?: AdminRate[];
  dynamicSubsidies?: AdminSubsidy[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BankOrderItem {
  name: string;
  displayOrder: number;
}

export interface AdminConfig {
  id: string;
  familyMortgageLimit: number;
  maxFamilyMortgageLimit: number;
  itMortgageLimit: number;
  maxItMortgageLimit: number;
  minArea: number;
  maxArea: number;
  minDownPaymentPercent: number;
  maxDownPaymentPercent: number;
  minLoanTerm: number;
  maxLoanTerm: number;
  deposit: number;
  bankOrder: BankOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTO ДЛЯ СОЗДАНИЯ/ОБНОВЛЕНИЯ
// ============================================================

export interface CreateAdminRateDTO {
  conditionMetadata: {
    amountMin?: number | null;
    amountMax?: number | null;
    pvMin?: number | null;
    pvMax?: number | null;
    termMin?: number | null;
    termMax?: number | null;
  };
  rate: number;
  priority?: number;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateAdminSubsidyDTO {
  conditionMetadata: {
    amountMin?: number | null;
    amountMax?: number | null;
    pvMin?: number | null;
    pvMax?: number | null;
    termMin?: number | null;
    termMax?: number | null;
  };
  tolerance?: number;
  subsidyPercent: number;
  priority?: number;
  description?: string | null;
  isActive?: boolean;
}

export interface AdminConfigUpdate {
  familyMortgageLimit?: number;
  maxFamilyMortgageLimit?: number;
  itMortgageLimit?: number;
  maxItMortgageLimit?: number;
  minArea?: number;
  maxArea?: number;
  minDownPaymentPercent?: number;
  maxDownPaymentPercent?: number;
  minLoanTerm?: number;
  maxLoanTerm?: number;
  deposit?: number;
  bankOrder?: BankOrderItem[];
}
