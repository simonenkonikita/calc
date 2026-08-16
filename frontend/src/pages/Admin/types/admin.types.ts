// frontend/src/pages/Admin/types/admin.types.ts

import { DynamicRate, DynamicSubsidy } from "../sections/offers";

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
  createdAt?: string;
  updatedAt?: string;
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

export interface AdminRate {
  id: string;
  offerId: string;
  conditionType: "pv" | "amount" | "term";
  condition: "gte" | "lte" | "lt" | "gt" | "eq";
  value: number | null;
  minValue: number | null;
  maxValue: number | null;
  rate: number;
  priority: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSubsidy {
  id: string;
  offerId: string;
  minPVPercent: number | null;
  maxPVPercent: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  minTerm: number | null;
  maxTerm: number | null;
  subsidyPercent: number;
  priority: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
  excessLimit: boolean;
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
  dynamicRates?: DynamicRate[];
  dynamicSubsidies?: DynamicSubsidy[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminConfig {
  depositAmount: number;
  minDownPayment: number;
  maxLoanTerm: number;
  defaultComplex: string;
  bankOrder: string[];
  createdAt?: string;
  updatedAt?: string;
}
