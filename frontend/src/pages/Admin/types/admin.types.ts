// frontend/src/pages/Admin/types/admin.types.ts

export interface AdminBank {
  id: string;
  name: string;
  baseRate: number;
  minPVPercent: number;
  isActive: boolean;
  order: number;
}

export interface AdminComplex {
  id: string;
  name: string;
  status: "строится" | "сдан" | "проект";
  description: string;
  pricePerSquareMeter: number;
  banks: string[];
  surcharges: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
  paymentTerms: string[];
  promotions: string[];
  specialOffers: string[];
  materialsLink: string;
  isActive: boolean;
}

export interface AdminProgram {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  isActive: boolean;
}

export interface AdminRate {
  id: string;
  bankId: string;
  programType: string;
  conditionType: "pv" | "amount" | "term";
  condition: "gte" | "lte" | "lt" | "gt" | "eq";
  value: number;
  rate: number;
  priority: number;
  description: string;
  isActive: boolean;
}

export interface AdminSubsidy {
  id: string;
  bankId: string;
  programType: string;
  minPVPercent: number;
  maxPVPercent: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  minTerm: number | null;
  maxTerm: number | null;
  subsidyPercent: number;
  priority: number;
  description: string;
  isActive: boolean;
}

export interface AdminConfig {
  depositAmount: number;
  minDownPayment: number;
  maxLoanTerm: number;
  defaultComplex: string;
  bankOrder: string[];
}
