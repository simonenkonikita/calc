// frontend/src/pages/Admin/sections/offers/types/index.ts

import { AdminBank, AdminOffer } from "../../../types/admin.types";
import { DisplayRateResult, DisplaySubsidyResult } from "../utils/offerHelpers";

export interface DynamicRate {
  id?: string;
  // 🔥 ТОЛЬКО conditionMetadata (сложные условия)
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
  description: string;
  isActive: boolean;
}

// 🔥 НОВАЯ СТРУКТУРА ДЛЯ СУБСИДИЙ (ИДЕНТИЧНАЯ СТАВКАМ!)
export interface DynamicSubsidy {
  id?: string;
  // 🔥 ТОЛЬКО conditionMetadata (сложные условия)
  conditionMetadata: {
    amountMin?: number | null;
    amountMax?: number | null;
    pvMin?: number | null;
    pvMax?: number | null;
    termMin?: number | null;
    termMax?: number | null;
  };
  // 🔥 Пороговая логика (только для субсидий)
  tolerance: number; // всегда в процентах
  subsidyPercent: number; // ← было rate
  priority: number;
  description: string;
  isActive: boolean;
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
  // 🔥 Обновленные типы
  getDisplayRate: (
    offer: AdminOffer,
    dynamicDataMap?: Record<string, DynamicData> | DynamicData,
  ) => DisplayRateResult;
  getDisplaySubsidy: (
    offer: AdminOffer,
    dynamicDataMap?: Record<string, DynamicData> | DynamicData,
  ) => DisplaySubsidyResult;
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
