// frontend/src/pages/Admin/sections/offers/types/index.ts

import { AdminBank, AdminOffer } from "../../../types/admin.types";

export interface DynamicRate {
  id?: string;
  conditionType: string;
  condition: string;
  value: number | null;
  minValue: number | null;
  maxValue: number | null;
  rate: number;
  priority: number;
  description: string;
  isActive: boolean;
  useComplexCondition?: boolean;
  conditionMetadata?: {
    pvMin?: number | null;
    pvMax?: number | null;
    amountMin?: number | null;
    amountMax?: number | null;
    termMin?: number | null;
    termMax?: number | null;
  };
}

// 🔥 НОВАЯ СТРУКТУРА ДЛЯ СУБСИДИЙ (ИДЕНТИЧНАЯ СТАВКАМ!)
export interface DynamicSubsidy {
  id?: string;
  conditionType: string; // ← было minPVPercent
  condition: string; // ← было maxPVPercent
  value: number | null; // ← было minAmount
  minValue: number | null; // ← было maxAmount
  maxValue: number | null; // ← было minTerm
  rate: number; // ← было subsidyPercent
  priority: number;
  description: string;
  isActive: boolean;
  useComplexCondition?: boolean;
  conditionMetadata?: {
    pvMin?: number | null;
    pvMax?: number | null;
    amountMin?: number | null;
    amountMax?: number | null;
    termMin?: number | null;
    termMax?: number | null;
  };
}

export interface DynamicData {
  rates: DynamicRate[];
  subsidies: DynamicSubsidy[];
}

export interface OfferCardProps {
  offer: AdminOffer;
  programIsActive: boolean;
  bankIsActive: boolean;
  dynamicData?: DynamicData;
  onEdit: (offer: AdminOffer) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
  getDisplayRate: (offer: AdminOffer) => React.ReactNode;
  getDisplaySubsidy: (offer: AdminOffer) => { display: string; type: string };
  renderComplexesList: (
    complexes: string[] | null | undefined,
  ) => React.ReactNode;
}

export interface ProgramGroupProps {
  programId: string;
  programLabel: string;
  programType: string;
  programIsActive: boolean;
  bankIsActive: boolean;
  offers: AdminOffer[];
  dynamicDataMap: Record<string, DynamicData>;
  onEdit: (offer: AdminOffer) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
  getDisplayRate: (offer: AdminOffer) => React.ReactNode;
  getDisplaySubsidy: (offer: AdminOffer) => { display: string; type: string };
  renderComplexesList: (
    complexes: string[] | null | undefined,
  ) => React.ReactNode;
}

export interface BankTabsProps {
  banks: AdminBank[];
  offers: AdminOffer[];
  selectedBankId: string;
  onSelect: (bankId: string) => void;
}
