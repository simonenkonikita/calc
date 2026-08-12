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

export interface DynamicSubsidy {
  id?: string;
  minPVPercent: number | null;
  maxPVPercent: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  minTerm: number | null;
  maxTerm: number | null;
  subsidyPercent: number;
  priority: number;
  description: string;
  roundingStrategy: string | null;
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
  getDisplayRate: (offer: AdminOffer) => React.ReactNode;
  getDisplaySubsidy: (offer: AdminOffer) => { display: string; type: string };
  renderComplexesList: (complexes: string[] | null | undefined) => string;
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
  renderComplexesList: (complexes: string[] | null | undefined) => string;
}

export interface BankTabsProps {
  banks: AdminBank[];
  offers: AdminOffer[];
  selectedBankId: string;
  onSelect: (bankId: string) => void;
}
